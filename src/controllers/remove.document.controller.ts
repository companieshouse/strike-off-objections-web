import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { OBJECTIONS_DOCUMENT_UPLOAD } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { Attachment } from "../modules/sdk/objections";
import { deleteAttachment, getAttachment } from "../services/objection.service";
import logger from "../utils/logger";

const REMOVE_DOCUMENT_FORM_FIELD = "removeDocument";
const ATTACHMENT_ID_FIELD = "attachmentId";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, "Getting remove document page");
    const session: Session = req.session as Session;
    const attachmentId: string = req.params[ATTACHMENT_ID_FIELD];

    const attachment: Attachment = await getAttachment(session, attachmentId);
    logger.debugRequest(req,
                        `Showing remove documents page for attachmentId ${attachmentId}, name: ${attachment.name}`);

    return res.render(Templates.REMOVE_DOCUMENT, {
      attachmentId,
      fileName: attachment.name,
      templateName: Templates.REMOVE_DOCUMENT,
    });
  } catch (e) {
    logger.errorRequest(req, e.message);
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  logger.debugRequest(req, "POST remove document received");
  if (req.body[REMOVE_DOCUMENT_FORM_FIELD] === "yes") {
    const session: Session = req.session as Session;
    const attachmentId: string = req.body[ATTACHMENT_ID_FIELD];
    if (attachmentId) {
      logger.debugRequest(req, `Removing document with attachmentId ${attachmentId}`);
      await deleteAttachment(session, attachmentId);
      return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
    } else {
      return next(new Error("No attachment id found in form body"));
    }
  } else {
    return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
  }
};
