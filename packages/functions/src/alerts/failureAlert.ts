import type { SNSEvent } from "aws-lambda";
import { users, events, attempts } from "@ferryhook/core";
import { emailAlerts } from "@ferryhook/core/src/alerts/email.js";

interface FailureMessage {
  eventId: string;
  connectionId: string;
  userId: string;
  attempt: number;
}

export async function main(snsEvent: SNSEvent): Promise<void> {
  for (const record of snsEvent.Records) {
    try {
      const message = JSON.parse(record.Sns.Message) as FailureMessage;
      const { eventId, userId, attempt: attemptNum } = message;

      const [user, evt] = await Promise.all([
        users.getById(userId),
        events.getById(eventId),
      ]);

      if (!user || !evt) {
        console.error(
          JSON.stringify({
            level: "error",
            message: "Failed to load user or event for alert",
            eventId,
            userId,
          })
        );
        continue;
      }

      // Get the last attempt details
      const attemptsList = await attempts.listByEvent(eventId);
      const lastAttempt = attemptsList[attemptsList.length - 1];
      if (!lastAttempt) continue;

      await emailAlerts.sendDeliveryFailureAlert(user, evt, lastAttempt);

      console.log(
        JSON.stringify({
          level: "info",
          message: "Failure alert sent",
          eventId,
          userId,
          email: user.email,
        })
      );
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "error",
          message: "Failure alert handler error",
          error: String(err),
        })
      );
    }
  }
}
