import { Worker } from "bullmq";
import { connection } from "../queue/orderQueue";
import { selectBestRoute } from "../dex/mockRouter";
import { orderEvents } from "../events/orderEvents";
import { Order } from "../types/order";
import { pgPool } from "../db";

/**
 * Helper: update order row in PostgreSQL
 */
async function updateOrder(
  orderId: string,
  fields: Record<string, any>
) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  if (keys.length === 0) return;

  const setClause = keys
    .map((key, i) => `${key} = $${i + 2}`)
    .join(", ");

  await pgPool.query(
    `
    UPDATE orders
    SET ${setClause},
        updated_at = NOW()
    WHERE order_id = $1
    `,
    [orderId, ...values]
  );
}

export const orderWorker = new Worker(
  "orders",
  async (job) => {
    const order = job.data as Order;

    try {
      /**
       * 1️⃣ ROUTING
       */
      orderEvents.emit("order-update", {
        orderId: order.orderId,
        status: "routing",
      });

      await updateOrder(order.orderId, { status: "routing" });

      const quote = await selectBestRoute(order);

      /**
       * 2️⃣ BUILDING
       */
      orderEvents.emit("order-update", {
        orderId: order.orderId,
        status: "building",
      });

      await updateOrder(order.orderId, { status: "building" });

      /**
       * 3️⃣ EXECUTE (mock)
       */
      const txHash = await quote.execute();

      /**
       * 4️⃣ SUBMITTED
       */
      orderEvents.emit("order-update", {
        orderId: order.orderId,
        status: "submitted",
        result: {
          dex: quote.dex,
          txHash,
        },
      });

      await updateOrder(order.orderId, {
        status: "submitted",
        dex: quote.dex,
        tx_hash: txHash,
      });

      /**
       * Simulate confirmation latency
       */
      await new Promise((r) => setTimeout(r, 2000));

      /**
       * 5️⃣ CONFIRMED
       */
      orderEvents.emit("order-update", {
        orderId: order.orderId,
        status: "confirmed",
        result: {
          dex: quote.dex,
          txHash,
          expectedOut: quote.expectedOut.toString(),
        },
      });

      await updateOrder(order.orderId, {
        status: "confirmed",
        expected_out: quote.expectedOut.toString(),
      });

      return true;
    } catch (err: any) {
      const isFinalAttempt =
        job.attemptsMade + 1 === job.opts.attempts;

      if (isFinalAttempt) {
        orderEvents.emit("order-update", {
          orderId: order.orderId,
          status: "failed",
          reason: err?.message ?? "unknown error",
        });

        await updateOrder(order.orderId, {
          status: "failed",
          failure_reason: err?.message ?? "unknown error",
        });
      }

      throw err; // allow BullMQ retries
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

orderWorker.on("ready", () => {
  console.log("🟢 Order worker ready");
});

orderWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed`, err);
});
