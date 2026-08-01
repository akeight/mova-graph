import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { studentWorkspaces } from "./student-workspaces";

type PostgresClient = ReturnType<typeof postgres>;

const globalForDatabase =
  globalThis as typeof globalThis & {
    __movaPostgresClient?: PostgresClient;
  };

function createPostgresClient(): PostgresClient {
  const connectionString =
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured.",
    );
  }

  return postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const postgresClient =
  globalForDatabase.__movaPostgresClient ??
  createPostgresClient();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__movaPostgresClient =
    postgresClient;
}

export const db = drizzle(postgresClient, {
    schema: {
      studentWorkspaces,
    },
  });