const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const EXEMPT_FROM_REFRESH = new Set(["/auth/login", "/auth/refresh", "/auth/logout"]);

export class ApiClientError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  details?: unknown;
}

let refreshInFlight: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function redirectToLogin(): void {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const doFetch = () =>
    fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: "include",
    });

  let response = await doFetch();

  if (response.status === 401 && !EXEMPT_FROM_REFRESH.has(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await doFetch();
    } else {
      redirectToLogin();
    }
  }

  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !envelope?.success) {
    if (response.status === 401 && !EXEMPT_FROM_REFRESH.has(path)) {
      redirectToLogin();
    }
    throw new ApiClientError(
      response.status,
      envelope?.message ?? `Request failed with status ${response.status}`,
      envelope?.details,
    );
  }

  return envelope.data as T;
}
