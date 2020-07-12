import { NextFunction, Request, Response } from "express";
import { IGovUkErrorData } from "../../model/govuk.error.data";

/**
 * Interface for a strategy to allow the document upload controller
 * to respond to the client in different ways.
 */
export interface IUploadResponderStrategy {
  handleSuccess(req: Request, res: Response): void;
  handleGenericError(res: Response, e: Error, next?: NextFunction): void;
  handleGovUKError(res: Response, errorData: IGovUkErrorData, attachments: any[]): void;
}
