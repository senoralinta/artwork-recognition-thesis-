import { API_URL } from "../config";

export class ApiError extends Error {
  status: number;
  detail: string;

  // status 0 means the server could not be reached at all.
  constructor(status: number, detail = "") {
    super(detail || `Request failed with status ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

export type RequestOptions = {
  method?: string;
  token?: string | null;
  json?: unknown;
  form?: Record<string, string>;
  body?: FormData;
  timeoutMs?: number;
};

function encodeForm(values: Record<string, string>): string {
  return Object.entries(values)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractDetail(data: unknown): string {
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail: unknown }).detail;
    if (typeof detail === "string") {
      return detail;
    }
  }
  return "";
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: string | FormData | undefined;

  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  } else if (options.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = encodeForm(options.form);
  } else if (options.body) {
    // The multipart boundary is added by fetch, so no Content-Type header here.
    body = options.body;
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 30000);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0);
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? parseJson(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, extractDetail(data));
  }
  return data as T;
}
