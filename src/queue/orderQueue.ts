import { Queue, type ConnectionOptions } from "bullmq";

export const connection: ConnectionOptions = {
  url: process.env.REDIS_URL!,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {}, // REQUIRED for Upstash
};

export const orderQueue = new Queue("orders", {
  connection,
});
