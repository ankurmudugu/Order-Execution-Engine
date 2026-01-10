export interface DexQuote{
    dex : "raydium" | "meteora";
    expectedOut : BigInt;
    execute: () => Promise<string>; //when called, it executes the trade, returns the hash after its done so we can check it
}