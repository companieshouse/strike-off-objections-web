import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";
import { Attachment } from "../modules/sdk/objections";
import { getAttachment } from "../services/objection.service";

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
