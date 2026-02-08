export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
  };
}

export interface PaginatedApiResponse<T> {
  data: T[];
  meta: {
    requestId: string;
    cursor: string | null;
    hasMore: boolean;
  };
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetail[];
  };
  meta: {
    requestId: string;
  };
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "PLAN_LIMIT_REACHED"
  | "INTERNAL_ERROR";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
  };
  accessToken: string;
  expiresIn: number;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface SourceResponse {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: string;
  eventCount: number;
  lastEventAt: string | null;
  createdAt: string;
}

export interface ConnectionResponse {
  id: string;
  sourceId: string;
  name: string;
  destinationUrl: string;
  filters: unknown[] | null;
  transform: unknown | null;
  status: string;
  deliveryCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventResponse {
  id: string;
  sourceId: string;
  status: string;
  headers: Record<string, string>;
  body: string;
  sourceIp: string;
  receivedAt: string;
  processedAt: string | null;
  deliveredAt: string | null;
  attempts?: AttemptResponse[];
}

export interface AttemptResponse {
  number: number;
  connectionId: string;
  destinationUrl: string;
  statusCode: number;
  latencyMs: number;
  error: string | null;
  attemptedAt: string;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  permissions: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreateResponse extends ApiKeyResponse {
  key: string;
}
