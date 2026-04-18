import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

let instance: Database | null = null;

function connect(): Database {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env.local (see .env.example)."
      );
    }
    instance = drizzle(neon(url), { schema });
  }
  return instance;
}

/** Drizzle client; connects on first use (not at import time). */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const real = connect();
    return Reflect.get(real, prop, receiver);
  },
});
