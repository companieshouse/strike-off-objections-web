import { NextFunction, Request, Response } from "express";
import { OBJECTIONS_SESSION } from "../constants";
import { Templates } from "../model/template.paths";
import logger from "../utils/logger";

/**
 * GET controller for check company details screen
 * @param req
 * @param res
 * @param next
 */

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.session && req.session.data) {
        const company: string = req.session.data[OBJECTIONS_SESSION].company_data;
        return res.render(Templates.CONFIRM_COMPANY, {
            company,
            templateName: Templates.CONFIRM_COMPANY,
        });
    } else {
        logger.error("Error displaying company data");
    }
};

export default [route];
