import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadDotEnv } from "dotenv";

export const runtimeEnv = (process.env.LOKSEWA_ENV ?? process.env.NODE_ENV ?? "development").toLowerCase();

const cwd = process.cwd();
const backendRoot = existsSync(resolve(cwd, "package.json")) ? cwd : resolve(cwd, "backend");

const envFiles = [
  `.env.${runtimeEnv}.local`,
  ".env.local",
  `.env.${runtimeEnv}`,
  ".env"
];

for (const file of envFiles) {
  const path = resolve(backendRoot, file);
  if (existsSync(path)) {
    loadDotEnv({ path, override: false, quiet: true });
  }
}
