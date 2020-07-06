import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { Templates } from "../model/template.paths";
import { retrieveCompanyProfileFromObjectionSession } from "../services/objection.session.service";
import logger from "../utils/logger";

/**
 * GET controller for check company details screen
 * @param req
 * @param res
 * @param next
 */

const route = (req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    try {
      const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(req.session);
      return res.render(Templates.CONFIRM_COMPANY, {
        company,
        templateName: Templates.CONFIRM_COMPANY,
      });
    } catch (e) {
      logger.errorRequest(req, "Error retrieving company profile from session");
      return next(e);
    }
  }

  return next(new Error("No Session present"));
};

export default route;
