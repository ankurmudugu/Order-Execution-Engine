Order Execution Engine (DEX Router + WebSocket Streaming)

A backend order execution engine that processes market orders with automatic DEX routing, real-time WebSocket updates, queue-based concurrency, retry handling, and persistent order storage.

Built using Node.js + TypeScript, Fastify, BullMQ + Redis, PostgreSQL, and a mock DEX router (Raydium / Meteora), designed to be easily extended to real on-chain execution.

Key features include the following :-

Market Order Execution

DEX Routing (Raydium vs Meteora)

Real-time WebSocket Order Status Streaming

Concurrent Order Processing (BullMQ)

Retry Logic with Exponential Backoff

PostgreSQL Persistence for Order History

Mock DEX Implementation (production-ready architecture)

High-Level Architecture is as such :-
Client (HTTP + WebSocket)
        |
        v
Fastify API (POST /execute)
        |
        v
Redis + BullMQ Queue
        |
        v
Order Worker (DEX Router)
        |
        ├── Emits real-time events (EventEmitter)
        ├── Routes order to best DEX
        ├── Retries on failure
        └── Updates PostgreSQL

Component Responsibilities
Component	Responsibility
Fastify HTTP API	Accept order requests
WebSocket Server	Stream order lifecycle updates
BullMQ + Redis	Queueing, retries, concurrency
Worker	Routing, execution, state transitions
PostgreSQL	Durable order storage
Mock DEX Router	Simulated Raydium/Meteora pricing

Order Lifecycle

Each order progresses through the following states:

pending → routing → building → submitted → confirmed
                         ↘
                          failed (after retries)

Status Meaning
Status	Description
pending	Order received and queued
routing	Comparing Raydium & Meteora
building	Preparing transaction
submitted	Sent to network
confirmed	Successfully executed
failed	Failed after 3 retries

All updates are streamed live via WebSocket.

API Endpoints
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

Setup Instructions
1. Prerequisites

Node.js v18+

Redis

PostgreSQL

WSL / Linux / macOS recommended

2️. Install Dependencies
npm install

3️. Environment Variables

Create .env (not committed):

PG_HOST=localhost
PG_PORT=5432
PG_USER=ankur
PG_PASSWORD=yourpassword
PG_DATABASE=orders_db


Example file provided as .env.example.

4️. Start Services
redis-server

npx ts-node src/server.ts

5️. Run Client Demo (5 concurrent orders)
npx ts-node src/client/testOrderClient.ts

Design Decisions
I chose market orders because they are executed immediately, do not require price monitoring and to simplify execution guarantees.
They demonstrate routing concurrency, retires and WebSocket functionality.

BullMQ was used to provide reliable job retries, backpressure handling, concurrency and redis backed durability.

WebSockets were used to provide low latency and push-based updates.

Extending to Other Order Types
1. Limit Orders

How it would work:

Store limitPrice in PostgreSQL

Periodic worker checks price feeds

Execute only when price condition met

if (currentPrice <= limitPrice) {
  executeOrder();
}

2. Sniper Orders (Token Launch)

How it would work:

Subscribe to on-chain events

Detect pool creation / migration

Trigger execution immediately

Common for:

New token launches

Liquidity migration events

Integrating Real Raydium / Meteora SDKs

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

Required Changes :-

Replace mock router with SDK calls

Handle SOL wrapping

Add slippage protection

Use real wallets

Persist txHash

Architecture does not change.

-> Database Schema
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

YouTube Demo : https://www.youtube.com/watch?v=t_7Om3FpsFU

This video shows:

5 concurrent orders

Live WebSocket updates

DEX routing decisions

Queue concurrency

Final DB persistence


Summary :-

This project demonstrates:

Production-grade backend design

Fault-tolerant execution

Real-time streaming

Scalable concurrency

Clear extensibility to real DEX execution

Author

Built by Ankur
For backend / systems / blockchain-adjacent roles.