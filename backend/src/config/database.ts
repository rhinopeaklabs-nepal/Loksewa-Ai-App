// Database configuration — Prisma connection settings from environment

export interface DatabaseConfig {
  provider: "postgresql" | "sqlite";
  url: string;
  readReplicaUrl?: string;
  poolMin: number;
  poolMax: number;
  ssl: boolean;
}

function parseProvider(url: string): "postgresql" | "sqlite" {
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    return "postgresql";
  }
  if (url.startsWith("file:")) {
    return "sqlite";
  }
  return "postgresql";
}

export function getDatabaseConfig(): DatabaseConfig {
  const url = process.env.DATABASE_URL ?? "postgresql://localhost/loksewa_ai";
  const readReplicaUrl = process.env.DATABASE_READ_REPLICA_URL;

  return {
    provider: parseProvider(url),
    url,
    readReplicaUrl,
    poolMin: parseInt(process.env.DATABASE_POOL_MIN ?? "2", 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX ?? "10", 10),
    ssl: process.env.DATABASE_SSL === "true"
  };
}

export const databaseConfig = getDatabaseConfig();
export default databaseConfig;