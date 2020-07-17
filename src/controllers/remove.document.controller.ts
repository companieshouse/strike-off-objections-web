import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { OBJECTIONS_DOCUMENT_UPLOAD } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { Attachment } from "../modules/sdk/objections";
import { getAttachment } from "../services/objection.service";
import logger from "../utils/logger";

const REMOVE_DOCUMENT_FORM_FIELD: string = "removeDocument";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;
  const attachmentId: string = req.query.documentID as string;
  if (session && attachmentId) {
    const attachment: Attachment = await getAttachment(session, attachmentId);
    if (attachment) {
      return res.render(Templates.REMOVE_DOCUMENT, {
        fileName: attachment.name,
        templateName: Templates.REMOVE_DOCUMENT,
      });
    } else {
      return res.render(Templates.REMOVE_DOCUMENT);
    }
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body[REMOVE_DOCUMENT_FORM_FIELD] === "yes") {
    logger.infoRequest(req, "Yes journey not yet implemented");
    return next(new Error("Yes journey not yet implemented"));
  } else {
    return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
  }
};
