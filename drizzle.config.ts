import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: ".env.local",
});

const databaseUrl =
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error(
    "DIRECT_URL or DATABASE_URL must be configured before running Drizzle.",
  );
}

export default defineConfig({
  dialect: "postgresql",

  schema:
    "./src/lib/db/schema/student-workspaces.ts",

  out: "./drizzle",

  dbCredentials: {
    url: databaseUrl,
  },

  strict: true,
  verbose: true,
});