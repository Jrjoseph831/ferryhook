const vpc = new sst.aws.Vpc("Vpc", { nat: "managed" });

export const redis = new sst.aws.Redis("Redis", {
  vpc,
  transform: {
    replicationGroup: {
      nodeType: "cache.t3.micro",
      numCacheClusters: 1,
    },
  },
});
