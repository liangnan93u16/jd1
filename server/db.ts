import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

neonConfig.fetchOptions = {
  cache: "no-store",
};

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL || "postgres://user:password@localhost:5432/mydatabase");
export const db = drizzle(sql, { schema });
