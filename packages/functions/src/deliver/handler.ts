import type { SQSEvent } from "aws-lambda";
import {
  events,
  attempts,
  queueProducer,
  isAllowedUrl,
  signOutboundPayload,
  RETRY_DELAYS_SECONDS,
  MAX_RETRY_ATTEMPTS,
  SQS_MAX_DELAY_SECONDS,
} from "@ferryhook/core";
import type { DeliveryTask } from "@ferryhook/core";

export async function main(sqsEvent: SQSEvent): Promise<void> {
  for (const record of sqsEvent.Records) {
    try {
      const task = JSON.parse(record.body) as DeliveryTask;
      await deliverEvent(task);
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "error",
          message: "Deliver handler error",
          error: String(err),
          record: record.body,
        })
      );
      throw err;
    }
  }
}

async function deliverEvent(task: DeliveryTask): Promise<void> {
  const { eventId, connectionId, destinationUrl, payload, headers, attempt, signingSecret } =
    task;

  console.log(
    JSON.stringify({
      level: "info",
      message: "Delivering event",
      eventId,
      connectionId,
      destinationUrl,
      attempt,
    })
  );

  // 1. Validate destination URL (SSRF protection)
  if (!isAllowedUrl(destinationUrl)) {
    await attempts.create(eventId, attempt, {
      connectionId,
      destinationUrl,
      statusCode: 0,
      latencyMs: 0,
      error: "SSRF protection: blocked URL",
    });
    console.error(
      JSON.stringify({
        level: "error",
        message: "SSRF blocked",
        eventId,
        connectionId,
        destinationUrl,
      })
    );
    return;
  }

  // 2. Make HTTP request to destination
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = signOutboundPayload(payload, signingSecret);

  const startTime = Date.now();
  try {
    const response = await fetch(destinationUrl, {
      method: "POST",
      headers: {
        "Content-Type": headers["content-type"] ?? "application/json",
        "User-Agent": "Ferryhook/1.0",
        "X-Ferryhook-Event-Id": eventId,
        "X-Ferryhook-Timestamp": timestamp,
        "X-Ferryhook-Signature": signature,
      },
      body: payload,
      signal: AbortSignal.timeout(10_000),
    });

    const latency = Date.now() - startTime;
    const responseBody = await response.text();

    // 3. Record attempt
    await attempts.create(eventId, attempt, {
      connectionId,
      destinationUrl,
      statusCode: response.status,
      responseBody: responseBody.substring(0, 1000),
      latencyMs: latency,
    });

    // 4. Check if successful (2xx)
    if (response.ok) {
      await events.updateStatus(eventId, "delivered");
      console.log(
        JSON.stringify({
          level: "info",
          message: "Event delivered",
          eventId,
          connectionId,
          statusCode: response.status,
          latencyMs: latency,
        })
      );
    } else {
      console.log(
        JSON.stringify({
          level: "warn",
          message: "Delivery failed, scheduling retry",
          eventId,
          connectionId,
          statusCode: response.status,
          attempt,
        })
      );
      await handleRetry(task);
    }
  } catch (err) {
    const latency = Date.now() - startTime;
    await attempts.create(eventId, attempt, {
      connectionId,
      destinationUrl,
      statusCode: 0,
      latencyMs: latency,
      error: String(err),
    });
    console.error(
      JSON.stringify({
        level: "error",
        message: "Delivery request error",
        eventId,
        connectionId,
        error: String(err),
        attempt,
      })
    );
    await handleRetry(task);
  }
}

async function handleRetry(task: DeliveryTask): Promise<void> {
  if (task.attempt >= MAX_RETRY_ATTEMPTS) {
    await events.updateStatus(task.eventId, "failed");
    console.log(
      JSON.stringify({
        level: "error",
        message: "Event delivery permanently failed",
        eventId: task.eventId,
        connectionId: task.connectionId,
        totalAttempts: task.attempt,
      })
    );
    return;
  }

  const delaySec = RETRY_DELAYS_SECONDS[task.attempt] ?? 86400;
  const sqsDelay = Math.min(delaySec, SQS_MAX_DELAY_SECONDS);

  await queueProducer.sendToDeliver(
    { ...task, attempt: task.attempt + 1 },
    sqsDelay
  );

  await events.updateStatus(task.eventId, "retrying");
}
