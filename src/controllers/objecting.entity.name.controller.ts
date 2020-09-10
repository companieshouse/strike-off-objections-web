import { NextFunction, Request, Response } from "express";
import { OBJECTIONS_COMPANY_NUMBER } from "../model/page.urls";
import { addObjectionCreateToObjectionSession } from "../services/objection.session.service";
import { ObjectionCreate } from "../modules/sdk/objections";
import { Session } from "ch-node-session-handler";

/**
 * POST controller for objecting entity name screen
 * @param req
 * @param res
 * @param next
 */
export const post = (req: Request, res: Response, next: NextFunction) => {
  const shareIdentityString: string = req.body.shareIdentity;
  const fullNameValue: string = req.body.fullName;
  const shareIdentityValue: boolean = shareIdentityString === "yes";
  const objectionCreate: ObjectionCreate = { shareIdentity: shareIdentityValue, fullName: fullNameValue };

  const session: Session | undefined  = req.session;
  if (session) {
    addObjectionCreateToObjectionSession(session, objectionCreate);
    return res.redirect(OBJECTIONS_COMPANY_NUMBER);
  } else {
    const error: Error = new Error("Session not present");
    next(error);
  }
};
