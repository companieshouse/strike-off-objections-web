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
import { uploadFile } from "./upload/http.request.file.uploader";
import { createUploadResponderStrategy, IUploadResponderStrategy } from "./upload/upload.responder.strategy.factory";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const attachments = getAttachments(req.session as Session);

  return res.render(Templates.DOCUMENT_UPLOAD,
    {
      attachments,
      templateName: Templates.DOCUMENT_UPLOAD,
    });
};

const getFileSizeLimitExceededHandler = (req: Request,
                                         res: Response,
                                         uploadResponderStrategy: IUploadResponderStrategy,
                                         attachments: any[]): (filename: string, maxInMB: number) => void => {
  return (filename: string, maxInMB: number) => {
    logger.debug("File limit " + maxInMB + "MB reached for file " + filename);
    const errorMsg: string = `${UploadErrorMessages.FILE_TOO_LARGE} ${maxInMB} MB`;
    return buildError(req, res, errorMsg, uploadResponderStrategy, attachments);
  };
};

const getNoFileDataReceivedHandler = (req: Request,
                                      res: Response,
                                      uploadResponderStrategy: IUploadResponderStrategy,
                                      attachments: any[]): (filename: string) => void => {
  return async (_filename: string) => {
    return await buildError(req, res, UploadErrorMessages.NO_FILE_CHOSEN, uploadResponderStrategy, attachments);
  };
};

const getUploadFinishedHandler = (req: Request,
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
      // TODO include user name/id in log?
      logger.error(`User has attempted to upload a ` +
                     `file ${filename}, mime-type: ${mimeType} ` +
                     `of size ${fileData.length} bytes. The api has returned the error: ${e.message}`);

      // TODO OBJ-101 - file type error - uncomment below should do it
      // // render errors in the view
      // if (e.status === 415) {
      //   return await
      //     buildError(req, res, UploadErrorMessages.INVALID_MIME_TYPES, uploadResponderStrategy, attachments);
      // }
      return uploadResponderStrategy.handleGenericError(res, e, next);
    }
    logger.debug("Successfully uploaded file " + filename);
    return uploadResponderStrategy.handleSuccess(req, res);
  };
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Add document http request type is " + (req.xhr ? "" : "NOT ") + "AJAX / XmlHttpRequest");
  const uploadResponderStrategy: IUploadResponderStrategy = createUploadResponderStrategy(req.xhr);

  const attachments = getAttachments(req.session as Session);

  if (req.xhr) {
    const fileSizeLimitExceededHandler =
      getFileSizeLimitExceededHandler(req, res, uploadResponderStrategy, attachments);
    const noFileDataReceivedHandler =
      getNoFileDataReceivedHandler(req, res, uploadResponderStrategy, attachments);
    const uploadFinishedHandler =
      getUploadFinishedHandler(req, res, next, uploadResponderStrategy);

    const maxSizeBytes: number = parseInt(MAX_FILE_SIZE_BYTES, 10);

    return uploadFile(req,
                      maxSizeBytes,
                      fileSizeLimitExceededHandler,
                      noFileDataReceivedHandler,
                      uploadFinishedHandler);
  } else {
    if (attachments && attachments.length === 0) {
      return buildError(req, res, UploadErrorMessages.NO_DOCUMENTS_ADDED, uploadResponderStrategy, attachments);
    }
    res.redirect("TODO - PAGE AFTER UPLOAD");
  }
};

const buildError = async (req: Request,
                          res: Response,
                          errorMessage: string,
                          uploadResponderStrategy: IUploadResponderStrategy,
                          attachments: any) => {
  const documentUploadErrorData: GovUkErrorData =
    createGovUkErrorData(errorMessage, "#file-upload", true, "");
  return uploadResponderStrategy.handleGovUKError(res, documentUploadErrorData, attachments);
};
