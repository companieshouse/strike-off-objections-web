import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "../model/objection.company.profile";
import { Templates } from "../model/template.paths";
import { retrieveCompanyProfileFromObjectionSession } from "../services/objection.session.service";
import logger from "../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    try {
      const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(req.session);
      return res.render(Templates.CHECK_YOUR_ANSWERS, {
        companyName: company.companyName,
        companyNumber: company.companyNumber,
        templateName: Templates.CHECK_YOUR_ANSWERS,
      });
    } catch (e) {
      logger.errorRequest(req, "Error retrieving company profile from session");
      return next(e);
    }
  }

  return next(new Error("No Session present"));
};
