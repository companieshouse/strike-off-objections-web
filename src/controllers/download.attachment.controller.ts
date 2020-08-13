import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";
import { downloadAttachment } from "../modules/sdk/objections";
import { retrieveAccessTokenFromSession } from "../services/objection.session.service";
import logger from "../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Attempting download of " + req.url);

  const session: Session = req.session as Session;
  const token: string = retrieveAccessTokenFromSession(session);

  await downloadAttachment(req.url, res, token)
    .catch((e) => {
      logger.error(e);
      res.status(e.status ? e.status : 500);
      switch (e.status) {
        case 401: {
          return res.render(Templates.FILE_ERROR,
            {heading: "Unauthorized", message: "You are not authorized to download this file."});
        }
        case 403: {
          return res.render(Templates.FILE_ERROR, {heading: "Forbidden", message: "This file cannot be downloaded."});
        }
        case 404: {
          return res.render(Templates.FILE_ERROR, {heading: "Not Found", message: "The file path could not be found."});
        }
        default: {
          return res.render(Templates.ERROR);
        }
      }
    });
};
