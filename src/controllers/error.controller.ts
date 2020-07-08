import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

/**
 * This handler catches any other error/exception thrown within the application. Always keep this as the
 * last handler in the chain for it to work.
 */
const errorHandler = (err, req: Request, res: Response, next: NextFunction) => {
  logger.error("An error has occurred. Re-routing to the error screen - " + err.stack);
  res.status(err.status || 500).render("error");
};

export default [errorHandler];
