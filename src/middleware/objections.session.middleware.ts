import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { OBJECTIONS_SESSION_NAME } from "../constants";
import ObjectionSessionExtraData from "../model/objection.session.extra.data";

const objectionsSessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;
  if (session) {
    const objectionsSession: ObjectionSessionExtraData | undefined = session.getExtraData("objections_session");
    if (objectionsSession) {
      return next();
    }

    const objSession: ObjectionSessionExtraData = {};
    session.setExtraData(OBJECTIONS_SESSION_NAME, objSession);
    return next();
  }

  return next(new Error("No Session to add objections session"));
};

export default objectionsSessionMiddleware;
