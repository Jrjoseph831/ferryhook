import type { Metadata } from "next";
import { CodeBlock } from "@/components/marketing/CodeBlock";

export const metadata: Metadata = {
  title: "API Reference",
  description: "Complete REST API documentation for Ferryhook. Endpoints, schemas, and cURL examples.",
};

function Endpoint({
  method,
  path,
  description,
  auth,
  body,
  response,
  curl,
  notes,
}: {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  body?: string;
  response?: string;
  curl?: string;
  notes?: string;
}) {
  const methodColor =
    method === "GET" ? "bg-emerald-500/15 text-emerald-400" :
    method === "POST" ? "bg-blue-500/15 text-blue-400" :
    method === "PATCH" ? "bg-amber-500/15 text-amber-400" :
    "bg-red-500/15 text-red-400";

  return (
    <div className="mt-8 rounded-xl border border-slate-800/60 bg-slate-900/10 p-5">
      <div className="flex items-center gap-3">
        <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold ${methodColor}`}>
          {method}
        </span>
        <code className="font-mono text-sm text-slate-200">{path}</code>
        {auth && <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">AUTH</span>}
      </div>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      {notes && <p className="mt-1 text-xs text-slate-500 italic">{notes}</p>}
      {body && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-slate-500">Request Body</p>
          <CodeBlock code={body} language="json" />
        </div>
      )}
      {response && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-slate-500">Response</p>
          <CodeBlock code={response} language="json" />
        </div>
      )}
      {curl && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-slate-500">Example</p>
          <CodeBlock code={curl} language="bash" />
        </div>
      )}
    </div>
  );
}

export default function ApiReferencePage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white">API Reference</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-400">
        The Ferryhook REST API lets you manage sources, connections, events, and API keys programmatically.
      </p>

      {/* Base URLs */}
      <div className="mt-8 rounded-xl border border-slate-800/60 bg-slate-900/20 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Base URLs</h3>
        <div className="mt-3 space-y-2 font-mono text-sm">
          <p><span className="text-slate-500">Webhook Ingestion:</span> <span className="text-blue-400">https://hooks.ferryhook.io</span></p>
          <p><span className="text-slate-500">Management API:</span> <span className="text-blue-400">https://api.ferryhook.io</span></p>
        </div>
      </div>

      {/* Authentication */}
      <div className="mt-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Authentication</h3>
        <p className="mt-2 text-sm text-slate-400">
          All management endpoints accept either a JWT token or an API key:
        </p>
        <div className="mt-3">
          <CodeBlock
            language="bash"
            code={`# JWT (from login/signup)
$ curl -H "Authorization: Bearer eyJhbGciOiJFUzI1NiIs..."

# API Key
$ curl -H "Authorization: Bearer fh_live_a1b2c3d4e5f6g7h8..."`}
          />
        </div>
      </div>

      {/* Auth Endpoints */}
      <h2 className="mt-14 font-display text-xl font-bold text-white">Auth</h2>

      <Endpoint
        method="POST"
        path="/v1/auth/signup"
        description="Create a new account. Returns an access token and sets a refresh token cookie."
        body={`{
  "email": "dev@example.com",
  "password": "securepassword123",
  "name": "Jane Developer"
}`}
        response={`{
  "data": {
    "user": {
      "id": "usr_a1b2c3d4",
      "email": "dev@example.com",
      "name": "Jane Developer",
      "plan": "free"
    },
    "accessToken": "eyJhbG...",
    "expiresIn": 3600
  }
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/auth/login"
        description="Authenticate with email and password. Returns access token and sets httpOnly refresh cookie."
        body={`{
  "email": "dev@example.com",
  "password": "securepassword123"
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/auth/refresh"
        description="Exchange refresh token cookie for a new access token."
        notes="No request body needed. Uses the httpOnly refresh token cookie."
      />

      {/* Sources */}
      <h2 className="mt-14 font-display text-xl font-bold text-white">Sources</h2>

      <Endpoint
        method="POST"
        path="/v1/sources"
        auth
        description="Create a new webhook source."
        body={`{
  "name": "Stripe Production",
  "provider": "stripe",
  "signingSecret": "whsec_...",
  "signingAlgorithm": "stripe"
}`}
        response={`{
  "data": {
    "id": "src_a1b2c3d4e5f6g7h8",
    "name": "Stripe Production",
    "provider": "stripe",
    "url": "https://hooks.ferryhook.io/in/src_a1b2c3d4e5f6g7h8",
    "status": "active",
    "eventCount": 0,
    "createdAt": "2026-02-08T12:00:00Z"
  }
}`}
        notes={`provider: stripe | github | shopify | twilio | sendgrid | slack | custom\nsigningAlgorithm: stripe | github | shopify | generic-hmac-sha256 | none`}
      />

      <Endpoint method="GET" path="/v1/sources" auth description="List all sources for the authenticated user." />
      <Endpoint method="GET" path="/v1/sources/{sourceId}" auth description="Get a single source by ID." />
      <Endpoint
        method="PATCH"
        path="/v1/sources/{sourceId}"
        auth
        description="Update a source. Can change name, status (active/paused), or signing secret."
        body={`{
  "name": "Stripe Staging",
  "status": "paused"
}`}
      />
      <Endpoint method="DELETE" path="/v1/sources/{sourceId}" auth description="Delete a source and all its connections." />

      {/* Connections */}
      <h2 className="mt-14 font-display text-xl font-bold text-white">Connections</h2>

      <Endpoint
        method="POST"
        path="/v1/sources/{sourceId}/connections"
        auth
        description="Create a connection from a source to a destination."
        body={`{
  "name": "Main Server",
  "destinationUrl": "https://api.myapp.com/webhooks/stripe",
  "filters": [
    {
      "path": "$.type",
      "operator": "equals",
      "value": "payment_intent.succeeded"
    }
  ]
}`}
        notes="Filter operators: equals | not_equals | contains | not_contains | exists | not_exists | regex | gt | lt | gte | lte"
      />

      <Endpoint method="GET" path="/v1/sources/{sourceId}/connections" auth description="List all connections for a source." />
      <Endpoint method="PATCH" path="/v1/connections/{connectionId}" auth description="Update a connection's name, URL, filters, or transforms." />
      <Endpoint method="DELETE" path="/v1/connections/{connectionId}" auth description="Delete a connection." />

      {/* Events */}
      <h2 className="mt-14 font-display text-xl font-bold text-white">Events</h2>

      <Endpoint
        method="POST"
        path="https://hooks.ferryhook.io/in/{sourceId}"
        description="Send a webhook event. Accepts any content type. Returns 200 immediately after queuing."
        response={`{
  "id": "evt_a1b2c3d4e5f6g7h8",
  "status": "received"
}`}
        curl={`$ curl -X POST https://hooks.ferryhook.io/in/src_a1b2c3 \\
    -H "Content-Type: application/json" \\
    -d '{"event": "test"}'`}
      />

      <Endpoint
        method="GET"
        path="/v1/sources/{sourceId}/events"
        auth
        description="List events for a source. Supports pagination and status filtering."
        notes="Query params: limit (1-100), cursor, status (received | filtered | delivered | retrying | failed)"
      />

      <Endpoint method="GET" path="/v1/events/{eventId}" auth description="Get full event detail including headers, body, and delivery attempts." />

      <Endpoint
        method="POST"
        path="/v1/events/{eventId}/replay"
        auth
        description="Replay an event to its connections. Optionally specify which connections to replay to."
        body={`{
  "connectionIds": ["conn_abc"]
}`}
        notes="If no connectionIds provided, replays to all active connections on the source."
      />

      <Endpoint
        method="POST"
        path="/v1/events/replay"
        auth
        description="Bulk replay multiple events."
        body={`{
  "eventIds": ["evt_a1b2", "evt_c3d4"],
  "connectionIds": ["conn_abc"]
}`}
      />

      {/* API Keys */}
      <h2 className="mt-14 font-display text-xl font-bold text-white">API Keys</h2>

      <Endpoint
        method="POST"
        path="/v1/api-keys"
        auth
        description="Create a new API key. The raw key is only returned once — store it securely."
        body={`{
  "name": "Production Server",
  "permissions": "write"
}`}
        response={`{
  "data": {
    "id": "key_a1b2c3",
    "name": "Production Server",
    "key": "fh_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "prefix": "fh_live_a1",
    "permissions": "write"
  }
}`}
      />

      <Endpoint method="GET" path="/v1/api-keys" auth description="List all API keys. Returns prefix and name only (no raw key)." />
      <Endpoint method="DELETE" path="/v1/api-keys/{keyId}" auth description="Revoke an API key immediately." />

      {/* Billing */}
      <h2 className="mt-14 font-display text-xl font-bold text-white">Billing</h2>

      <Endpoint method="POST" path="/v1/billing/checkout" auth description="Create a Stripe checkout session for upgrading to a paid plan." body={`{ "plan": "starter" }`} />
      <Endpoint method="POST" path="/v1/billing/portal" auth description="Create a Stripe billing portal session for managing subscriptions." />

      {/* Analytics */}
      <h2 className="mt-14 font-display text-xl font-bold text-white">Analytics</h2>

      <Endpoint
        method="GET"
        path="/v1/analytics/overview?period=7d"
        auth
        description="Get analytics overview for the specified period."
        notes="period: 24h | 7d | 30d"
        response={`{
  "data": {
    "period": "7d",
    "totalEvents": 12450,
    "deliveredEvents": 12300,
    "failedEvents": 50,
    "deliverySuccessRate": 0.996,
    "avgLatencyMs": 145,
    "p95LatencyMs": 320
  }
}`}
      />

      {/* Error Codes */}
      <h2 className="mt-14 font-display text-xl font-bold text-white">Error Codes</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="pb-2 pr-6 text-left text-xs font-semibold text-slate-500">Code</th>
              <th className="pb-2 pr-6 text-left text-xs font-semibold text-slate-500">HTTP</th>
              <th className="pb-2 text-left text-xs font-semibold text-slate-500">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {[
              { code: "VALIDATION_ERROR", http: 400, desc: "Invalid request body or parameters" },
              { code: "UNAUTHORIZED", http: 401, desc: "Missing or invalid authentication" },
              { code: "FORBIDDEN", http: 403, desc: "Insufficient permissions" },
              { code: "NOT_FOUND", http: 404, desc: "Resource not found" },
              { code: "RATE_LIMITED", http: 429, desc: "Too many requests" },
              { code: "PLAN_LIMIT_REACHED", http: 403, desc: "Monthly event limit or source limit hit" },
              { code: "INTERNAL_ERROR", http: 500, desc: "Unexpected server error" },
            ].map((err) => (
              <tr key={err.code}>
                <td className="py-2 pr-6 font-mono text-xs text-slate-300">{err.code}</td>
                <td className="py-2 pr-6 text-slate-400">{err.http}</td>
                <td className="py-2 text-slate-500">{err.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-12 border-t border-slate-800/40 pt-6 text-xs text-slate-600">
        <a href="https://github.com/ferryhook/ferryhook/edit/main/docs/api-reference.md" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
          Edit this page on GitHub →
        </a>
      </p>
    </div>
  );
}
