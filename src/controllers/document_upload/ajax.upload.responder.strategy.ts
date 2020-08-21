import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ErrorMessages } from "../../model/error.messages";
import { GovUkErrorData } from "../../model/govuk.error.data";
import * as pageURLs from "../../model/page.urls";
import { Templates } from "../../model/template.paths";
import { Attachment } from "../../modules/sdk/objections";
import { getAttachments } from "../../services/objection.service";
import logger from "../../utils/logger";
import { UploadResponderStrategy } from "./upload.responder.strategy";

const FILE_LIST_DIV = "fileListDiv";
const CHOOSE_FILE_DIV = "fileUploadDiv";
const ERROR_SUMMARY_DIV = "errorSummaryDiv";

/**
 * UploadResponderStrategy for responding to AJAX requests to document upload
 * Renders page fragments to get html which is sent back to upload.js to dynamically update the screen
 */
export class AjaxUploadResponderStrategy implements UploadResponderStrategy {

  /**
   * Render new file list and file picker fragments on successful upload
   * @param {Request} req http request
   * @param {Response} res http response
   */
  public handleSuccess = async (req: Request, res: Response) => {
    const session: Session = req.session as Session;
    const replacementDivs: object[] = [];
    try {
      const attachments = await getAttachments(session);
      await this.renderFragment(res, Templates.DOCUMENT_UPLOAD_FILE_LIST, { attachments })
        .then((html: string) => this.addReplacementDiv(replacementDivs, html, FILE_LIST_DIV));
      logger.trace("Rendered fragment " + Templates.DOCUMENT_UPLOAD_FILE_LIST);

      await this.renderFragment(res, Templates.DOCUMENT_UPLOAD_FILE_PICKER, { attachments })
        .then((html: string) =>  this.addReplacementDiv(replacementDivs, html, CHOOSE_FILE_DIV));
      logger.trace("Rendered fragment " + Templates.DOCUMENT_UPLOAD_FILE_PICKER);

      return res.send({divs: replacementDivs});
    } catch (e) {
      this.handleGenericError(res, e);
    }
  }

  /**
   * As the AJAX response is handled by upload.js this will return a message to instruct it to redirect
   * to the error page
   * @param {Request} res http request
   * @param {Error} e the error
   * @param {NextFunction} _next the next middleware function
   */
  public handleGenericError = (res: Response, e: Error, _next?: NextFunction) => {
    logger.error(ErrorMessages.ERROR_500 + ": " + e);
    return res.status(500).send({ redirect: pageURLs.OBJECTIONS_ERROR });
  }

  /**
   * Renders the 'red' gov.uk error boxes and returns them to upload.js
   * @param {Response} res http response
   * @param {GovUkErrorData} errorData data to display in the nunjucks error component
   * @param {Attachment[]} attachments list of uploaded attachments
   */
  public handleGovUKError = async (res: Response,
                                   errorData: GovUkErrorData,
                                   attachments: Attachment[]) => {
    const replacementDivs: object[] = [];

    try {
      await this.renderFragment(res, Templates.DOCUMENT_UPLOAD_ERROR_SUMMARY, { errorList: [errorData] })
        .then((html: string) => this.addReplacementDiv(replacementDivs, html, ERROR_SUMMARY_DIV));

      logger.trace("Rendered fragment " + Templates.DOCUMENT_UPLOAD_ERROR_SUMMARY);

      await this.renderFragment(res,
                                Templates.DOCUMENT_UPLOAD_FILE_PICKER,
                                { attachments, documentUploadErr: errorData })
        .then((html: string) => this.addReplacementDiv(replacementDivs, html, CHOOSE_FILE_DIV));

      logger.trace("Rendered fragment " + Templates.DOCUMENT_UPLOAD_FILE_PICKER);

      return res.send({ divs: replacementDivs });
    } catch (e) {
      this.handleGenericError(res, e);
    }
  }

  private addReplacementDiv = (replacementDivs: object[], html: string, id: string): void => {
    replacementDivs.push(
      { divHtml: html,
        divId: id });
  }

  /**
   * Renders a nunjucks template and captures the html
   * @param {Response} res http response
   * @param {string} view the name of the template
   * @param {object} options the data to pass into the template
   */
  private renderFragment = async (res: Response, view: string, options: object): Promise<string> => {
    return await new Promise((resolve, reject) => {
      res.render(view,
                 options,
                 (err: Error, html: string) => {
                   if (err) {
                     reject(err);
                   } else {
                     resolve(html);
                   }
                 });
    });
  }
}
