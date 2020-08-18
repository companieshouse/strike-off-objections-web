import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { HttpStatusCodes, UploadErrorMessages } from "../../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import { OBJECTIONS_CHECK_YOUR_ANSWERS } from "../../model/page.urls";
import { Templates } from "../../model/template.paths";
import { Attachment } from "../../modules/sdk/objections";
import * as objectionService from "../../services/objection.service";
import logger from "../../utils/logger";
import { MAX_FILE_SIZE_BYTES } from "../../utils/properties";
import { uploadFile, UploadFileCallbacks } from "./http.request.file.uploader";
import { UploadResponderStrategy } from "./upload.responder.strategy";
import { createUploadResponderStrategy } from "./upload.responder.strategy.factory";

/**
 * Document upload controller
 * Handles uploading of files
 * Uses the strategy pattern to handle responses back to the browser differently for AJAX and non AJAX requests
 * AJAX requests are sent from a javascript file included into the web page - upload.js, stored in the CDN
 */

/**
 * Handle GET request for document upload page
 * @param {Request} req the http request
 * @param {Response} res the http response
 * @param {NextFunction} next function in middleware chain - used to catch errors
 */
export const get = async (req: Request, res: Response, next: NextFunction) => {
  let attachments: Attachment[] = [];
  try {
    attachments = await objectionService.getAttachments(req.session as Session);
  } catch (e) {
    logger.errorRequest(req, `Error thrown calling objection.service.getAttachments - ${e}`);
    return next(e);
  }

  return res.render(Templates.DOCUMENT_UPLOAD,
                    {
                      attachments,
                      templateName: Templates.DOCUMENT_UPLOAD,
                    });
};

/**
 * Handle POST request for document upload page when a file is submitted
 * @param {Request} req the http request
 * @param {Response} res the http response
 * @param {NextFunction} next the next function in the middleware chain
 */
export const postFile = async (req: Request, res: Response, next: NextFunction) => {
  logger.debugRequest(req, "Add document http request type is " + (isAjaxRequest(req) ? "" : "NOT ") + "AJAX / XmlHttpRequest");

  const uploadResponderStrategy: UploadResponderStrategy = createUploadResponderStrategy(isAjaxRequest(req));

  let attachments: Attachment[] = [];
  try {
    attachments = await objectionService.getAttachments(req.session as Session);
  } catch (e) {
    logger.errorRequest(req, `Error thrown calling objection.service.getAttachments - ${e}`);
    return uploadResponderStrategy.handleGenericError(res, e, next);
  }

  const uploadCallbacks: UploadFileCallbacks = {
    fileSizeLimitExceededCallback: getFileSizeLimitExceededCallback(req, res, uploadResponderStrategy, attachments),
    noFileDataReceivedCallback: getNoFileDataReceivedCallback(req, res, uploadResponderStrategy, attachments),
    uploadFinishedCallback: getUploadFinishedCallback(req, res, next, uploadResponderStrategy, attachments),
  };
  const maxFileSizeBytes: number = parseInt(MAX_FILE_SIZE_BYTES, 10);

  return uploadFile(req, maxFileSizeBytes, uploadCallbacks);
};

/**
 * Handle POST request for document upload page when continue button is pressed
 * @param {Request} req the http request
 * @param {Response} res the http response
 * @param {NextFunction} next the next function in the middleware chain
 */
export const postContinueButton = async (req: Request, res: Response, next: NextFunction) => {
  const uploadResponderStrategy: UploadResponderStrategy = createUploadResponderStrategy(isAjaxRequest(req));

  let attachments: Attachment[] = [];
  try {
    attachments = await objectionService.getAttachments(req.session as Session);
  } catch (e) {
    logger.errorRequest(req, `Error thrown calling objection.service.getAttachments - ${e}`);
    return uploadResponderStrategy.handleGenericError(res, e, next);
  }

  if (attachments && attachments.length === 0) {
    return displayError(res, UploadErrorMessages.NO_DOCUMENTS_ADDED, uploadResponderStrategy, attachments);
  }

  res.redirect(OBJECTIONS_CHECK_YOUR_ANSWERS);
};

/**
 * Get uploadFile callback function for file size limit exceeded event
 * @param {Request} req http request
 * @param {Response} res http response
 * @param {UploadResponderStrategy} uploadResponderStrategy the strategy for responding to requests
 * @param {Attachment[]} attachments the list of attachments
 * @returns {(filename: string, maxInBytes: number): void} the callback function
 */
