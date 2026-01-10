Order Execution Engine

DEX Router + WebSocket Streaming

A backend order execution engine that processes market orders with automatic DEX routing, real-time WebSocket updates, queue-based concurrency, retry handling, and persistent order storage.

Built using Node.js + TypeScript, Fastify, BullMQ + Redis, and PostgreSQL, with a mock DEX router simulating Raydium and Meteora. The architecture is intentionally designed to be production-ready and easily extensible to real on-chain execution.

✨ Key Features

Market Order Execution

Automatic DEX Routing (Raydium vs Meteora)

Real-time WebSocket Order Status Streaming

Concurrent Order Processing using BullMQ

Retry Logic with Exponential Backoff

PostgreSQL Persistence for order history

Mock DEX Implementation with realistic latency and price variance

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
Order Worker (DEX Router)
        |
        ├── Emits real-time events
        ├── Compares DEX prices
        ├── Retries on failure
        └── Persists results to PostgreSQL

🔧 Component Responsibilities
Component	Responsibility
Fastify HTTP API	Accepts and validates order requests
WebSocket Server	Streams order lifecycle updates
BullMQ + Redis	Queueing, retries, concurrency control
Worker	DEX routing, execution, state transitions
PostgreSQL	Durable order storage
Mock DEX Router	Simulated Raydium / Meteora pricing
🔄 Order Lifecycle

Each order progresses through the following states:

pending → routing → building → submitted → confirmed
                         ↘
                          failed (after retries)

Status Definitions
Status	Description
pending	Order received and queued
routing	Comparing Raydium & Meteora prices
building	Preparing transaction
submitted	Sent to execution layer
confirmed	Successfully executed
failed	Failed after 3 retries

📡 All lifecycle updates are streamed live via WebSocket.

📡 API Endpoints
Submit Order

POST /api/orders/execute

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
ws://localhost:3000/api/orders/stream/{orderId}

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

⚙️ Setup Instructions
1. Prerequisites

Node.js v18+

Redis

PostgreSQL

Linux / macOS / WSL recommended

2. Install Dependencies
npm install

3. Environment Variables

Create a .env file (not committed):

PG_HOST=localhost
PG_PORT=5432
PG_USER=ankur
PG_PASSWORD=yourpassword
PG_DATABASE=orders_db


An example file is provided as .env.example.

4. Start Services
redis-server
npx ts-node src/server.ts

5. Run Client Demo (5 concurrent orders)
npx ts-node src/client/testOrderClient.ts

🧠 Design Decisions
Why Market Orders?

Market orders execute immediately and do not require price monitoring. This simplifies execution guarantees while clearly demonstrating:

Routing logic

Concurrency

Retry handling

WebSocket streaming

Why BullMQ?

BullMQ provides:

Reliable retries

Backpressure handling

Concurrency control

Redis-backed durability

Why WebSockets?

WebSockets enable low-latency, push-based order lifecycle updates, which is essential for trading and execution systems.

🔌 Extending to Other Order Types
1. Limit Orders

Approach:

Store limitPrice in PostgreSQL

Periodically fetch price feeds

Execute only when price condition is met

if (currentPrice <= limitPrice) {
  executeOrder();
}

2. Sniper Orders (Token Launch)

Approach:

Subscribe to on-chain events

Detect pool creation or liquidity migration

Trigger execution immediately

Common use cases:

New token launches

Liquidity migration events

🔗 Integrating Real Raydium / Meteora SDKs

The mock router is a drop-in replacement for real SDKs.

Raydium (Devnet)
const raydium = await Raydium.load({
  owner: wallet,
  connection,
  cluster: "devnet"
});

const quote = raydium.cpmm.computeSwapAmount(...);
const { txId } = await raydium.cpmm.swap(...);

Meteora
const amm = await AmmImpl.create(connection, poolPubkey);
const quote = amm.getSwapQuote(mint, amountIn, slippage);
const tx = await amm.swap(wallet, amountIn, minOut);

Required Changes

Replace mock router with SDK calls

Handle SOL wrapping

Add slippage protection

Use real wallets

Persist on-chain txHash

➡️ The overall architecture remains unchanged.

🗄 Database Schema
CREATE TABLE orders (
  order_id UUID PRIMARY KEY,
  input_mint TEXT,
  output_mint TEXT,
  amount_in BIGINT,
  dex TEXT,
  status TEXT,
  tx_hash TEXT,
  expected_out BIGINT,
  failure_reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

🎥 Demo Video

📺 YouTube:
https://www.youtube.com/watch?v=t_7Om3FpsFU

The demo shows:

5 concurrent orders

Live WebSocket updates

DEX routing decisions

Queue concurrency

Final database persistence

📌 Summary

This project demonstrates:

Production-grade backend architecture

Fault-tolerant execution pipelines

Real-time streaming via WebSockets

Scalable concurrency with queues

Clear extensibility to real DEX execution

👤 Author

Built by Ankur
For backend, systems, and blockchain-adjacent engineering roles.
