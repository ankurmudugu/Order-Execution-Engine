import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set");
}

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

pgPool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

pgPool.on("error", (err) => {
  console.error("❌ PostgreSQL error", err);
});
