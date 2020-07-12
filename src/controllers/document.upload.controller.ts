import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { SESSION_OBJECTION_ID } from "../constants";
import { UploadErrorMessages } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { Templates } from "../model/template.paths";
import * as objectionService from "../services/objection.service";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession, retrieveFromObjectionSession,
} from "../services/objection.session.service";
import logger from "../utils/logger";
import { MAX_FILE_SIZE_BYTES } from "../utils/properties";
import { uploadFile, UploadFileCallbacks } from "./upload_strategy/http.request.file.uploader";
import { IUploadResponderStrategy } from "./upload_strategy/upload.responder.strategy";
import { createUploadResponderStrategy } from "./upload_strategy/upload.responder.strategy.factory";

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
  let attachments: any[] = [];
  try {
    // TODO this will have to have await if getAttachments is made async
    attachments = objectionService.getAttachments(req.session as Session);
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

  const uploadResponderStrategy: IUploadResponderStrategy = createUploadResponderStrategy(isAjaxRequest(req));

  let attachments: any[] = [];
  try {
    // TODO this will have to have await if getAttachments is made async
    attachments = objectionService.getAttachments(req.session as Session);
  } catch (e) {
    logger.errorRequest(req, `Error thrown calling objection.service.getAttachments - ${e}`);
    return uploadResponderStrategy.handleGenericError(res, e, next);
  }

  const uploadCallbacks: UploadFileCallbacks = {
    fileSizeLimitExceededCallback: getFileSizeLimitExceededCallback(req, res, uploadResponderStrategy, attachments),
    noFileDataReceivedCallback: getNoFileDataReceivedCallback(req, res, uploadResponderStrategy, attachments),
    uploadFinishedCallback: getUploadFinishedCallback(req, res, next, uploadResponderStrategy),
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
  const uploadResponderStrategy: IUploadResponderStrategy = createUploadResponderStrategy(isAjaxRequest(req));

  let attachments: any[] = [];
  try {
    // TODO this will have to have await if getAttachments is made async
    attachments = objectionService.getAttachments(req.session as Session);
  } catch (e) {
    logger.errorRequest(req, `Error thrown calling objection.service.getAttachments - ${e}`);
    return uploadResponderStrategy.handleGenericError(res, e, next);
  }

  if (attachments && attachments.length === 0) {
    return displayError(res, UploadErrorMessages.NO_DOCUMENTS_ADDED, uploadResponderStrategy, attachments);
  }
  res.redirect("TODO - PAGE AFTER UPLOAD");
};

/**
 * Get uploadFile callback function for file size limit exceeded event
 * @param {Request} req http request
 * @param {Response} res http response
 * @param {IUploadResponderStrategy} uploadResponderStrategy the strategy for responding to requests
 * @param {any[]} attachments the list of attachments
 * @returns {((filename: string, maxInBytes: number): void)} the callback function
 */
const getFileSizeLimitExceededCallback = (req: Request,
                                          res: Response,
                                          uploadResponderStrategy: IUploadResponderStrategy,
                                          attachments: any[]): (filename: string, maxInBytes: number) => void => {
  return (filename: string, maxInBytes: number) => {
    const maxInMB: number = getMaxFileSizeInMB(maxInBytes);
    logger.debug("File limit " + maxInMB + "MB reached for file " + filename);
    const errorMsg: string = `${UploadErrorMessages.FILE_TOO_LARGE} ${maxInMB} MB`;
    return displayError(res, errorMsg, uploadResponderStrategy, attachments);
  };
};

/**
 * Get uploadFile callback function for no file data received
 * @param {Request} req http request
 * @param {Response} res http response
 * @param {IUploadResponderStrategy} uploadResponderStrategy the strategy for responding to requests
 * @param {any[]} attachments the list of attachments
 * @returns {((filename: string): void)} the callback function
 */
const getNoFileDataReceivedCallback = (req: Request,
                                       res: Response,
                                       uploadResponderStrategy: IUploadResponderStrategy,
                                       attachments: any[]): (filename: string) => void => {
  return async (_filename: string) => {
    return await displayError(res, UploadErrorMessages.NO_FILE_CHOSEN, uploadResponderStrategy, attachments);
  };
};

/**
 * Get uploadFile callback function for the upload finished event
 * @param {Request} req http request
 * @param {Response} res http response
 * @param {NextFunction} next the next function in the middleware chain
 * @param {IUploadResponderStrategy} uploadResponderStrategy the strategy for responding to requests
 * @returns {((filename: string, fileData: Buffer, mimeType: string): void)} the callback function
 */
const getUploadFinishedCallback = (req: Request,
                                   res: Response,
                                   next: NextFunction,
                                   uploadResponderStrategy: IUploadResponderStrategy):
                                    (filename: string, fileData: Buffer, mimeType: string) => void => {
  return (filename: string, fileData: Buffer, mimeType: string) => {
    try {
      const session: Session = req.session as Session;
      const companyNumber: string = retrieveCompanyProfileFromObjectionSession(session).companyNumber;
      const token: string = retrieveAccessTokenFromSession(session);
      const objectionId: string = retrieveFromObjectionSession(session, SESSION_OBJECTION_ID);

      // TODO this will need await if addAttachment is made async
      objectionService.addAttachment(companyNumber, token, objectionId, fileData, filename);
    } catch (e) {
      logger.error(`User has attempted to upload a ` +
                     `file ${filename}, mime-type: ${mimeType} ` +
                     `of size ${fileData.length} bytes. The api has returned the error: ${e.message}`);

      // TODO OBJ-101 - file type error - uncomment below should do it
      // // render errors in the view
      // if (e.status === 415) {
      //   return await
      //     displayError(req, res, UploadErrorMessages.INVALID_MIME_TYPES, uploadResponderStrategy, attachments);
      // }
      return uploadResponderStrategy.handleGenericError(res, e, next);
    }
    logger.debug("Successfully uploaded file " + filename);
    return uploadResponderStrategy.handleSuccess(req, res);
  };
};

/**
 * Displays an error message on the page
 * @param {Response} res http response
 * @param {string} errorMessage the error message to display on the page
 * @param {IUploadResponderStrategy} uploadResponderStrategy the strategy for responding to requests
 * @param {any[]} attachments the list of attachments
 */
const displayError = async (res: Response,
                            errorMessage: string,
                            uploadResponderStrategy: IUploadResponderStrategy,
                            attachments: any[]) => {
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
