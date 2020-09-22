import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { SESSION_OBJECTION_ID } from "../constants";
import { OBJECTIONS_DOCUMENT_UPLOAD } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { updateObjectionReason } from "../services/objection.service";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveFromObjectionSession,
} from "../services/objection.session.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  return res.render(Templates.ENTER_INFORMATION, {
    templateName: Templates.ENTER_INFORMATION,
  });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;
  const token: string = retrieveAccessTokenFromSession(session);

  const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(session);
  const objectionId: string = retrieveFromObjectionSession(session, SESSION_OBJECTION_ID);

  const reason: string = req.body.information;

  try {
    await updateObjectionReason(company.companyNumber, objectionId, token, reason);
  } catch (e) {
    return next(e);
  }

  return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
};
