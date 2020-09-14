import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { OBJECTIONS_CONFIRMATION } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import {CreatedBy, Objection} from "../modules/sdk/objections";
import { getObjection, submitObjection } from "../services/objection.service";
import { retrieveCompanyProfileFromObjectionSession } from "../services/objection.session.service";
import logger from "../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    try {
      const { companyName, companyNumber } = retrieveCompanyProfileFromObjectionSession(req.session);
      let shareIdentity: string = "No";
      const objection: Objection = await getObjection(req.session);
      if (objection) {
        const createdBy: CreatedBy = objection["created_by"];
        if (createdBy) {
          shareIdentity = (createdBy.shareIdentity === true) ? "Yes" : "No";
        }
      }
      return res.render(Templates.CHECK_YOUR_ANSWERS, {
        companyName,
        companyNumber,
        objection,
        shareIdentity,
        templateName: Templates.CHECK_YOUR_ANSWERS,
      });
    } catch (e) {
      logger.errorRequest(req, "Error retrieving company profile from session");
      return next(e);
    }
  }
  return next(new Error("No Session present"));
};

export const post = async (req: Request, res: Response) => {
  await submitObjection(req.session as Session);

  return res.redirect(OBJECTIONS_CONFIRMATION);
};
