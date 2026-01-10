import "dotenv/config";
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { orderRoutes } from "./routes/orders";
import { orderSocket } from "./ws/orders";
import "./workers/orderWorker"; // start worker

async function startServer() {
  const app = Fastify({ logger: true });

  await app.register(websocket);
  await app.register(orderRoutes);
  await app.register(orderSocket);

  const port = Number(process.env.PORT) || 3000;
  const host = "0.0.0.0";

  await app.listen({ port, host });


  // await app.listen({ port: 3000 });
  app.log.info(`Server running on ${host}:${port}`);

}

startServer();
