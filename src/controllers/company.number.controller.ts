import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "../model/objection.company.profile";
import ObjectionSessionExtraData from "../model/objection.session.extra.data";
import { OBJECTIONS_CONFIRM_COMPANY } from "../model/page.urls";
import { getCompanyProfile } from "../services/company.profile.service";
import {
  retrieveAccessTokenFromSession,
  retrieveObjectionsSessionFromSession,
} from "../services/objections.session.service";
import logger from "../utils/logger";

/**
 * POST controller for company number screen
 * @param req
 * @param res
 * @param next
 */
const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debugRequest(req, "Attempt to retrieve and show the company details");

  const companyNumber: string = req.body.companyNumber;
  const session: Session = req.session as Session;
  logger.infoRequest(req, `Retrieving company profile for company number ${companyNumber}`);

  let token: string;
  try {
    token = retrieveAccessTokenFromSession(session);
  } catch (e) {
    return next(e);
  }

  const company: ObjectionCompanyProfile = await getCompanyProfile(companyNumber, token);

  const objectionsSessionExtraData: ObjectionSessionExtraData = retrieveObjectionsSessionFromSession(session);
  if (objectionsSessionExtraData) {
    objectionsSessionExtraData.companyProfile = company;
    return res.redirect(OBJECTIONS_CONFIRM_COMPANY);
  }

  return next(new Error("No objections session extra data to add company too"));
};

export default route;
