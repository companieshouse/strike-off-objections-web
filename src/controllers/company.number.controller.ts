import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { SESSION_COMPANY_PROFILE } from "../constants";
import ObjectionCompanyProfile from "../model/objection.company.profile";
import { OBJECTIONS_CONFIRM_COMPANY } from "../model/page.urls";
import { getCompanyProfile } from "../services/company.profile.service";
import { addToObjectionsSession, createObjectionsSession, getValidAccessToken } from "../services/objections.session.service";
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
    const token: string = getValidAccessToken(session) as string;

    const company: ObjectionCompanyProfile = await getCompanyProfile(companyNumber, token);

    if (session) {
        createObjectionsSession(session);
        addToObjectionsSession(session, SESSION_COMPANY_PROFILE, company);
    }
    return res.redirect(OBJECTIONS_CONFIRM_COMPANY);
};

export default route;
