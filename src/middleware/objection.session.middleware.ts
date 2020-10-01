import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { OBJECTIONS_SESSION_NAME } from "../constants";
import ObjectionSessionExtraData from "../model/objection.session.extra.data";
import { ACCESSIBILITY_STATEMENT } from "../model/page.urls";

export const objectionSessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (isTheAccessibilityStatementUrl(req.originalUrl)) {
    return next();
  }

  const session: Session = req.session as Session;
  if (session) {
    const objectionsSession: ObjectionSessionExtraData | undefined = session.getExtraData(OBJECTIONS_SESSION_NAME);
    if (objectionsSession) {
      return next();
    }

    const objSession: ObjectionSessionExtraData = {};
    session.setExtraData(OBJECTIONS_SESSION_NAME, objSession);
    return next();
  }

  return next(new Error("No Session to add objections session"));
};

const isTheAccessibilityStatementUrl = (url: string): boolean => {
  return url.endsWith(ACCESSIBILITY_STATEMENT);
};
