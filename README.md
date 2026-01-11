🚀 Order Execution Engine
DEX Routing · Queue-Based Execution · Real-Time WebSocket Streaming

A production-ready backend order execution engine that processes market swap orders with automatic DEX routing, queue-based concurrency, retry handling, and real-time WebSocket updates, backed by durable PostgreSQL storage.

Built with Node.js + TypeScript, Fastify, BullMQ + Redis, and PostgreSQL, using a mock DEX router that simulates Raydium and Meteora.
The architecture is intentionally designed to be cloud-deployable, fault-tolerant, and easily extensible to real on-chain execution.

🌐 Live Deployment

API Base URL
👉 https://order-execution-engine-al5z.onrender.com

This is a live, deployed backend (API + WebSocket).
There is no frontend UI — interact via HTTP and WebSocket clients.

✨ Key Features

⚡ Market Order Execution

🔀 Automatic DEX Routing (Raydium vs Meteora)

📡 Real-time WebSocket order lifecycle streaming

🧵 Concurrent processing with BullMQ

🔁 Retry logic with exponential backoff

🗄 Durable PostgreSQL persistence

🧪 Mock DEX implementation with realistic latency & price variance

☁️ Cloud-ready architecture (API + worker separation)

🏗 High-Level Architecture
Client (HTTP + WebSocket)
        |
        v
Fastify API (POST /api/orders/execute)
        |
        v
Redis + BullMQ Queue
        |
        v
Order Worker
        |
        ├── DEX price comparison
        ├── Retry & backoff handling
        ├── Real-time event emission
        └── PostgreSQL persistence

🔧 Component Responsibilities
Component	Responsibility
Fastify HTTP API	Accepts & validates order requests
WebSocket Server	Streams live order lifecycle updates
BullMQ + Redis	Queueing, retries, concurrency control
Worker	Routing, execution, state transitions
PostgreSQL	Durable order history storage
Mock DEX Router	Simulated Raydium / Meteora pricing
🔄 Order Lifecycle

Each order progresses through the following strictly enforced states:

received → routing → building → submitted → confirmed
                           ↘
                            failed (after retries)

Status Definitions
Status	Description
received	Order accepted and persisted
routing	Comparing Raydium vs Meteora
building	Preparing execution
submitted	Sent to execution layer
confirmed	Successfully executed
failed	Failed after retries

📡 All lifecycle transitions are streamed live via WebSocket.

📡 API Endpoints
Submit Order

POST /api/orders/execute

Live URL

POST https://order-execution-engine-al5z.onrender.com/api/orders/execute

Request Body
{
  "inputMint": "SOL",
  "outputMint": "USDC",
  "amountIn": 1000000000
}

Response
{
  "orderId": "uuid"
}

Stream Order Status (WebSocket)
wss://order-execution-engine-al5z.onrender.com/api/orders/stream/{orderId}

Example Messages
{ "orderId": "...", "status": "routing" }

{
  "orderId": "...",
  "status": "confirmed",
  "result": {
    "dex": "raydium",
    "txHash": "mock_tx_12345",
    "expectedOut": "975906354"
  }
}

🗄 Database Schema
CREATE TABLE orders (
  order_id UUID PRIMARY KEY,

  input_mint TEXT NOT NULL,
  output_mint TEXT NOT NULL,
  amount_in BIGINT NOT NULL,

  dex TEXT,
  status TEXT NOT NULL CHECK (
    status IN (
      'received',
      'routing',
      'building',
      'submitted',
      'confirmed',
      'failed'
    )
  ),

  tx_hash TEXT,
  expected_out BIGINT,
  failure_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

⚙️ Local Setup Instructions
1️⃣ Prerequisites

Node.js v18+

Redis

PostgreSQL

Linux / macOS / WSL recommended

2️⃣ Install Dependencies
npm install

3️⃣ Environment Variables

Create a .env file (not committed):

NODE_ENV=development

DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
REDIS_URL=rediss://default:<token>@<redis-host>:6379


⚠️ The application only uses DATABASE_URL and REDIS_URL
No PG_HOST, REDIS_HOST, or localhost assumptions in production.

4️⃣ Start Services
redis-server
npm run dev

5️⃣ Run Client Demo (5 concurrent orders)
npx ts-node src/client/testOrderClient.ts

🧠 Design Decisions
Why Market Orders?

Market orders execute immediately and avoid price-watch complexity, making them ideal for demonstrating:

Routing logic

Concurrency

Retry handling

WebSocket streaming

Why BullMQ?

BullMQ provides:

Reliable retries

Backpressure handling

Concurrency limits

Redis-backed durability

Why WebSockets?

Trading and execution systems require low-latency, push-based updates.
Polling is insufficient for order lifecycle streaming.

🔌 Extending the Engine
Limit Orders

Store limit_price

Periodically evaluate market price

Execute when condition is met

if (currentPrice <= limitPrice) {
  executeOrder();
}

Sniper / Launch Orders

Subscribe to on-chain events

Detect liquidity or pool creation

Trigger execution immediately

🔗 Integrating Real Raydium / Meteora SDKs

The mock router is a drop-in replacement.

Raydium (Devnet)
const raydium = await Raydium.load({ owner, connection, cluster: "devnet" });
const quote = raydium.cpmm.computeSwapAmount(...);
await raydium.cpmm.swap(...);

Meteora
const amm = await AmmImpl.create(connection, poolPubkey);
const quote = amm.getSwapQuote(...);
await amm.swap(...);

Required Changes

Replace mock router

Add slippage protection

Handle SOL wrapping

Use real wallets

Persist on-chain txHash

➡️ The overall architecture remains unchanged.

🎥 Demo

📺 YouTube
https://www.youtube.com/watch?v=t_7Om3FpsFU

Demo shows:

5 concurrent orders

Live WebSocket updates

DEX routing decisions

Queue concurrency

Final database persistence

📌 Summary

This project demonstrates:

Production-grade backend architecture

Fault-tolerant execution pipelines

Real-time WebSocket streaming

Scalable concurrency with queues

Clean separation of API & worker

Clear path to real on-chain execution

👤 Author

Ankur
Built for backend, distributed systems, and blockchain-adjacent engineering roles.
