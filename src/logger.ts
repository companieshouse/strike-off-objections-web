import { createLogger } from "ch-logging";
import { APP_NAME } from "./constants";
import { LOG_LEVEL } from "./properties";

const logger = createLogger(APP_NAME);

// tslint:disable-next-line:no-console
console.log(`env.LOG_LEVEL set to ${LOG_LEVEL}`);

export default logger;
