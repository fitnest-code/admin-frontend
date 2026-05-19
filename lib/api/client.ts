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

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.ok)
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
    const refreshed = await refreshAccessToken();
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

export const apiDelete = <T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) => 
  apiRequest<T>(path, { ...options, method: "DELETE" });