// Auth service configuration
import { loadConfig, getConfig } from "@loksewa/shared-utils";

loadConfig("auth-service");
export const config = getConfig();
