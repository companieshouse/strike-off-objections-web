import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { Templates } from "../model/template.paths";

export const sessionTimeout = (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;
  const sessionExpired = getSecondsSinceEpoch() > (session.get(SessionKey.Expires) || Number.MAX_VALUE);

  if (session && sessionExpired) {
    // Find out what is returned from getSecondsSinceEpoch and session.get(SessionKey.Expires)
    // Make sure data is removed
    // Make sure user is logged out
    logger.debug("Redirecting to session timeout page");
    logger.debug(session.get(SessionKey.Expires) as string);
    return res.render(Templates.SESSION_TIMEOUT);
  }
  next();
};

export function getSecondsSinceEpoch(): number {
  return Math.round(new Date().getTime() / 1000);
}