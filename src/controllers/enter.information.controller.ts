import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { SESSION_COMPANY_PROFILE, SESSION_OBJECTION_ID } from "../constants";
import { Templates } from "../model/template.paths";
import { createNewObjection } from "../services/objections.api.service";
import { addToObjectionsSession, getValidAccessToken, getValueFromObjectionsSession } from "../services/objections.session.service";

const route = (req: Request, res: Response, next: NextFunction) => {

  const session: Session = req.session as Session;
  const token: string = getValidAccessToken(session) as string;

  const company: ObjectionCompanyProfile = getValueFromObjectionsSession(session, SESSION_COMPANY_PROFILE);

  const objectionId: string = createNewObjection(company.companyNumber, token);

  addToObjectionsSession(session, SESSION_OBJECTION_ID, objectionId);

  return res.render(Templates.ENTER_INFORMATION, {
    templateName: Templates.ENTER_INFORMATION,
  });
};

export default route;
