import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { SESSION_OBJECTION_ID } from "../../constants";
import { ErrorMessages } from "../../model/error.messages";
import { GovUkErrorData } from "../../model/govuk.error.data";
import * as pageURLs from "../../model/page.urls";
import { Templates } from "../../model/template.paths";
import { getAttachments } from "../../services/objection.service";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession, retrieveFromObjectionSession,
} from "../../services/objection.session.service";
import logger from "../../utils/logger";
import { IUploadResponderStrategy } from "./upload.responder.strategy.factory";

export class AjaxUploadResponderStrategy implements IUploadResponderStrategy {

  public handleSuccess = async (req: Request, res: Response) => {
    const session: Session = req.session as Session;
    const companyNumber: string = retrieveCompanyProfileFromObjectionSession(session).companyNumber;
    const token: string = retrieveAccessTokenFromSession(session);
    const objectionId: string = retrieveFromObjectionSession(session, SESSION_OBJECTION_ID);
    const attachments = getAttachments(companyNumber, objectionId, token);
    const replacementDivs: object[] = [];

    try {
      await this.renderFragment(res, Templates.UPLOAD_FILE_LIST, { attachments })
        .then((html: string) => this.addReplacementDiv(replacementDivs, html, "fileListDiv"));
      logger.trace("Rendered fragment " + Templates.UPLOAD_FILE_LIST);

      await this.renderFragment(res, Templates.UPLOAD_FILE_PICKER, { attachments })
        .then((html: string) =>  this.addReplacementDiv(replacementDivs, html, "fileUploadDiv"));
      logger.trace("Rendered fragment " + Templates.UPLOAD_FILE_PICKER);

      res.send({divs: replacementDivs});
    } catch (e) {
      this.handleGenericError(res, e);
    }
  }

  public handleGenericError = (res: Response, e: Error, next?: NextFunction) => {
    logger.error(ErrorMessages.ERROR_500 + ": " + e);
    res.status(500).send({ redirect: pageURLs.OBJECTIONS_ERROR });
  }

  public handleGovUKError = async (res: Response,
                                   errorData: GovUkErrorData,
                                   attachments: any) => {
    const replacementDivs: object[] = [];

    try {
      await this.renderFragment(res, Templates.UPLOAD_ERROR_SUMMARY, { errorList: [errorData] })
        .then( (html: string) => this.addReplacementDiv(replacementDivs, html, "errorSummaryDiv"));

      logger.trace("Rendered fragment " + Templates.UPLOAD_ERROR_SUMMARY);

      await this.renderFragment(res, Templates.UPLOAD_FILE_PICKER, { attachments, documentUploadErr: errorData })
        .then((html: string) => this.addReplacementDiv(replacementDivs, html, "fileUploadDiv"));

      logger.trace("Rendered fragment " + Templates.UPLOAD_FILE_PICKER);

      res.send({ divs: replacementDivs });
    } catch (e) {
      this.handleGenericError(res, e);
    }
  }

  private addReplacementDiv = (replacementDivs: object[], html: string, id: string): void => {
    replacementDivs.push(
      { divHtml: html,
        divId: id });
  }

  private renderFragment = async (res: Response, view: string, options: object): Promise<string> => {
    return new Promise((resolve, reject) => {
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
