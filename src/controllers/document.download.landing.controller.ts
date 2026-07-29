import { Request, Response } from "express";
import { STRIKE_OFF_OBJECTIONS } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import logger from "../utils/logger";

const SAFE_PATH_SEGMENT = /^[A-Za-z0-9_-]+$/;

const requireSafeSegment = (value: string | undefined, paramName: string): string => {
  if (!value || !SAFE_PATH_SEGMENT.test(value)) {
    throw new Error("Invalid download path parameter: " + paramName);
  }
  return value;
};

const buildDownloadUrl = (req: Request): string => {
  const companyId = encodeURIComponent(requireSafeSegment(req.params.companyId, "companyId"));
  const requestId = encodeURIComponent(requireSafeSegment(req.params.requestId, "requestId"));
  const attachmentId = encodeURIComponent(requireSafeSegment(req.params.attachmentId, "attachmentId"));

  return STRIKE_OFF_OBJECTIONS
  + "/company/" + companyId
  + "/strike-off-objections/" + requestId
  + "/attachments/" + attachmentId
  + "/download";
};

/**
 * GET controller for download attachment landing screen
 * @param req
 * @param res
 */
export const get = (req: Request, res: Response) => {
  try {
    const downloadUrl = buildDownloadUrl(req);
    logger.debug("Download landing page with download url = " + downloadUrl);
    return res.render(Templates.DOCUMENT_DOWNLOAD_LANDING_PAGE, { downloadUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.errorRequest(req, `Rejected unsafe download landing URL - ${message}`);
    return res.status(400).render(Templates.ERROR);
  }
};
