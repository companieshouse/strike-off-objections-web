import { NextFunction, Request, Response } from "express";
import { DOWNLOAD_PREFIX } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import logger from "../utils/logger";

/**
 * GET controller for download attachment landing screen
 * @param req
 * @param res
 * @param next
 */
export const get = (req: Request, res: Response, next: NextFunction) => {
  // replaces first match only
  const url: string = req.originalUrl.replace(DOWNLOAD_PREFIX, "");
  logger.debug("Download landing page with download url = " + url);
  return res.render(Templates.DOCUMENT_DOWNLOAD_LANDING_PAGE, {downloadUrl: url});
};
