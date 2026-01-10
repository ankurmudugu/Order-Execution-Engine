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

  await app.listen({ port: 3000 });
  console.log("Server running at http://localhost:3000");
}

startServer();
