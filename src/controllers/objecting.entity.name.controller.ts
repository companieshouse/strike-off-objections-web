import { NextFunction, Request, Response } from "express";
import { check, Result, ValidationError, validationResult } from "express-validator";
import { ErrorMessages } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { OBJECTIONS_COMPANY_NUMBER } from "../model/page.urls";
import { addObjectionCreateToObjectionSession } from "../services/objection.session.service";
import { ObjectionCreate } from "../modules/sdk/objections";
import { Session } from "ch-node-session-handler";
import { Templates } from "../model/template.paths";

const FULL_NAME_FIELD = "fullName";
const DIVULGE_INFO_FIELD = "shareIdentity";

const validators = [
  check(FULL_NAME_FIELD).not().isEmpty().withMessage(ErrorMessages.ENTER_FULL_NAME),
  check(DIVULGE_INFO_FIELD).not().isEmpty().withMessage(ErrorMessages.SELECT_TO_DIVULGE),
];

/**
 * POST validates input and processes form
 * @param req
 * @param res
 * @param next
 */
export const post = [...validators, (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return showErrorsOnScreen(errors, res);
  }
  const fullNameValue: string = req.body.fullName;
  const shareIdentityValue: boolean = req.body.shareIdentity === "yes";
  const objectionCreate: ObjectionCreate = { shareIdentity: shareIdentityValue, fullName: fullNameValue };
  const session: Session | undefined  = req.session;
  if (session) {
    addObjectionCreateToObjectionSession(session, objectionCreate);
    return res.redirect(OBJECTIONS_COMPANY_NUMBER);
  } else {
    const error: Error = new Error("Session not present");
    next(error);
  }
}];

const showErrorsOnScreen = (errors: Result, res: Response) => {
  const errorListData: GovUkErrorData[] = [];
  let objectingEntityNameErr: GovUkErrorData | undefined = undefined;
  let shareIdentityErr: GovUkErrorData | undefined = undefined;
  errors.array({ onlyFirstError: true })
    .forEach((valErr: ValidationError) => {
      const govUkErrorData: GovUkErrorData = createGovUkErrorData(valErr.msg, "#" + valErr.param, true, "");
      switch ((valErr.param)) {
          case FULL_NAME_FIELD:
            objectingEntityNameErr = govUkErrorData;
            break;
          case DIVULGE_INFO_FIELD:
            shareIdentityErr = govUkErrorData;
            break;
      }
      errorListData.push(govUkErrorData);
    });
  return res.render(Templates.OBJECTING_ENTITY_NAME, {
    shareIdentityErr,
    errorList: errorListData,
    objectingEntityNameErr,
    templateName: Templates.OBJECTING_ENTITY_NAME,
  });
}
