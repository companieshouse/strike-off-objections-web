import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator/check";
import { COMPANY_NOT_FOUND } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { ObjectionCompanyProfile } from "../model/objection.company.profile";
import { OBJECTIONS_CONFIRM_COMPANY } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { ValidationError } from "../model/validation.error";
import { getCompanyProfile } from "../services/company.profile.service";
import { addToObjectionsSession, createObjectionsSession } from "../services/objections.session.service";
import logger from "../utils/logger";

const buildError = (res: Response, errorMessage: string): void => {
    const companyNumberErrorData: GovUkErrorData = createGovUkErrorData(
        errorMessage,
        "#company-number",
        true,
        "");
    return res.render(Templates.COMPANY_NUMBER, {
        companyNumberErr: companyNumberErrorData,
        errorList: [companyNumberErrorData],
        templateName: Templates.COMPANY_NUMBER,
    });
};

/**
 * POST controller for company number screen
 * @param req
 * @param res
 * @param next
 */
const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug("Attempt to retrieve and show the company details");

    const companyNumber: string = req.body.companyNumber;
    const session: Session = req.session as Session;
    logger.info(`Retrieving company profile for company number ${companyNumber}`);
    const token: string = getValidToken(session, req) as string;

    const company: ObjectionCompanyProfile = await getCompanyProfile(companyNumber, token);

    if (session) {
        createObjectionsSession(session);
        addToObjectionsSession(session, "company_data", company);
    }
    return res.redirect(OBJECTIONS_CONFIRM_COMPANY);
};

const getValidToken = (session: Session, req: Request): string | undefined => {
    const signIn = session.data.signin_info;
    if (signIn && signIn.access_token) {
        return signIn.access_token.access_token as string;
    } else {
        logger.error("Access token is missing");
    }
    return undefined;
};

export default [route];
