import { Queue } from "bullmq";

export const connection = {
  url: process.env.REDIS_URL!,
};

export const orderQueue = new Queue("orders", { connection });
