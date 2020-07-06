import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "../model/objection.company.profile";
import { OBJECTIONS_CONFIRM_COMPANY } from "../model/page.urls";
import { getCompanyProfile } from "../services/company.profile.service";
import {
  addCompanyProfileToObjectionSession,
  retrieveAccessTokenFromSession,
} from "../services/objection.session.service";
import logger from "../utils/logger";

/**
 * POST controller for company number screen
 * @param req
 * @param res
 * @param next
 */
export const post = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debugRequest(req, "Attempt to retrieve and show the company details");

  const companyNumber: string = req.body.companyNumber;
  const session: Session = req.session as Session;
  logger.infoRequest(req, `Retrieving company profile for company number ${companyNumber}`);

  let token: string;
  try {
    token = retrieveAccessTokenFromSession(session);

    const company: ObjectionCompanyProfile = await getCompanyProfile(companyNumber, token);

    addCompanyProfileToObjectionSession(session, company);
    return res.redirect(OBJECTIONS_CONFIRM_COMPANY);
  } catch (e) {
    return next(e);
  }
};
