import { NextFunction, Request, Response } from "express";
import { IGovUkErrorData } from "../../model/govuk.error.data";
import { OBJECTIONS_DOCUMENT_UPLOAD } from "../../model/page.urls";
import { Templates } from "../../model/template.paths";
import { IUploadResponderStrategy } from "./upload.responder.strategy";

/**
 * UploadResponderStrategy for responding to HTML (non AJAX) requests to upload
 */
export class HtmlUploadResponderStrategy implements IUploadResponderStrategy {

  /**
   * Redirects back to the upload screen to force it to reload
   * @param {Request} req http request
   * @param {Response} res http response
   */
  public handleSuccess = async (req: Request, res: Response) => {
    return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
  }

  /**
   * Passes the error onto the generic error handler
   * @param {Response} res http response
   * @param {Error} e the error
   * @param {NextFunction} next the next middleware function
   */
  public handleGenericError = (res: Response, e: Error, next?: NextFunction) => {
    if (next) {
      return next(e);
    }
  }

  /**
   * Renders the upload screen with the error
   * @param {Response} res http response
   * @param {IGovUkErrorData} errorData the error information to display
   * @param {any[]} attachments the list of uploaded attachments
   */
  public handleGovUKError = (res: Response, errorData: IGovUkErrorData, attachments: any[]) => {
    return res.render(Templates.DOCUMENT_UPLOAD, {
      attachments,
      documentsUploadErr: errorData,
      errorList: [errorData],
      templateName: Templates.DOCUMENT_UPLOAD,
    });
  }
}