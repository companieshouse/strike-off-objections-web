import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "../model/objection.company.profile";
import { Templates } from "../model/template.paths";
import { Objection } from "../modules/sdk/objections";
import { getObjection } from "../services/objection.service";
import { retrieveCompanyProfileFromObjectionSession } from "../services/objection.session.service";
import logger from "../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.session) {
    try {
      const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(req.session);

      const objection: Objection = await getObjection(req.session as Session);

      logger.debug("Objection returned from API: " + JSON.stringify(objection, null, 2));

      return res.render(Templates.CHECK_YOUR_ANSWERS, {
        companyName: company.companyName,
        companyNumber: company.companyNumber,
        objection,
        templateName: Templates.CHECK_YOUR_ANSWERS,
      });
    } catch (e) {
      logger.errorRequest(req, "Error retrieving company profile from session");
      return next(e);
    }
  }

  return next(new Error("No Session present"));
};
