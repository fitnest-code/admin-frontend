export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
  auth?: boolean;
  params?: object;
  _retried?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

function makeUrl(path: string, isAuthRoute: boolean) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (isAuthRoute || normalized.startsWith("/api/")) {
    return normalized;
  }
  return `/api/v1${normalized}`;
}

// URLSearchParams avtomatik olaraq simvolları (ə, ö, ğ və s.) encode edir
function makeQueryString(params: RequestOptions["params"]) {
  if (!params || Object.keys(params).length === 0) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function isJsonResponse(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

function extractApiErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null) {
    const p = payload as any;
    
    // Check for "error" wrapper (Standard Spring Boot / Custom API response)
    const errorObj = p.error;
    if (errorObj && typeof errorObj === 'object') {
      // Prioritize specific field issues if present
      const fieldIssues = errorObj.details?.fieldIssues;
      if (Array.isArray(fieldIssues) && fieldIssues.length > 0) {
        return fieldIssues.map((fi: any) => fi.issue).join(", ");
      }
      if (errorObj.message) return String(errorObj.message);
    }

    if ("message" in p) return String(p.message);
  }
  return fallback;
}

/*
 * Cross-tab refresh coordination.
 * Refresh tokens are single-use server-side, and auth cookies are shared by every admin tab. If N tabs
 * hit a 401 together and each posts /api/auth/refresh, the losers present an already-consumed token and
 * get a definitive 401, which logs the whole browser out. So refreshes are serialized across tabs and a
 * tab whose request predates a completed refresh just retries with the (shared) fresh cookies.
 */
const REFRESH_LOCK_NAME = "fitnest-admin-refresh";
const REFRESH_LS_LOCK_KEY = "fn_admin_refresh_lock";
const REFRESH_LS_DONE_KEY = "fn_admin_refresh_done_at";
const AUTH_CHANNEL_NAME = "fitnest-admin-auth";
// A crashed/closed tab must not wedge refreshes forever: locks older than this are considered abandoned.
const REFRESH_LS_LOCK_STALE_MS = 15_000;
const REFRESH_LS_WAIT_MAX_MS = 15_000;
const REFRESH_LS_POLL_MS = 100;

function getAuthChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  try {
    return new BroadcastChannel(AUTH_CHANNEL_NAME);
  } catch {
    return null;
  }
}

function readLastRefreshAt(): number {
  try {
    return Number(localStorage.getItem(REFRESH_LS_DONE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function markRefreshed() {
  const at = Date.now();
  try {
    localStorage.setItem(REFRESH_LS_DONE_KEY, String(at));
  } catch {
    // Private mode / storage disabled: other tabs just refresh once more, which is still safe.
  }
  const channel = getAuthChannel();
  channel?.postMessage({ type: "refreshed", at });
  channel?.close();
}

// Only 401/403 mean the session is really gone (the route clears cookies then). 429/5xx/network errors
// leave cookies intact, so we return false and the caller keeps the old cookies until its next 401.
async function postRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
    if (res.ok) markRefreshed();
    return res.ok;
  } catch {
    return false;
  }
}

function readLsLock(): { owner: string; at: number } | null {
  try {
    const raw = localStorage.getItem(REFRESH_LS_LOCK_KEY);
    if (!raw) return null;
    const [owner, at] = raw.split(":");
    const ts = Number(at);
    if (!owner || !ts || Date.now() - ts > REFRESH_LS_LOCK_STALE_MS) return null;
    return { owner, at: ts };
  } catch {
    return null;
  }
}

// Fallback for browsers without navigator.locks: advisory localStorage lock + BroadcastChannel wake-ups.
async function refreshWithStorageLock(requestStartedAt: number): Promise<boolean> {
  const me = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  const deadline = Date.now() + REFRESH_LS_WAIT_MAX_MS;
  const channel = getAuthChannel();

  try {
    while (Date.now() < deadline) {
      if (readLastRefreshAt() >= requestStartedAt) return true;

      if (!readLsLock()) {
        try {
          localStorage.setItem(REFRESH_LS_LOCK_KEY, `${me}:${Date.now()}`);
        } catch {
          break; // storage unavailable: fall through to an uncoordinated refresh
        }
        // localStorage isn't atomic; re-read after a tick to confirm no other tab overwrote us.
        await new Promise((r) => setTimeout(r, 25));
        if (readLsLock()?.owner === me) {
          try {
            if (readLastRefreshAt() >= requestStartedAt) return true;
            return await postRefresh();
          } finally {
            try {
              if (readLsLock()?.owner === me) localStorage.removeItem(REFRESH_LS_LOCK_KEY);
            } catch {
              /* ignore */
            }
          }
        }
      }

      // Another tab is refreshing: wait for its completion broadcast, or poll as a safety net.
      await new Promise<void>((resolve) => {
        const timer = setTimeout(done, REFRESH_LS_POLL_MS);
        function done() {
          clearTimeout(timer);
          if (channel) channel.onmessage = null;
          resolve();
        }
        if (channel) channel.onmessage = done;
      });
    }
    return readLastRefreshAt() >= requestStartedAt ? true : await postRefresh();
  } finally {
    channel?.close();
  }
}

async function runSharedRefresh(requestStartedAt: number): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    return navigator.locks.request(REFRESH_LOCK_NAME, async () => {
      // Another tab may have completed a refresh while we queued for the lock; cookies are shared,
      // so we only need to retry the original request instead of burning a second single-use token.
      if (readLastRefreshAt() >= requestStartedAt) return true;
      return postRefresh();
    });
  }
  if (typeof localStorage !== "undefined") {
    return refreshWithStorageLock(requestStartedAt);
  }
  return postRefresh();
}

