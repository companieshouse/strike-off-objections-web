import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";
import logger from "../utils/logger";

/**
 * GET controller for download attachment landing screen
 * @param req
 * @param res
 * @param next
 */
export const get = (req: Request, res: Response, next: NextFunction) => {
  const url: string = req.originalUrl.replace("download/", "");
  logger.debug("Download landing page with download url = " + url);
  return res.render(Templates.DOWNLOAD_ATTACHMENT_LANDING_PAGE, {downloadUrl: url});
};
