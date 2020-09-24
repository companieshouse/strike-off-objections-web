import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { CHANGE_ANSWER_KEY, SESSION_OBJECTION_ID } from "../constants";
import { OBJECTIONS_CHECK_YOUR_ANSWERS, OBJECTIONS_DOCUMENT_UPLOAD } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { Objection } from "../modules/sdk/objections";
import { updateObjectionReason, getObjection } from "../services/objection.service";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveFromObjectionSession,
} from "../services/objection.session.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await renderPageWithSessionDataIfPresent(req, res, next)
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

  const changingDetails = retrieveFromObjectionSession(session, CHANGE_ANSWER_KEY);
  if (changingDetails) {
    return res.redirect(OBJECTIONS_CHECK_YOUR_ANSWERS);
  } else {
    return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
  }
};

const renderPageWithSessionDataIfPresent = async (req: Request, res: Response, next: NextFunction) => {
  const objection: Objection = await getObjection(req.session as Session)
  let existingInformation;
  if (objection && objection.reason) {
    existingInformation = objection.reason;
  }
  if (existingInformation) {
    return res.render(Templates.ENTER_INFORMATION, {
      information: existingInformation,
      templateName: Templates.ENTER_INFORMATION,
    });
  } else {
    return res.render(Templates.ENTER_INFORMATION, {
      templateName: Templates.ENTER_INFORMATION,
    });
  }
};
