import { NextFunction, Request, Response } from "express";
import { check, Result, ValidationError, validationResult } from "express-validator";
import { ErrorMessages } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { OBJECTIONS_COMPANY_NUMBER } from "../model/page.urls";
import {
  addObjectionCreateToObjectionSession, retrieveFromObjectionSession,
  retrieveObjectionSessionFromSession
} from "../services/objection.session.service";
import { Objection, ObjectionCreate } from "../modules/sdk/objections";
import { Session } from "ch-node-session-handler";
import { Templates } from "../model/template.paths";
import { getObjection } from "../services/objection.service";
import logger from "../utils/logger";
import { CHANGE_ANSWER_KEY } from "../constants";

const FULL_NAME_FIELD = "fullName";
const DIVULGE_INFO_FIELD = "shareIdentity";

const validators = [
  check(FULL_NAME_FIELD).not().isEmpty().withMessage(ErrorMessages.ENTER_FULL_NAME),
  check(DIVULGE_INFO_FIELD).not().isEmpty().withMessage(ErrorMessages.SELECT_TO_DIVULGE),
];

const getExistingPageData = async (session: Session, res: Response, next: NextFunction) => {
  try {
    const objection: Objection = await getObjection(session) as Objection;
    const existingName: string = objection.created_by.fullName;
    const existingShareIdneity: string = (objection.created_by.shareIdentity === true) ? "yes" : "no";
    if (existingName && existingShareIdneity) {
      return res.render(Templates.OBJECTING_ENTITY_NAME, {
        fullNameValue: existingName,
        isYesChecked: existingShareIdneity === "yes",
        isNoChecked: existingShareIdneity === "no",
        templateName: Templates.OBJECTING_ENTITY_NAME,
      });
    } else {
      return next(new Error("Existing data not present"));
    }
  } catch (e) {
    logger.error(e.message);
    return next(e);
  }
}

const isChangeAnswerFlagPresentSetAndSetToTrue = (session: Session): boolean => {
  const changeAnswer: boolean = retrieveFromObjectionSession(session, CHANGE_ANSWER_KEY);
  if (changeAnswer) {
    return changeAnswer === true;
  }
  return false;
};

/**
 * GET checks for change flag and renders page
 * @param req
 * @param res
 * @param next
 */
export const get = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session | undefined = req.session as Session;
  if (session) {
    if (isChangeAnswerFlagPresentSetAndSetToTrue(session)) {
      // TODO OBJ-287 handle this more formally.
      delete retrieveObjectionSessionFromSession(session)[CHANGE_ANSWER_KEY];

      return await getExistingPageData(session, res, next);
    } else {
      return res.render(Templates.OBJECTING_ENTITY_NAME, {
        templateName: Templates.OBJECTING_ENTITY_NAME,
      });
    }
    return next(new Error("No Session present"));
  }
}

/**
 * POST validates input and processes form
 * @param req
 * @param res
 * @param next
 */
export const post = [...validators, (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return showErrorsOnScreen(errors, req, res);
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

const showErrorsOnScreen = (errors: Result, req: Request, res: Response) => {
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

  const fullNameValue: string = req.body.fullName;
  return res.render(Templates.OBJECTING_ENTITY_NAME, {
    fullNameValue,
    isYesChecked: req.body.shareIdentity === "yes",
    isNoChecked: req.body.shareIdentity === "no",
    shareIdentityErr,
    errorList: errorListData,
    objectingEntityNameErr,
    templateName: Templates.OBJECTING_ENTITY_NAME,
  });
}
