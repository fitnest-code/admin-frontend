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

function makeQueryString(params: RequestOptions["params"]) {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === null || item === undefined) return;
        searchParams.append(key, String(item));
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
    if ("message" in payload) {
      return String((payload as any).message);
    }

    if (
      "error" in payload &&
      typeof (payload as any).error === "object" &&
      (payload as any).error !== null
    ) {
      const errorObj = (payload as any).error;

      if ("message" in errorObj && errorObj.message) {
        return String(errorObj.message);
      }
    }
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
  const requestHeaders = new Headers(headers);

  const isFormData = body instanceof FormData;

  /**
   * Səndə token localStorage-da deyil.
   * Token cookie-dədir:
   * - fn_admin_access_token
   * - fn_admin_refresh_token
   *
   * Ona görə Authorization header manual əlavə edilmir.
   * Cookie credentials: "include" ilə göndərilir.
   */

  if (
    !isFormData &&
    body !== undefined &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (isFormData) {
    requestHeaders.delete("Content-Type");
  }

  console.log("API REQUEST URL:", requestUrl);
  console.log("API METHOD:", init.method);
  console.log("IS FORM DATA:", isFormData);

  if (isFormData && body instanceof FormData) {
    for (const [key, value] of body.entries()) {
      if (value instanceof File) {
        console.log("FORMDATA FILE:", key, {
          name: value.name,
          type: value.type,
          size: value.size,
        });
      } else {
        console.log("FORMDATA FIELD:", key, value);
      }
    }
  }

  const response = await fetch(requestUrl, {
    ...init,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
    cache: "no-store",
    credentials: "include",
  });

  const payload = isJsonResponse(response)
    ? await response.json().catch(() => null)
    : await response.text();

  console.log("API RESPONSE STATUS:", response.status);
  console.log("API RESPONSE PAYLOAD:", payload);

  if (response.status === 401 && auth && !_retried && !isAuthRoute) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return apiRequest<T>(path, { ...options, _retried: true });
    }
  }

  if (!response.ok) {
    let fallback = `API request failed with status ${response.status}`;
    if (response.status === 413) {
      fallback = "Yüklənilən məlumat çox böyükdür (Maksimum limit keçilib)";
    }

    const message = extractApiErrorMessage(payload, fallback);
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export function apiGet<T>(
  path: string,
  options: Omit<RequestOptions, "method" | "body"> = {},
) {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options: Omit<RequestOptions, "method" | "body"> = {},
) {
  return apiRequest<T>(path, { ...options, method: "POST", body });
}

export function apiPut<T>(
  path: string,
  body?: unknown,
  options: Omit<RequestOptions, "method" | "body"> = {},
) {
  return apiRequest<T>(path, { ...options, method: "PUT", body });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options: Omit<RequestOptions, "method" | "body"> = {},
) {
  return apiRequest<T>(path, { ...options, method: "PATCH", body });
}

export function apiDelete<T>(
  path: string,
  options: Omit<RequestOptions, "method" | "body"> = {},
) {
  return apiRequest<T>(path, { ...options, method: "DELETE" });
}