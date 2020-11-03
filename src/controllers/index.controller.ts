import { Session } from "@companieshouse/node-session-handler";
import { Request, Response } from "express";
import { OBJECTIONS_SESSION_NAME } from "../constants";
import { OBJECTIONS_OBJECTING_ENTITY_NAME } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import logger from "../utils/logger";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.INDEX, {
    templateName: Templates.INDEX,
  });
};

export const post = (req: Request, res: Response) => {
  const session: Session | undefined = req.session as Session;
  if (session) {
    logger.debug("Deleting existing session data from " + OBJECTIONS_SESSION_NAME);
    logger.debug(OBJECTIONS_SESSION_NAME);
    session.deleteExtraData(OBJECTIONS_SESSION_NAME);
    logger.debug("Existing session data deleted");
  }
  return res.redirect(OBJECTIONS_OBJECTING_ENTITY_NAME);
};
