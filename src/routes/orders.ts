import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { orderQueue } from "../queue/orderQueue";
import { orderEvents } from "../events/orderEvents";
import { pgPool } from "../db";

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.post("/api/orders/execute", async (req, reply) => {
    const body = req.body as {
      inputMint: string;
      outputMint: string;
      amountIn: number;
    };

    const orderId = randomUUID();

    await pgPool.query(
        `
        INSERT INTO orders (order_id, input_mint, output_mint, amount_in, status)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          orderId,
          body.inputMint,
          body.outputMint,
          body.amountIn,
          "pending",
        ]
      );

    // 1️⃣ Emit pending immediately
    orderEvents.emit("order-update", {
      orderId,
      status: "pending",
    });

    // 2️⃣ Push job with retries + backoff
    await orderQueue.add(
      "execute-order",
      {
        orderId,
        ...body,
      },
      {
        attempts: 3, // ✅ retry up to 3 times
        backoff: {
          type: "exponential",
          delay: 2000, // 2s, 4s, 8s
        },
        removeOnComplete: true,
        removeOnFail: false, // keep failed jobs for debugging
      }
    );

    // 3️⃣ Return immediately
    return { orderId };
  });
}