const getFileSizeLimitExceededCallback = (req: Request,
                                          res: Response,
                                          uploadResponderStrategy: UploadResponderStrategy,
                                          attachments: Attachment[]):
                                            (filename: string, maxInBytes: number) => Promise<void> => {
  return async (filename: string, maxInBytes: number) => {
    const maxInMB: number = getMaxFileSizeInMB(maxInBytes);
    logger.debug("File limit " + maxInMB + "MB reached for file " + filename);
    const errorMsg = `${UploadErrorMessages.FILE_TOO_LARGE} ${maxInMB} MB`;
    return await displayError(res, errorMsg, uploadResponderStrategy, attachments);
  };
};

/**
 * Get uploadFile callback function for no file data received
 * @param {Request} req http request
 * @param {Response} res http response
 * @param {UploadResponderStrategy} uploadResponderStrategy the strategy for responding to requests
 * @param {Attachment[]} attachments the list of attachments
 * @returns {(filename: string): void} the callback function
 */
const getNoFileDataReceivedCallback = (req: Request,
                                       res: Response,
                                       uploadResponderStrategy: UploadResponderStrategy,
                                       attachments: Attachment[]): (filename: string) => Promise<void> => {
  return async (_filename: string) => {
    return await displayError(res, UploadErrorMessages.NO_FILE_CHOSEN, uploadResponderStrategy, attachments);
  };
};

/**
 * Get uploadFile callback function for the upload finished event
 * @param {Request} req http request
 * @param {Response} res http response
 * @param {NextFunction} next the next function in the middleware chain
 * @param {UploadResponderStrategy} uploadResponderStrategy the strategy for responding to requests
 * @param {attachments} required to display invalid mime types error
 * @returns {(filename: string, fileData: Buffer, mimeType: string): Promise<void>} the callback function
 */
const getUploadFinishedCallback = (req: Request,
                                   res: Response,
                                   next: NextFunction,
                                   uploadResponderStrategy: UploadResponderStrategy,
                                   attachments: Attachment[]):
                                    (filename: string, fileData: Buffer, mimeType: string) => Promise<void> => {
  return async (filename: string, fileData: Buffer, mimeType: string) => {
    try {
      const session: Session = req.session as Session;
      const attachmentId: string = await objectionService.addAttachment(session, fileData, filename);
      logger.debug(`Attachment with id ${attachmentId} successfully uploaded`);
    } catch (e) {
      logger.error(`User has attempted to upload a ` +
                     `file ${filename}, mime-type: ${mimeType} ` +
                     `of size ${fileData.length} bytes. The api has returned the error: ${e.message}`);

      if (e.status === HttpStatusCodes.UNSUPPORTED_MEDIA_TYPE) {
        return await
        displayError(res, UploadErrorMessages.INVALID_MIME_TYPES, uploadResponderStrategy, attachments);
      }
      return uploadResponderStrategy.handleGenericError(res, e, next);
    }
    return uploadResponderStrategy.handleSuccess(req, res);
  };
};

/**
 * Displays an error message on the page
 * @param {Response} res http response
 * @param {string} errorMessage the error message to display on the page
 * @param {UploadResponderStrategy} uploadResponderStrategy the strategy for responding to requests
 * @param {Attachment[]} attachments the list of attachments
 */
const displayError = async (res: Response,
                            errorMessage: string,
                            uploadResponderStrategy: UploadResponderStrategy,
                            attachments: Attachment[]) => {
  const documentUploadErrorData: GovUkErrorData =
    createGovUkErrorData(errorMessage, "#file-upload", true, "");
  return uploadResponderStrategy.handleGovUKError(res, documentUploadErrorData, attachments);
};

/**
 * Gets max file size in MB rounded down to nearest whole number
 * @param {number} maxSizeInBytes the max size allowed in bytes
 * @returns number max size in MB
 */
const getMaxFileSizeInMB = (maxSizeInBytes: number): number => {
  return Math.floor(maxSizeInBytes / (1024 * 1024));
};

/**
 * Is this an Ajax request or not
 * @param {boolean} req http request
 */
const isAjaxRequest = (req: Request): boolean => {
  return req.xhr;
};
