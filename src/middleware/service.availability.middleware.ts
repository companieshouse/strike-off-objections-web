import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";
import { isActiveFeature } from "../utils/feature.flag";

/**
 * Shows service offline page if config flag SHOW_SERVICE_OFFLINE_PAGE=true
 */
export const serviceAvailabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (isActiveFeature(process.env.SHOW_SERVICE_OFFLINE_PAGE)) {
    return res.render(Templates.SERVICE_OFFLINE);
  }
  // feature flag SHOW_SERVICE_OFFLINE_PAGE is false - carry on as normal
  next();
};
