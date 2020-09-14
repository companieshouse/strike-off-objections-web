import { NextFunction, Request, Response } from "express";
import { check, ValidationError, validationResult } from "express-validator";
import { ErrorMessages } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { OBJECTIONS_COMPANY_NUMBER } from "../model/page.urls";
import { addObjectionCreateToObjectionSession } from "../services/objection.session.service";
import { ObjectionCreate } from "../modules/sdk/objections";
import { Session } from "ch-node-session-handler";
import { Templates } from "../model/template.paths";

const FULL_NAME_FIELD: string = "fullName";
const DIVULGE_INFO_FIELD: string = "shareIdentity";

const validators = [
  check(FULL_NAME_FIELD).not().isEmpty().withMessage(ErrorMessages.ENTER_FULL_NAME),
  check(DIVULGE_INFO_FIELD).not().isEmpty().withMessage(ErrorMessages.SELECT_TO_DIVULGE),
];

/**
 * ProcessForm validates input and processes form
 * @param req
 * @param res
 * @param next
 */
export const processForm = [...validators, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  const errorListData: GovUkErrorData[] = [];
  if (!errors.isEmpty()) {
    let objectingEntityNameErr: GovUkErrorData | undefined;
    let shareIdentityErr: GovUkErrorData | undefined;

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
  } else {
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
  }
}];
