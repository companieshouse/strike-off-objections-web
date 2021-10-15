import { Session } from "@companieshouse/node-session-handler";
import { Request, Response } from "express";
import { OBJECTIONS_OBJECTOR_ORGANISATION } from "../model/page.urls";
import { OBJECTIONS_SESSION_NAME } from "../constants";
import { Templates } from "../model/template.paths";
import logger from "../utils/logger";

const deleteExtraData = (req) => {
  const session: Session | undefined = req.session as Session;
  if (session) {
    logger.debug("Deleting existing session data from " + OBJECTIONS_SESSION_NAME);
    session.deleteExtraData(OBJECTIONS_SESSION_NAME);
  }
};

export const get = (req: Request, res: Response) => {
  const { start } = req.query;

  if (start === "0") {
    deleteExtraData(req);
    return res.redirect(OBJECTIONS_OBJECTOR_ORGANISATION);
  } else {
    return res.render(Templates.INDEX, { templateName: Templates.INDEX });
  }
};

export const post = (req: Request, res: Response) => {
  deleteExtraData(req);
  return res.redirect(OBJECTIONS_OBJECTOR_ORGANISATION);
};