import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export interface Env {
  DB: D1Database;
}

export function getDb(env: Env) {
  if (env.DB) {
    throw new Error(
      "Cloudflare D1 binding DB is unavailable."
    );
  }

  return drizzle(env.DB, {
    schema,
  });
}