// requestStartedAt: when the 401'd request was sent. A refresh finishing after that moment means the
// request used a stale access token and the shared cookies are already fresh.
async function refreshAccessToken(requestStartedAt: number) {
  if (!refreshPromise) {
    refreshPromise = runSharedRefresh(requestStartedAt)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    headers,
    auth = true,
    params,
    _retried = false,
    ...init
  } = options;

  const isAuthRoute = path.startsWith("/api/auth/");
  const requestUrl = `${makeUrl(path, isAuthRoute)}${makeQueryString(params)}`;
  
  // Headers obyektini yaradırıq
  const requestHeaders = new Headers(headers);
  const isFormData = body instanceof FormData;

  // Əgər FormData deyilsə və body varsa, Content-Type-ı JSON təyin et
  if (!isFormData && body !== undefined) {
    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }
  }

  // FormData olduqda Content-Type manual təyin EDİLMƏMƏLİDİR.
  // Brauzer boundary-ni özü əlavə etməlidir.
  if (isFormData) {
    requestHeaders.delete("Content-Type");
  }

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (typeof window !== "undefined") {
    const storedLang = localStorage.getItem("fitnest-language");
    if (storedLang && !requestHeaders.has("Accept-Language")) {
      requestHeaders.set("Accept-Language", storedLang);
    }
  }

  const requestStartedAt = Date.now();
  const response = await fetch(requestUrl, {
    ...init,
    headers: requestHeaders,
    body: isFormData 
      ? (body as FormData) 
      : (body === undefined ? undefined : JSON.stringify(body)),
    cache: "no-store",
    credentials: "include", // Cookie-lər üçün vacibdir
  });

  const payload = isJsonResponse(response)
    ? await response.json().catch(() => null)
    : await response.text();

  // 401 halında token yeniləmə məntiqi
  if (response.status === 401 && auth && !_retried && !isAuthRoute) {
    const refreshed = await refreshAccessToken(requestStartedAt);
    if (refreshed) {
      return apiRequest<T>(path, { ...options, _retried: true });
    }
  }

  if (!response.ok) {
    let fallback = `API request failed with status ${response.status}`;
    if (response.status === 413) fallback = "Fayl ölçüsü çox böyükdür.";
    
    const message = extractApiErrorMessage(payload, fallback);
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

// Yardımçı metodlar
export const apiGet = <T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) => 
  apiRequest<T>(path, { ...options, method: "GET" });

export const apiPost = <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) => 
  apiRequest<T>(path, { ...options, method: "POST", body });

export const apiPut = <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) => 
  apiRequest<T>(path, { ...options, method: "PUT", body });

export const apiPatch = <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) => 
  apiRequest<T>(path, { ...options, method: "PATCH", body });

export const apiDelete = <T>(path: string, options: Omit<RequestOptions, "method"> = {}) => 
  apiRequest<T>(path, { ...options, method: "DELETE" });