import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { check, Result, ValidationError, validationResult } from "express-validator";
import { ErrorMessages } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { OBJECTIONS_DOCUMENT_UPLOAD } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { Attachment } from "../modules/sdk/objections";
import { deleteAttachment, getAttachment } from "../services/objection.service";
import logger from "../utils/logger";

const REMOVE_DOCUMENT_FORM_FIELD = "removeDocument";
const ATTACHMENT_ID_FIELD = "attachmentId";

const validators = [
  check(REMOVE_DOCUMENT_FORM_FIELD).not().isEmpty().withMessage(ErrorMessages.SELECT_TO_REMOVE),
];

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
      templateName: Templates.REMOVE_DOCUMENT
    });
  } catch (e) {
    logger.errorRequest(req, e.message);
    return next(e);
  }
};

export const post = [...validators, async (req: Request, res: Response, next: NextFunction) => {
  logger.debugRequest(req, "POST remove document received");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return showErrorsOnScreen(errors, req, res);
  }

  if (req.body[REMOVE_DOCUMENT_FORM_FIELD] === "yes") {
    const session: Session = req.session as Session;
    const attachmentId: string = req.body[ATTACHMENT_ID_FIELD];
    if (!attachmentId) {
      return next(new Error("No attachment id found in form body"));
    }
    logger.debugRequest(req, `Removing document with attachmentId ${attachmentId}`);
    try {
      await deleteAttachment(session, attachmentId);
    } catch (e) {
      return next(e);
    }
  }
  return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
}];

const showErrorsOnScreen = async (errors: Result, req: Request, res: Response) => {
  const errorText = errors.array()
    .map((err: ValidationError) => err.msg)
    .pop() as string;
  const removeDocumentError: GovUkErrorData = createGovUkErrorData(
    errorText,
    "#remove-document",
    true,
    "");
  const session: Session = req.session as Session;
  const attachmentId: string = req.params[ATTACHMENT_ID_FIELD];

  const attachment: Attachment = await getAttachment(session, attachmentId);
  return res.render(Templates.REMOVE_DOCUMENT, {
    attachmentId,
    errorList: [removeDocumentError],
    fileName: attachment.name,
    removeDocumentError,
    templateName: Templates.REMOVE_DOCUMENT
  });
};
