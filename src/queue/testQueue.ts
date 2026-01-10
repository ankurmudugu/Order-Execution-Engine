import { Queue, Worker } from "bullmq";

const connection = {
    host: "127.0.0.1",
    port: 6379,
};

const testQueue = new Queue("testQueue", { connection });

async function run(){
    await testQueue.add("hello", {msg: "BullMQ working"});
}

run();

new Worker(
    "testQueue",
    async job => {
        console.log("Processed job data : ", job.data);
    },
    {connection}
);