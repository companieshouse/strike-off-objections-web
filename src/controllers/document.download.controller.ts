import { Session } from "ch-node-session-handler";
import { Request, Response } from "express";
import { DownloadErrorMessages, HttpStatusCodes } from "../model/error.messages";
import { Templates } from "../model/template.paths";
import {
  Download,
  HEADER_CONTENT_DISPOSITION,
  HEADER_CONTENT_LENGTH,
  HEADER_CONTENT_TYPE,
} from "../modules/sdk/objections";
import { downloadAttachment } from "../services/objection.service";
import logger from "../utils/logger";
import { DOWNLOAD_FILENAME_PREFIX } from "../utils/properties";

/**
 * Handle GET request - do the download
 * @param {Request} req the http request object
 * @param {Response} res the http response object
 */
export const get = async (req: Request, res: Response) => {
  const downloadUrl = req.url;
  logger.infoRequest(req, `Attempting download of ${downloadUrl}`);

  const session: Session = req.session as Session;

  try {
    // get the download from api
    const download: Download = await downloadAttachment(downloadUrl, session);

    // set the file info in the response headers
    setResponseHeaders(res, download);

    // pipe/stream the data to the client (browser) through the response object
    logger.debugRequest(req, `About to pipe download to browser from  ${downloadUrl}`);
    return download.data.pipe(res);

  } catch (e) {
    logger.errorRequest(req, `download.attachment.controller - ${JSON.stringify(e)}`);
    const status: number = (e.status > 0) ? e.status : 500;
    res.status(status);
    return showErrorPage(status, res);
  }
};

/**
 * Set the response headers for the download using the headers returned from the API that contain
 * file information
 * @param {Response} res the http response object
 * @param {Download} download the download data returned from API
 */
const setResponseHeaders = (res: Response, download: Download) => {
  res.setHeader(HEADER_CONTENT_DISPOSITION, prefixFilename(download.headers[HEADER_CONTENT_DISPOSITION]));
  res.setHeader(HEADER_CONTENT_TYPE, download.headers[HEADER_CONTENT_TYPE]);
  res.setHeader(HEADER_CONTENT_LENGTH, download.headers[HEADER_CONTENT_LENGTH]);

  logger.debug("Returning response with headers " + JSON.stringify(res.getHeaders()));
};

/**
 * Prefix filename with a value from config
 * @param {string} contentDisposition
 * @returns {string} the contentDisposition string with filename prefix applied
 */
const prefixFilename = (contentDisposition: string ): string => {
  const FILENAME_ID = "filename=\"";
  return contentDisposition.replace(FILENAME_ID, FILENAME_ID + DOWNLOAD_FILENAME_PREFIX);
};

/**
 * Show the correct error page to the user
 * @param {number} httpStatus
 * @param {Response} res
 */
const showErrorPage = (httpStatus: number, res: Response) => {
  const { UNAUTHORIZED, FORBIDDEN, NOT_FOUND } = HttpStatusCodes;
  switch (httpStatus) {
    case UNAUTHORIZED: {
      const { HEADING_UNAUTHORISED, MESSAGE_UNAUTHORISED } = DownloadErrorMessages;
      return renderFileError(res, HEADING_UNAUTHORISED, MESSAGE_UNAUTHORISED);
    }
    case FORBIDDEN: {
      const { HEADING_FORBIDDEN, MESSAGE_FORBIDDEN } = DownloadErrorMessages;
      return renderFileError(res, HEADING_FORBIDDEN, MESSAGE_FORBIDDEN);
    }
    case NOT_FOUND: {
      const { HEADING_NOT_FOUND, MESSAGE_NOT_FOUND } = DownloadErrorMessages;
      return renderFileError(res, HEADING_NOT_FOUND, MESSAGE_NOT_FOUND);
    }
    default: {
      return res.render(Templates.ERROR);
    }
  }
};

/**
 * Render the file error page
 * @param {Response} res the http response object
 * @param {string} heading the heading to display
 * @param {string} message the message to display
 */
const renderFileError = (res: Response, heading: string, message: string) => {
  return res.render(Templates.FILE_ERROR, { heading, message});
};
