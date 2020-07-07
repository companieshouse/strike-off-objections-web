import { NextFunction, Request, Response } from "express";
import { GovUkErrorData } from "../../model/govuk.error.data";
import { AjaxUploadResponderStrategy } from "./ajax.upload.responder.strategy";
import { HtmlUploadResponderStrategy } from "./html.upload.responder.strategy";

export interface IUploadResponderStrategy {
  handleSuccess(req: Request, res: Response): void;
  handleGenericError(res: Response, e: Error, next?: NextFunction): void;
  handleGovUKError(res: Response, errorData: GovUkErrorData, attachments: any[]): void;
}

export const createUploadResponderStrategy = (isXhr: boolean): IUploadResponderStrategy => {
  if (isXhr) {
    return new AjaxUploadResponderStrategy();
  } else {
    return new HtmlUploadResponderStrategy();
  }
};
