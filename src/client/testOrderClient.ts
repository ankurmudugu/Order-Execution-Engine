import WebSocket from "ws";
// import fetch from "node-fetch";

async function submitAndSubscribe() {

  // make the POST request
  const res = await fetch("http://localhost:3000/api/orders/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputMint: "SOL", outputMint: "USDC", amountIn: 1000000000 }),
  });
  const { orderId } = await res.json();
  console.log("Order submitted. ID:", orderId);

//  initiate websocket for live update on order status
  const ws = new WebSocket(`ws://localhost:3000/api/orders/stream/${orderId}`);

  ws.on("message", data => {
    const update = JSON.parse(data.toString());
    console.log("Update:", update);
  });
}

submitAndSubscribe();
