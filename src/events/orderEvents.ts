import { EventEmitter } from "events";

interface OrderUpdate {
  orderId: string;
  status: "pending" | "routing" | "building" | "submitted" | "confirmed" | "failed";
  result?: any;
  reason?: string;
}

export const orderEvents = new EventEmitter();
export type { OrderUpdate };
