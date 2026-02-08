import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { getConfig } from "../config.js";
import type { DeliveryTask } from "../types/index.js";

const sqs = new SQSClient({});

export const queueProducer = {
  async sendToProcess(message: {
    eventId: string;
    sourceId: string;
  }): Promise<void> {
    const config = getConfig();
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: config.processQueueUrl,
        MessageBody: JSON.stringify(message),
      })
    );
  },

  async sendToDeliver(
    task: DeliveryTask,
    delaySeconds?: number
  ): Promise<void> {
    const config = getConfig();
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: config.deliverQueueUrl,
        MessageBody: JSON.stringify(task),
        DelaySeconds: delaySeconds ? Math.min(delaySeconds, 900) : undefined,
      })
    );
  },
};
