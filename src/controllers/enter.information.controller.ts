import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { SESSION_OBJECTION_ID } from "../constants";
import { Templates } from "../model/template.paths";
import { createNewObjection } from "../services/objection.service";
import {
  addToObjectionSession,
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
} from "../services/objection.session.service";

const route = async (req: Request, res: Response, next: NextFunction) => {

  const session: Session = req.session as Session;
  const token: string = retrieveAccessTokenFromSession(session);

  const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(session);

  const objectionId: string = await createNewObjection(company.companyNumber, token);

  addToObjectionSession(session, SESSION_OBJECTION_ID, objectionId);

  return res.render(Templates.ENTER_INFORMATION, {
    templateName: Templates.ENTER_INFORMATION,
  });
};

export default route;
