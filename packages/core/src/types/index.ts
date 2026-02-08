export type Plan = "free" | "starter" | "pro" | "team";

export type EventStatus =
  | "received"
  | "processing"
  | "filtered"
  | "signature_failed"
  | "delivered"
  | "retrying"
  | "failed";

export type SourceStatus = "active" | "paused" | "deleted";

export type ConnectionStatus = "active" | "paused" | "deleted";

export type Provider =
  | "stripe"
  | "github"
  | "shopify"
  | "twilio"
  | "sendgrid"
  | "slack"
  | "custom";

export type SigningAlgorithm =
  | "stripe"
  | "github"
  | "shopify"
  | "generic-hmac-sha256"
  | "none";

export type ApiKeyPermission = "read" | "write" | "admin";

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "exists"
  | "not_exists"
  | "regex"
  | "gt"
  | "lt"
  | "gte"
  | "lte";

export interface FilterRule {
  path: string;
  operator: FilterOperator;
  value?: string | number | boolean;
}

export type TransformType = "field_map" | "passthrough" | "javascript";

export interface TransformFieldMapRule {
  from: string;
  to: string;
}

export interface TransformConfig {
  type: TransformType;
  rules?: TransformFieldMapRule[];
  code?: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
  passwordHash: string | null;
  plan: Plan;
  stripeCustomerId: string | null;
  stripeSubId: string | null;
  githubId: string | null;
  googleId: string | null;
  usageThisMonth: number;
  usagePeriodStart: string;
  createdAt: string;
  updatedAt: string;
}

export interface Source {
  sourceId: string;
  userId: string;
  name: string;
  provider: Provider;
  signingSecret: string | null;
  signingAlgorithm: SigningAlgorithm;
  status: SourceStatus;
  eventCount: number;
  lastEventAt: string | null;
  createdAt: string;
}

export interface Connection {
  connectionId: string;
  sourceId: string;
  userId: string;
  name: string;
  destinationUrl: string;
  signingSecret: string;
  filters: FilterRule[] | null;
  transform: TransformConfig | null;
  retryConfig: number[] | null;
  status: ConnectionStatus;
  deliveryCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  eventId: string;
  sourceId: string;
  userId: string;
  status: EventStatus;
  headers: string;
  body: string;
  sourceIp: string;
  contentType: string;
  method: string;
  receivedAt: number;
  processedAt: number | null;
  deliveredAt: number | null;
  expiresAt: number;
}

export interface Attempt {
  eventId: string;
  connectionId: string;
  attemptNumber: number;
  destinationUrl: string;
  statusCode: number;
  responseBody: string | null;
  latencyMs: number;
  error: string | null;
  attemptedAt: number;
}

export interface ApiKey {
  keyId: string;
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  permissions: ApiKeyPermission;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string | null;
  githubId?: string;
  googleId?: string;
}

export interface CreateSourceInput {
  userId: string;
  name: string;
  provider: Provider;
  signingSecret?: string;
  signingAlgorithm?: SigningAlgorithm;
}

export interface CreateConnectionInput {
  sourceId: string;
  userId: string;
  name: string;
  destinationUrl: string;
  filters?: FilterRule[];
  transform?: TransformConfig;
  retryConfig?: number[];
}

export interface CreateEventInput {
  sourceId: string;
  userId: string;
  headers: string;
  body: string;
  sourceIp: string;
  contentType: string;
  method: string;
  expiresAt: number;
}

export interface CreateAttemptInput {
  connectionId: string;
  destinationUrl: string;
  statusCode: number;
  responseBody?: string;
  latencyMs: number;
  error?: string;
}

export interface CreateApiKeyInput {
  name: string;
  permissions: ApiKeyPermission;
}

export interface ListOptions {
  limit?: number;
  cursor?: string;
  status?: EventStatus;
}

export interface PaginatedResult<T> {
  items: T[];
  cursor: string | null;
  hasMore: boolean;
}

export interface DeliveryTask {
  eventId: string;
  connectionId: string;
  destinationUrl: string;
  payload: string;
  headers: Record<string, string>;
  attempt: number;
  signingSecret: string;
}
