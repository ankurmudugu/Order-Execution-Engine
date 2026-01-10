import { Queue } from "bullmq";
// import IORedis from "ioredis";

export const connection = {
    host: "127.0.0.1",
    port: 6379,
};

export const orderQueue = new Queue("orders", { connection });

