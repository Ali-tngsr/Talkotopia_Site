const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

type ApiRequestOptions = RequestInit & {
  token?: string;
};

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function getErrorMessage(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return "خطایی رخ داد. لطفاً دوباره تلاش کنید.";
  }

  const apiPayload = payload as ApiErrorPayload;

  if (Array.isArray(apiPayload.message)) {
    return apiPayload.message.join("، ");
  }

  return (
    apiPayload.message ??
    apiPayload.error ??
    "خطایی رخ داد. لطفاً دوباره تلاش کنید."
  );
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload), response.status, payload);
  }

  return payload as T;
}

export type AuthResponse = {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
};

export type RegisterResponse = {
  message?: string;
  email?: string;
};

export function getAccessTokenFromResponse(response: AuthResponse) {
  return response.accessToken ?? response.access_token;
}

export function getRefreshTokenFromResponse(response: AuthResponse) {
  return response.refreshToken ?? response.refresh_token;
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyOtp(input: { email: string; otp: string }) {
  return apiRequest<AuthResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
