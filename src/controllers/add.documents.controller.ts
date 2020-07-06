import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { SESSION_COMPANY_PROFILE, SESSION_OBJECTION_ID } from "../constants";
import { Templates } from "../model/template.paths";
import { updateObjectionReason } from "../services/objections.service";
import { getValidAccessToken, getValueFromObjectionsSession } from "../services/objections.session.service";

const route = async (req: Request, res: Response, next: NextFunction) => {

  const session: Session = req.session as Session;
  const token: string = getValidAccessToken(session) as string;

  const company: ObjectionCompanyProfile = getValueFromObjectionsSession(session, SESSION_COMPANY_PROFILE);
  const objectionId: string = getValueFromObjectionsSession(session, SESSION_OBJECTION_ID);

  const reason: string = req.body.information;

  await updateObjectionReason(company.companyNumber, objectionId, token, reason);

  // TODO Redirect to the 'add documents' screen when this is available, for now just stay on the same screen

  return res.render(Templates.ENTER_INFORMATION, {
    templateName: Templates.ENTER_INFORMATION,
  });
};

export default route;
