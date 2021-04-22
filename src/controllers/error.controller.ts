import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";
import logger from "../utils/logger";
import { ErrorMessages } from "../model/error.messages";

/**
 * This handler catches all routes that don't match a handler i.e. 404 Not Found, because of its position
 * in the middleware chain.
 */
const notFoundHandler = (req: Request, res: Response) => {
  logger.error(ErrorMessages.ERROR_404 + `${req.path}`);
  return res.status(404).render(Templates.ERROR_404, { templateName: Templates.ERROR_404 });
};

/**
 * This handler catches any other error/exception thrown within the application. Always keep this as the
 * last handler in the chain for it to work.
 */
const errorHandler = (err, req: Request, res: Response, _next: NextFunction) => {
  logger.errorRequest(req, "An error has occurred. Re-routing to the error screen - " + err.stack);
  res.status(err.status || 500).render(Templates.ERROR, { templateName: Templates.ERROR });
};

export default [notFoundHandler, errorHandler];
