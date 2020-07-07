import { NextFunction, Request, Response } from "express";
import { GovUkErrorData } from "../../model/govuk.error.data";
import { OBJECTIONS_DOCUMENT_UPLOAD } from "../../model/page.urls";
import { Templates } from "../../model/template.paths";
import { IUploadResponderStrategy } from "./upload.responder.strategy.factory";

export class HtmlUploadResponderStrategy implements IUploadResponderStrategy {

  public handleSuccess = async (req: Request, res: Response) => {
    return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
  }

  public handleGenericError = (res: Response, e: Error, next?: NextFunction) => {
    if (next) {
      return next(e);
    }
  }

  public handleGovUKError = (res: Response, errorData: GovUkErrorData, attachments: any[]) => {
    return res.render(Templates.DOCUMENT_UPLOAD, {
      attachments,
      documentsUploadErr: errorData,
      errorList: [errorData],
      templateName: Templates.DOCUMENT_UPLOAD,
    });
  }
}
