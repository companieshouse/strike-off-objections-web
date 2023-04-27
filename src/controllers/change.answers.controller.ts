import { NextFunction, Request, Response } from "express";
import { addToObjectionSession } from "../services/objection.session.service";
import { Session } from "@companieshouse/node-session-handler";
import { STRIKE_OFF_OBJECTIONS } from "../model/page.urls";
import { CHANGE_ANSWER_KEY } from "../constants";
import { getWhitelistedReturnToURL } from "../utils/request.util";

export const get = (req: Request, res: Response, next: NextFunction) => {
  const session: Session | undefined = req.session as Session;
  if (session) {
    const changePageQuery: string | undefined = req.query["changePage"] as string;
    if (changePageQuery) {
      addToObjectionSession(session, CHANGE_ANSWER_KEY, true);
      const url: string = STRIKE_OFF_OBJECTIONS + "/" + changePageQuery;
      return res.redirect(getWhitelistedReturnToURL(url));
    }
    return next(new Error("No page name present to change to"));
  }
  return next(new Error("No Session present"));
};
