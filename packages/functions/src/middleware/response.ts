import { generateRequestId } from "@ferryhook/core";
import type {
  ErrorCode,
  ErrorDetail,
  ApiResponse,
  PaginatedApiResponse,
  ApiErrorResponse,
} from "@ferryhook/core";

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export function success<T>(data: T, statusCode = 200): LambdaResponse {
  const response: ApiResponse<T> = {
    data,
    meta: { requestId: generateRequestId() },
  };
  return {
    statusCode,
    headers: SECURITY_HEADERS,
    body: JSON.stringify(response),
  };
}

export function paginated<T>(
  data: T[],
  cursor: string | null,
  hasMore: boolean
): LambdaResponse {
  const response: PaginatedApiResponse<T> = {
    data,
    meta: {
      requestId: generateRequestId(),
      cursor,
      hasMore,
    },
  };
  return {
    statusCode: 200,
    headers: SECURITY_HEADERS,
    body: JSON.stringify(response),
  };
}

export function error(
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: ErrorDetail[]
): LambdaResponse {
  const response: ApiErrorResponse = {
    error: { code, message, details },
    meta: { requestId: generateRequestId() },
  };
  return {
    statusCode,
    headers: SECURITY_HEADERS,
    body: JSON.stringify(response),
  };
}

export function unauthorized(): LambdaResponse {
  return error(401, "UNAUTHORIZED", "Missing or invalid authentication");
}

export function forbidden(message = "Insufficient permissions"): LambdaResponse {
  return error(403, "FORBIDDEN", message);
}

export function notFound(resource = "Resource"): LambdaResponse {
  return error(404, "NOT_FOUND", `${resource} not found`);
}

export function validationError(details: ErrorDetail[]): LambdaResponse {
  return error(400, "VALIDATION_ERROR", "Validation failed", details);
}

export function rateLimited(): LambdaResponse {
  return error(429, "RATE_LIMITED", "Too many requests");
}

export function internalError(): LambdaResponse {
  return error(500, "INTERNAL_ERROR", "An unexpected error occurred");
}

export function setCookie(
  response: LambdaResponse,
  name: string,
  value: string,
  maxAge: number
): LambdaResponse {
  return {
    ...response,
    headers: {
      ...response.headers,
      "Set-Cookie": `${name}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`,
    },
  };
}
