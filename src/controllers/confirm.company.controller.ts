import { NextFunction, Request, Response } from "express";
import { ObjectionCompanyProfile } from "../model/objection.company.profile";
import { Templates } from "../model/template.paths";
import { getCompanyProfile } from "../services/company.profile.service";

/**
 * GET controller for check company details screen
 * @param req
 * @param res
 * @param next
 */
export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const companyNumber: string = req.body.companyNumber;
    const token: string = "";
    const company: ObjectionCompanyProfile = await getCompanyProfile(companyNumber, token);

    return res.render(Templates.CONFIRM_COMPANY , {
        company,
        templateName: Templates.CONFIRM_COMPANY ,
    });
};

export default [route];
