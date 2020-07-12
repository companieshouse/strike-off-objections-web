import { NextFunction, Request, Response } from "express";
import { GovUkErrorData } from "../../model/govuk.error.data";

/**
 * Interface for a strategy to allow the document upload controller
 * to respond to the client in different ways.
 */
export interface UploadResponderStrategy {
  handleSuccess(req: Request, res: Response): void;
  handleGenericError(res: Response, e: Error, next?: NextFunction): void;
  handleGovUKError(res: Response, errorData: GovUkErrorData, attachments: any[]): void;
}
