import { createLogger } from "ch-logging";
import { APP_NAME } from "./app";
import { LOG_LEVEL } from "./properties";

const logger = createLogger(APP_NAME);

logger.info(`env.LOG_LEVEL set to ${LOG_LEVEL}`);

export default logger;
