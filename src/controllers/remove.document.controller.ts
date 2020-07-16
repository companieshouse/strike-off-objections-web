import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";
import { Attachment } from "../modules/sdk/objections";
import * as objectionService from "../services/objection.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Change the two lines below to call endpoint for individual attachment - see spec
  const attachments: Attachment[] = await objectionService.getAttachments(req.session as Session);
  const attachment = attachments.filter((attachmentItem) => attachmentItem.id === req.query.documentID).pop();
  if (attachment) {
    return res.render(Templates.REMOVE_DOCUMENT, {
      fileName: attachment.name,
      templateName: Templates.REMOVE_DOCUMENT,
    });
  } else {
    return res.render(Templates.REMOVE_DOCUMENT);
  }
};
