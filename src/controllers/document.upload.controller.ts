import Busboy from "busboy";
import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { Socket } from "net";
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
import { createUploadResponderStrategy, IUploadResponderStrategy } from "./upload/upload.responder.strategy.factory";

const maxSizeBytes: number = parseInt(MAX_FILE_SIZE_BYTES, 10);

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const attachments = getAttachments(req.session as Session);

  return res.render(Templates.DOCUMENT_UPLOAD,
    {
      attachments,
      templateName: Templates.DOCUMENT_UPLOAD,
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Add document http request type is " + (req.xhr ? "" : "NOT ") + "AJAX / XmlHttpRequest");
  const uploadResponderStrategy: IUploadResponderStrategy = createUploadResponderStrategy(req.xhr);

  const attachments = getAttachments(req.session as Session);

  if (req.xhr) { // TODO if is xhr/ajax req instead?
    return upload(req, res, next, uploadResponderStrategy, attachments);
  } else {
    return await validateAndGotoNextPage(req, res, next, uploadResponderStrategy, attachments);
  }
};

const validateAndGotoNextPage = async (req: Request,
                                       res: Response,
                                       next: NextFunction,
                                       uploadResponderStrategy: IUploadResponderStrategy,
                                       attachments: any) => {

  if (attachments && attachments.length === 0) {
    return buildError(req, res, UploadErrorMessages.NO_DOCUMENTS_ADDED, uploadResponderStrategy, attachments);
  }

  res.redirect("TODO - PAGE AFTER UPLOAD");
};

const upload = (req: Request,
                res: Response,
                next: NextFunction,
                uploadResponderStrategy: IUploadResponderStrategy,
                attachments: any[]) => {

  const chunkArray: Buffer[] = [];

  const busboy: busboy.Busboy = new Busboy({
    headers: req.headers,
    limits: {
      fileSize: maxSizeBytes,
    },
  });

  // Busboy on file received event - start of file upload process when start of a file is initially received
  busboy.on("file",
    (fieldName: string,
     fileStream: Socket,
     filename: string,
     encoding: string,
     mimeType: string) => {

    // File on data event - fired when a new chunk of data arrives into busboy
    fileStream.on("data", (chunk: Buffer) => {
      chunkArray.push(chunk);
      logger.trace("Received " + chunk.length + " bytes for file " + filename);
    });

    // File on limit event - fired when file size limit is reached
    fileStream.on("limit", () => {
      fileStream.destroy();
      const maxInMB: number = getMaxFileSizeInMB(maxSizeBytes);
      logger.debug("File limit " + maxInMB + "MB reached for file " + filename);
      const errorMsg: string = `${UploadErrorMessages.FILE_TOO_LARGE} ${maxInMB} MB`;
      return buildError(req, res, errorMsg, uploadResponderStrategy, attachments);
    });

    // File on end event - fired when file has finished - could be if file completed fully or ended
    // prematurely (destroyed / cancelled)
    fileStream.on("end", async () => {
      // if file ended prematurely - do nothing
      if (fileStream.destroyed) {
        return;
      }
      const fileData: Buffer = Buffer.concat(chunkArray);
      logger.debug("Total bytes received for " + filename + " = " + fileData.length);
      if (fileData.length === 0) {
        return await buildError(req, res, UploadErrorMessages.NO_FILE_CHOSEN, uploadResponderStrategy, attachments);
      }

      try {
        // await prepareAndSendAttachment(req, fileData, filename);
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
    }); // end fileStream.on("end") event
  }); // end busboy.on("file") event

  // send the request to busboy
  req.pipe(busboy);
};

// Gets max file size in MB rounded down to nearest whole number
const getMaxFileSizeInMB = (maxSizeInBytes: number): number => {
  return Math.floor(maxSizeInBytes / (1024 * 1024));
};

const buildError = async (req: Request,
                          res: Response,
                          errorMessage: string,
                          uploadResponderStrategy: IUploadResponderStrategy,
                          attachments: any): Promise<void> => {
  const documentUploadErrorData: GovUkErrorData =
    createGovUkErrorData(errorMessage, "#file-upload", true, "");
  return uploadResponderStrategy.handleGovUKError(res, documentUploadErrorData, attachments);
};
