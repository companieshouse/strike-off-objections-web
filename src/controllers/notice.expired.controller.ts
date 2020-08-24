import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";
import {
  retrieveCompanyProfileFromObjectionSession,
} from "../services/objection.session.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;

  const companyName: string = retrieveCompanyProfileFromObjectionSession(session).companyName;

  return res.render(Templates.NOTICE_EXPIRED, {
    companyName,
    templateName: Templates.NOTICE_EXPIRED,
  });
};
