import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { OBJECTIONS_DOCUMENT_UPLOAD } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { Attachment } from "../modules/sdk/objections";
import { deleteAttachment, getAttachment } from "../services/objection.service";

const REMOVE_DOCUMENT_FORM_FIELD: string = "removeDocument";
const ATTACHMENT_ID_FORM_FIELD: string = "attachmentId";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const attachmentId: string = req.query.documentID as string;
    const attachment: Attachment = await getAttachment(session, attachmentId);

    return res.render(Templates.REMOVE_DOCUMENT, {
        attachmentId,
        fileName: attachment.name,
        templateName: Templates.REMOVE_DOCUMENT,
      });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body[REMOVE_DOCUMENT_FORM_FIELD] === "yes") {
    const session: Session = req.session as Session;
    const attachmentId: string = req.body[ATTACHMENT_ID_FORM_FIELD];
    if (attachmentId) {
      await deleteAttachment(session, attachmentId);
      return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
    } else {
      return next(new Error("No attachment id found in form body"));
    }
  } else {
    return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
  }
};
