import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { APP_NAME } from "../constants";
import { LOG_LEVEL } from "./properties";

const logger: ApplicationLogger = createLogger(APP_NAME);

// tslint:disable-next-line:no-console
console.log(`env.LOG_LEVEL set to ${LOG_LEVEL}`);

export default logger;
