import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { SESSION_COMPANY_PROFILE, SESSION_OBJECTION_ID } from "../constants";
import { OBJECTIONS_DOCUMENT_UPLOAD } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { createNewObjection } from "../services/objections.service";
import { addToObjectionsSession, getValidAccessToken, getValueFromObjectionsSession } from "../services/objections.session.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;
  const token: string = getValidAccessToken(session) as string;

  const company: ObjectionCompanyProfile = getValueFromObjectionsSession(session, SESSION_COMPANY_PROFILE);

  const objectionId: string = await createNewObjection(company.companyNumber, token);

  addToObjectionsSession(session, SESSION_OBJECTION_ID, objectionId);

  return res.render(Templates.ENTER_INFORMATION, {
    templateName: Templates.ENTER_INFORMATION,
  });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
};
