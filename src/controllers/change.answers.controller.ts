import {NextFunction, Request, Response} from "express";
import {addToObjectionSession} from "../services/objection.session.service";
import {Session} from "ch-node-session-handler";
import {STRIKE_OFF_OBJECTIONS} from "../model/page.urls";
import {CHANGE_ANSWER_KEY} from "../constants";

export const get = (req: Request, res: Response, next: NextFunction) => {
  const session: Session | undefined = req.session as Session;
  if (session) {
    const query: string | undefined = req.query["changePage"] as string;
    if (query) {
      addToObjectionSession(session, CHANGE_ANSWER_KEY, true);
      const url: string = STRIKE_OFF_OBJECTIONS + "/" + query;
      return res.redirect(url);
    }
    return next(new Error("No query present"));
  }
  return next(new Error("No Session present"));
};
