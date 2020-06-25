import { NextFunction, Request, Response } from "express";
import { SESSION_COMPANY_PROFILE } from "../constants";
import { Templates } from "../model/template.paths";
import { getValueFromObjectionsSession } from "../services/objections.session.service";
import logger from "../utils/logger";

/**
 * GET controller for check company details screen
 * @param req
 * @param res
 * @param next
 */

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.session && req.session.data) {
        const company: string = getValueFromObjectionsSession(req.session, SESSION_COMPANY_PROFILE);
        return res.render(Templates.CONFIRM_COMPANY, {
            company,
            templateName: Templates.CONFIRM_COMPANY,
        });
    } else {
        logger.errorRequest(req, "Confirm Company - no company data found in session");
    }
};

export default [route];
