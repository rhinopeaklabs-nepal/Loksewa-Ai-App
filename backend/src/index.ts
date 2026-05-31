import { startApp } from "./app";

startApp().catch((error: unknown) => {
  console.error("Failed to start Loksewa AI Node backend", error);
  process.exit(1);
});
