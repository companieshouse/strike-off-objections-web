import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { OBJECTIONS_COMPANY_PROFILE } from "../constants";
import { Templates } from "../model/template.paths";
import { getValueFromObjectionsSession } from "../services/objections.session.service";
import logger from "../utils/logger";

/**
 * GET controller for check company details screen
 * @param req
 * @param res
 * @param next
 */

export const route = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.data) {
        const company: ObjectionCompanyProfile = getValueFromObjectionsSession(req.session, OBJECTIONS_COMPANY_PROFILE);
        return res.render(Templates.CONFIRM_COMPANY, {
            company,
            templateName: Templates.CONFIRM_COMPANY,
        });
    } else {
        logger.error("Error displaying company data");
        // TODO - implement generic error page to be called with next(ERROR())
        // same as PTF eg next(e)
        return next();
    }
};

export default route;
