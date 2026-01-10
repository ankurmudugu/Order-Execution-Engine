import { FastifyInstance } from "fastify";
import { orderEvents } from "../events/orderEvents";

export async function orderSocket(fastify: FastifyInstance) {
  fastify.get<{ Params: { orderId: string } }>(
    "/api/orders/stream/:orderId",
    { websocket: true },
    (ws, req) => {
      const orderId = req.params.orderId;

      console.log("WebSocket connected for order", orderId);

      const listener = (update: any) => {
        if (update.orderId === orderId) {
          ws.send(JSON.stringify(update));
        }
      };

      orderEvents.on("order-update", listener);

      ws.on("close", () => {
        console.log("WebSocket closed for order", orderId);
        orderEvents.off("order-update", listener);
      });
    }
  );
}
