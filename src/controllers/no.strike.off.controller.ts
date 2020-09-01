import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";
import {
  retrieveCompanyProfileFromObjectionSession,
} from "../services/objection.session.service";

export const get = (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;

  const { companyName } = retrieveCompanyProfileFromObjectionSession(session)

  return res.render(Templates.NO_STRIKE_OFF, {
    companyName,
    templateName: Templates.NO_STRIKE_OFF,
  });
};
