import { NextFunction, Request, Response } from "express";
import { check, Result, ValidationError, validationResult } from "express-validator";
import { ErrorMessages } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { OBJECTIONS_CHECK_YOUR_ANSWERS, OBJECTIONS_COMPANY_NUMBER } from "../model/page.urls";
import {
  addObjectionCreateToObjectionSession,
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveFromObjectionSession,
} from "../services/objection.session.service";
import { Objection, ObjectionCreate } from "../modules/sdk/objections";
import { Session } from "ch-node-session-handler";
import { Templates } from "../model/template.paths";
import { getObjection, updateObjectionUserDetails } from "../services/objection.service";
import logger from "../utils/logger";
import { CHANGE_ANSWER_KEY, SESSION_OBJECTION_CREATE, SESSION_OBJECTION_ID } from "../constants";
import ObjectionCompanyProfile from "../model/objection.company.profile";

const FULL_NAME_FIELD = "fullName";
const DIVULGE_INFO_FIELD = "shareIdentity";

const validators = [
  check(FULL_NAME_FIELD).not().isEmpty().withMessage(ErrorMessages.ENTER_FULL_NAME),
  check(DIVULGE_INFO_FIELD).not().isEmpty().withMessage(ErrorMessages.SELECT_TO_DIVULGE),
];

const showPageWithSessionDataIfPresent = (session: Session, res: Response) => {
  let existingName;
  let yesChecked: boolean = false;
  let noChecked: boolean = false;
  const objectionCreate: ObjectionCreate = retrieveFromObjectionSession(session, SESSION_OBJECTION_CREATE);
  if (objectionCreate) {
    existingName = objectionCreate.fullName;
    const existingSharedIdentity = objectionCreate.shareIdentity;
    yesChecked = existingSharedIdentity;
    noChecked = !existingSharedIdentity;
  }

  return res.render(Templates.OBJECTING_ENTITY_NAME, {
    fullNameValue: existingName,
    isYesChecked: yesChecked,
    isNoChecked: noChecked,
    templateName: Templates.OBJECTING_ENTITY_NAME,
  });
}

const showPageWithMongoData = async (session: Session, res: Response, next: NextFunction) => {
  try {
    const objection: Objection = await getObjection(session);
    const existingName: string = objection.created_by.fullName;
    const existingShareIdentity: boolean = objection.created_by.shareIdentity;
    if (existingName && existingShareIdentity !== undefined) {
      return res.render(Templates.OBJECTING_ENTITY_NAME, {
        fullNameValue: existingName,
        isYesChecked: existingShareIdentity,
        isNoChecked: !existingShareIdentity,
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

/**
 * GET checks for change flag and renders page
 * @param req
 * @param res
 * @param next
 */
export const get = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session | undefined = req.session as Session;
  if (session) {
    if (retrieveFromObjectionSession(session, CHANGE_ANSWER_KEY)) {
      return await showPageWithMongoData(session, res, next);
    } else {
      return showPageWithSessionDataIfPresent(session, res);
    }
  }
  return next(new Error("No Session present"));
}

const updateMongoWithChangedUserDetails = async (session: Session,
                                                 objectionCreate: ObjectionCreate) => {
  try {
    const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(session);
    const objectionId: string = retrieveFromObjectionSession(session, SESSION_OBJECTION_ID);
    const token: string = retrieveAccessTokenFromSession(session);
    await updateObjectionUserDetails(company.companyNumber, objectionId, token, objectionCreate);
  } catch (e) {
    logger.error(e.message);
    throw e;
  }
}

/**
 * POST validates input and processes form
 * @param req
 * @param res
 * @param next
 */
export const post = [...validators, async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return showErrorsOnScreen(errors, req, res);
  }
  const fullNameValue: string = req.body.fullName;
  const shareIdentityValue: boolean = req.body.shareIdentity === "yes";
  const objectionCreate: ObjectionCreate = { shareIdentity: shareIdentityValue, fullName: fullNameValue };
  const session: Session | undefined  = req.session;
  if (session) {
    if (retrieveFromObjectionSession(session, CHANGE_ANSWER_KEY)) {
      try {
        await updateMongoWithChangedUserDetails(session, objectionCreate);
      } catch (e) {
        logger.error(e.message);
        return next(e);
      }
      return res.redirect(OBJECTIONS_CHECK_YOUR_ANSWERS);
    }
    addObjectionCreateToObjectionSession(session, objectionCreate);
    return res.redirect(OBJECTIONS_COMPANY_NUMBER);
  } else {
    const error: Error = new Error("Session not present");
    return next(error);
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
