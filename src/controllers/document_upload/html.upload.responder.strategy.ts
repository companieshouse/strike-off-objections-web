import { NextFunction, Request, Response } from "express";
import { GovUkErrorData } from "../../model/govuk.error.data";
import { OBJECTIONS_DOCUMENT_UPLOAD } from "../../model/page.urls";
import { Templates } from "../../model/template.paths";
import { Attachment } from "../../modules/sdk/objections";
import { UploadResponderStrategy } from "./upload.responder.strategy";

/**
 * UploadResponderStrategy for responding to HTML (non AJAX) requests to upload
 */
export class HtmlUploadResponderStrategy implements UploadResponderStrategy {

  /**
   * Redirects back to the upload screen to force it to reload
   * @param {Request} req http request
   * @param {Response} res http response
   */
  public handleSuccess = (req: Request, res: Response): Promise<void> => {
    res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
    return Promise.resolve();
  };

  /**
   * Passes the error onto the generic error handler
   * @param {Response} res http response
   * @param {Error} e the error
   * @param {NextFunction} next the next middleware function
   */
  public handleGenericError = (res: Response, e: Error, next?: NextFunction): Promise<void> => {
    if (next) {
      next(e);
    }
    return Promise.resolve();
  };

  /**
   * Renders the upload screen with the error
   * @param {Response} res http response
   * @param {GovUkErrorData} errorData the error information to display
   * @param {Attachment[]} attachments the list of uploaded attachments
   */
  public handleGovUKError = (res: Response, errorData: GovUkErrorData, attachments: Attachment[]): Promise<void> => {
    res.render(Templates.DOCUMENT_UPLOAD, {
      attachments,
      documentUploadErr: errorData,
      errorList: [errorData],
      templateName: Templates.DOCUMENT_UPLOAD,
    });
    return Promise.resolve();
  };
}
