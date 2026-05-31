import { startApp } from "./app";
import { logger } from "./core/utils/logger";

startApp().catch((error: unknown) => {
  logger.error({ error }, "Failed to start Loksewa AI backend");
  process.exit(1);
});
