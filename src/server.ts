import "dotenv/config";
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { orderRoutes } from "./routes/orders";
import { orderSocket } from "./ws/orders";

async function startServer() {
  const app = Fastify({ logger: true });

  await app.register(websocket);
  await app.register(orderRoutes);
  await app.register(orderSocket);

  app.get("/", async () => ({
    service: "Order Execution Engine",
    status: "running",
  }));

  app.get("/health", async () => ({ ok: true }));

  const port = Number(process.env.PORT) || 3000;
  const host = "0.0.0.0";

  await app.listen({ port, host });
  app.log.info(`🚀 API running on ${host}:${port}`);

  const shutdown = async () => {
    app.log.info("Shutting down...");
    await app.close();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
