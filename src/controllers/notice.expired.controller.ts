import { Session } from "@companieshouse/node-session-handler";
import { Request, Response } from "express";
import { Templates } from "../model/template.paths";
import {
  retrieveCompanyProfileFromObjectionSession,
} from "../services/objection.session.service";

export const get = (req: Request, res: Response) => {
  const session: Session = req.session as Session;

  const { companyName } = retrieveCompanyProfileFromObjectionSession(session);

  return res.render(Templates.NOTICE_EXPIRED, {
    companyName,
    templateName: Templates.NOTICE_EXPIRED,
  });
};
