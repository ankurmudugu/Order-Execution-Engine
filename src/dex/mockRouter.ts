import { Order } from "../types/order";
import { DexQuote } from "./quotes";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// simulate Raydium quote
export async function getRaydiumQuote(order: Order): Promise<DexQuote> {
  console.log(`[Raydium] Fetching quote for ${order.orderId}`);

  // simulate rpc latency
  await sleep(rand(2000, 3000));

  //simulate failure
  if (Math.random() < 0.1) {
    throw new Error("Raydium RPC timeout");
  }

  const priceImpact = rand(0.96, 0.98);
  const expectedOut =
    BigInt(Math.floor(Number(order.amountIn) * priceImpact));

  return {
    dex: "raydium",
    expectedOut,
    execute: async () => {
      await new Promise(r => setTimeout(r, 500)); // simulate network delay
      return "mock_tx_" + Math.floor(Math.random() * 1000000);
    },
  };
}

// simulate meteora quote
export async function getMeteoraQuote(order: Order): Promise<DexQuote> {
  console.log(`[Meteora] Fetching quote for ${order.orderId}`);

  // Simulate RPC latency
  await sleep(rand(2000, 3000));

  // simulate failure
  if (Math.random() < 0.1) {
    throw new Error("Meteora RPC failure");
  }

  const priceImpact = rand(0.95, 0.99);
  const expectedOut =
    BigInt(Math.floor(Number(order.amountIn) * priceImpact));

  return {
    dex: "meteora",
    expectedOut,
    execute: async () => {
      await new Promise(r => setTimeout(r, 500)); // simulate network delay
      return "mock_tx_" + Math.floor(Math.random() * 1000000);
    },
  };
}

// select best route
export async function selectBestRoute(order: Order): Promise<DexQuote> {
  console.log(`[Router] Selecting route for ${order.orderId}`);

  const results = await Promise.allSettled([
    getRaydiumQuote(order),
    getMeteoraQuote(order),
  ]);

  const validQuotes = results
    .filter(r => r.status === "fulfilled")
    .map(r => (r as PromiseFulfilledResult<DexQuote>).value);

  if (validQuotes.length === 0) {
    throw new Error("No valid DEX routes available");
  }

  const best = validQuotes.reduce((a, b) =>
    b.expectedOut > a.expectedOut ? b : a
  );

  console.log(
    `[Router] Selected ${best.dex} | expectedOut=${best.expectedOut}`
  );

  return best;
}
