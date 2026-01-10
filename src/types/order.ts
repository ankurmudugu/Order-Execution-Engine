export interface Order {
  orderId: string;
  inputMint: string;
  outputMint: string;
  amountIn: bigint;
  slippageBps: number;
  status: "pending" | "routing" | "executing" | "filled" | "failed";
}
