import { NextFunction, Request, Response } from "express";
import activeFeature from "../../feature.flag";
import { Templates } from "../../model/template.paths";

/**
 * Shows service offline page if config flag SHOW_SERVICE_OFFLINE_PAGE=true
 */
export const checkServiceAvailability = (req: Request, res: Response, next: NextFunction) => {
  if (activeFeature(process.env.SHOW_SERVICE_OFFLINE_PAGE)) {
    return res.render(Templates.SERVICE_OFFLINE);
  }
  // feature flag SHOW_SERVICE_UNAVAILABLE_PAGE switched off - carry on as normal
  next();
};
