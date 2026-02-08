export const dlq = new sst.aws.Queue("DLQ", {});

export const processQueue = new sst.aws.Queue("ProcessQueue", {
  transform: {
    queue: {
      visibilityTimeoutSeconds: 60,
      redrivePolicy: $jsonStringify({
        deadLetterTargetArn: dlq.arn,
        maxReceiveCount: 3,
      }),
    },
  },
});

export const deliverQueue = new sst.aws.Queue("DeliverQueue", {
  transform: {
    queue: {
      visibilityTimeoutSeconds: 60,
      redrivePolicy: $jsonStringify({
        deadLetterTargetArn: dlq.arn,
        maxReceiveCount: 3,
      }),
    },
  },
});
