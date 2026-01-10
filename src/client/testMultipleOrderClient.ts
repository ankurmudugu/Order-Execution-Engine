import WebSocket from "ws";

async function submitOneOrder(index: number) {

  const res = await fetch("http://localhost:3000/api/orders/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inputMint: "SOL",
      outputMint: "USDC",
      amountIn: 1000000000 + index * 1_000_000, // slightly different amounts
    }),
  });

  const { orderId } = await res.json();
  console.log(`[Order ${index}] Submitted. ID: ${orderId}`);

 
  const ws = new WebSocket(
    `ws://localhost:3000/api/orders/stream/${orderId}`
  );

  ws.on("message", data => {
    const update = JSON.parse(data.toString());
    console.log(`[Order ${index}] Update:`, update);

  
    if (update.status === "confirmed" || update.status === "failed") {
      ws.close();
    }
  });

  ws.on("close", () => {
    console.log(`[Order ${index}] WebSocket closed`);
  });

  ws.on("error", err => {
    console.error(`[Order ${index}] WebSocket error`, err);
  });
}

async function submitFiveOrders() {
  const orders = Array.from({ length: 5 }, (_, i) =>
    submitOneOrder(i + 1)
  );

  // run all submissions concurrently
  await Promise.all(orders);
}

submitFiveOrders();
