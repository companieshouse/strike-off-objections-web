import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { SESSION_OBJECTION_ID } from "../constants";
import { Templates } from "../model/template.paths";
import { retrieveFromObjectionSession, retrieveUserEmailFromSession } from "../services/objection.session.service";

export const get = (req: Request, res: Response, next: NextFunction) => {
  const session: Session | undefined  = req.session;
  if (session) {
    const email: string = retrieveUserEmailFromSession(session);
    const objectionId: string = retrieveFromObjectionSession(session, SESSION_OBJECTION_ID);
    return res.render(Templates.CONFIRMATION, {
      email,
      objectionId,
      templateName: Templates.CONFIRMATION,
    });
  } else {
    return next(new Error("No Session present"));
  }
};
