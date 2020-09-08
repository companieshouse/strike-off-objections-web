import { NextFunction, Request, Response } from "express";
import { OBJECTIONS_COMPANY_NUMBER } from "../model/page.urls";

/**
 * POST controller for objecting entity name screen
 * @param req
 * @param res
 * @param next
 */
export const post = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  return res.redirect(OBJECTIONS_COMPANY_NUMBER)
};
