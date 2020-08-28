import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { SESSION_OBJECTION_ID } from "../constants";
import { OBJECTIONS_ENTER_INFORMATION } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { createNewObjection } from "../services/objection.service";
import {
  addToObjectionSession,
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession
} from "../services/objection.session.service";
import logger from "../utils/logger";

/**
 * GET controller for check company details screen
 * @param req
 * @param res
 * @param next
 */

export const get = (req: Request, res: Response, next: NextFunction) => {
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

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session
  try {
    const token: string = retrieveAccessTokenFromSession(session);
    const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(session);
    const objectionId = await createNewObjection(company.companyNumber, token);
    addToObjectionSession(session, SESSION_OBJECTION_ID, objectionId);
    return res.redirect(OBJECTIONS_ENTER_INFORMATION);
  } catch (e) {
    return next(e);
  }
};

