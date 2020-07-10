import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { SESSION_OBJECTION_ID } from "../constants";
import { UploadErrorMessages } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { Templates } from "../model/template.paths";
import { addAttachment, getAttachments } from "../services/objection.service";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession, retrieveFromObjectionSession,
} from "../services/objection.session.service";
import logger from "../utils/logger";
import { MAX_FILE_SIZE_BYTES } from "../utils/properties";
import { uploadFile, UploadFileCallbacks } from "./upload/http.request.file.uploader";
import { createUploadResponderStrategy, IUploadResponderStrategy } from "./upload/upload.responder.strategy.factory";

/**
 * Handle GET request for document upload page
 * @param {Request} req the http request
 * @param {Response} res the http response
 */
export const get = async (req: Request, res: Response) => {
  const attachments = getAttachments(req.session as Session);

  return res.render(Templates.DOCUMENT_UPLOAD,
    {
      attachments,
      templateName: Templates.DOCUMENT_UPLOAD,
    });
};

/**
 * Handle POST request for document upload page
 * @param {Request} req the http request
 * @param {Response} res the http response
 * @param {NextFunction} next the next function in the middleware chain
 */
export const postFile = async (req: Request, res: Response, next: NextFunction) => {
  const isAjaxRequest: boolean = req.xhr;
  logger.debugRequest(req, "Add document http request type is " + (isAjaxRequest ? "" : "NOT ") + "AJAX / XmlHttpRequest");

  const uploadResponderStrategy: IUploadResponderStrategy = createUploadResponderStrategy(isAjaxRequest);

  const attachments = getAttachments(req.session as Session);

  const uploadCallbacks: UploadFileCallbacks = {
    fileSizeLimitExceededCallback: getFileSizeLimitExceededCallback(req, res, uploadResponderStrategy, attachments),
    noFileDataReceivedCallback: getNoFileDataReceivedCallback(req, res, uploadResponderStrategy, attachments),
    uploadFinishedCallback: getUploadFinishedCallback(req, res, next, uploadResponderStrategy),
  };
  const maxSizeBytes: number = parseInt(MAX_FILE_SIZE_BYTES, 10);

  return uploadFile(req, maxSizeBytes, uploadCallbacks);
};

export const postContinueButton = async (req: Request, res: Response, next: NextFunction) => {
  const isAjaxRequest: boolean = req.xhr;
  const uploadResponderStrategy: IUploadResponderStrategy = createUploadResponderStrategy(isAjaxRequest);

  const attachments = getAttachments(req.session as Session);

  if (attachments && attachments.length === 0) {
    return displayError(req, res, UploadErrorMessages.NO_DOCUMENTS_ADDED, uploadResponderStrategy, attachments);
  }
  res.redirect("TODO - PAGE AFTER UPLOAD");
};

const getFileSizeLimitExceededCallback = (req: Request,
                                          res: Response,
                                          uploadResponderStrategy: IUploadResponderStrategy,
                                          attachments: any[]): (filename: string, maxInBytes: number) => void => {
  return (filename: string, maxInBytes: number) => {
    const maxInMB: number = getMaxFileSizeInMB(maxInBytes);
    logger.debug("File limit " + maxInMB + "MB reached for file " + filename);
    const errorMsg: string = `${UploadErrorMessages.FILE_TOO_LARGE} ${maxInMB} MB`;
    return displayError(req, res, errorMsg, uploadResponderStrategy, attachments);
  };
};

const getNoFileDataReceivedCallback = (req: Request,
                                       res: Response,
                                       uploadResponderStrategy: IUploadResponderStrategy,
                                       attachments: any[]): (filename: string) => void => {
  return async (_filename: string) => {
    return await displayError(req, res, UploadErrorMessages.NO_FILE_CHOSEN, uploadResponderStrategy, attachments);
  };
};

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

      addAttachment(companyNumber, token, objectionId, fileData, filename);
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

const displayError = async (req: Request,
                            res: Response,
                            errorMessage: string,
                            uploadResponderStrategy: IUploadResponderStrategy,
                            attachments: any) => {
  const documentUploadErrorData: GovUkErrorData =
    createGovUkErrorData(errorMessage, "#file-upload", true, "");
  return uploadResponderStrategy.handleGovUKError(res, documentUploadErrorData, attachments);
};

// Gets max file size in MB rounded down to nearest whole number
const getMaxFileSizeInMB = (maxSizeInBytes: number): number => {
  return Math.floor(maxSizeInBytes / (1024 * 1024));
};
