import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { CHANGE_ANSWER_KEY, ENTER_INFORMATION, SESSION_OBJECTION_ID, PREVIOUSLY_SELECTED_COMPANY, SESSION_COMPANY_PROFILE } from "../constants";
import { GovUkErrorData } from "model/govuk.error.data";
import { createErrorData, validators } from "../validation";
import { OBJECTIONS_CHECK_YOUR_ANSWERS, OBJECTIONS_DOCUMENT_UPLOAD } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { Objection } from "../modules/sdk/objections";
import { updateObjectionReason, getObjection } from "../services/objection.service";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveFromObjectionSession,
  addToObjectionSession,
} from "../services/objection.session.service";
import logger from "../utils/logger";
import { removeNonPrintableChars } from "../utils/string.formatter";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await renderPageWithSessionDataIfPresent(req, res);
  } catch (e) {
    logger.error(e.message);
    next(e);
  }
};

const postEnterInformation = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const informationError: GovUkErrorData = createErrorData(errors, ENTER_INFORMATION);
      return res.render(Templates.ENTER_INFORMATION, {
        errorList: [informationError],
        informationError,
        templateName: Templates.ENTER_INFORMATION
      });

    }

    const token: string = retrieveAccessTokenFromSession(session);

    const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(session);
    const objectionId: string = retrieveFromObjectionSession(session, SESSION_OBJECTION_ID);

    const reason: string = removeNonPrintableChars(req.body.information);

    await updateObjectionReason(company.companyNumber, objectionId, token, reason);

  } catch (e) {
    return next(e);
  }

  const changingDetails = retrieveFromObjectionSession(session, CHANGE_ANSWER_KEY);
  if (changingDetails) {
    return res.redirect(OBJECTIONS_CHECK_YOUR_ANSWERS);
  } else {
    return res.redirect(OBJECTIONS_DOCUMENT_UPLOAD);
  }
};

export const post = [...validators[ENTER_INFORMATION], postEnterInformation];

const renderPageWithSessionDataIfPresent = async (req: Request, res: Response) => {
  const objection: Objection = await getObjectionFromSession(req);
  let existingInformation;
  if (objection.reason) {
    existingInformation = objection.reason;
  }
  if (existingInformation) {
    return res.render(Templates.ENTER_INFORMATION, {
      information: existingInformation,
      templateName: Templates.ENTER_INFORMATION
    });
  } else {
    return res.render(Templates.ENTER_INFORMATION, { templateName: Templates.ENTER_INFORMATION });
  }
};

const getObjectionFromSession = async (req: Request) => {
  if (!req.session) {
    throw new Error("No session present");
  }
  const objection: Objection = await getObjection(req.session);
  const companyProfileInSession: ObjectionCompanyProfile = retrieveFromObjectionSession(req.session, SESSION_COMPANY_PROFILE);
  if (companyProfileInSession) {
    addToObjectionSession(req.session, PREVIOUSLY_SELECTED_COMPANY, companyProfileInSession.companyNumber);
  }
  return objection;
};