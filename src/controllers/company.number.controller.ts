import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "../model/objection.company.profile";
import { OBJECTIONS_CONFIRM_COMPANY } from "../model/page.urls";
import { getCompanyProfile } from "../services/company.profile.service";
import {
  addCompanyProfileToObjectionSession,
  retrieveAccessTokenFromSession,
} from "../services/objection.session.service";
import logger from "../utils/logger";
import { check, validationResult } from "express-validator";
import { CompanySearchErrorMessages } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { Templates } from "../model/template.paths";
import { ValidationError } from "../model/validation.error";

const companyNumberFieldName: string = "companyNumber";

// validator middleware that checks for alpha numeric company number, an empty company number or one that is too long
const preValidators = [
  check(companyNumberFieldName).blacklist(" ").escape().not().isEmpty().withMessage(CompanySearchErrorMessages.NO_COMPANY_NUMBER_SUPPLIED),
  check(companyNumberFieldName).isAlphanumeric().withMessage(CompanySearchErrorMessages.INVALID_COMPANY_NUMBER),
  check(companyNumberFieldName).blacklist(" ").escape().isLength({ max: 8 }).withMessage(CompanySearchErrorMessages.COMPANY_NUMBER_TOO_LONG),
];

// pads company number to 8 digits with zeros and removes whitespace
const padCompanyNumber = (req: Request, res: Response, next: NextFunction): void => {
  let companyNumber: string = req.body.companyNumber;
  if (/^([a-zA-Z]{2}?)/gm.test(companyNumber)) {
    companyNumber = formatCompanyNumber(companyNumber, 2);
  } else if (/^([a-zA-Z])/gm.test(companyNumber)) {
    companyNumber = formatCompanyNumber(companyNumber, 1);
  } else {
    companyNumber = companyNumber.padStart(8, "0");
  }
  req.body.companyNumber = companyNumber;
  return next();
};

const formatCompanyNumber = (companyNumber: string, leadPoint: number): string  => {
  const leadingLetters = companyNumber.substring(0, leadPoint);
  let trailingChars = companyNumber.substring(leadPoint, companyNumber.length);
  trailingChars = trailingChars.padStart((8 - leadPoint), "0");
  return leadingLetters + trailingChars;
};

// validator middleware that checks for invalid characters in the input
const postValidators = [
  check(companyNumberFieldName).blacklist(" ").escape().custom((value: string) => {
    if (value.length !== 8 || !/^[a-z]{0,2}?\d+?$/gmi.test(value)) {
      throw new Error(CompanySearchErrorMessages.INVALID_COMPANY_NUMBER);
    }
    return true;
  }),
];

/**
 * POST controller for company number screen
 * @param req
 * @param res
 * @param next
 */
const post = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debugRequest(req, "Attempt to retrieve and show the company details");

  const errors = validationResult(req);

  // render errors in the view
  if (!errors.isEmpty()) {
    const errorText = errors.array({ onlyFirstError: true })
      .map((err: ValidationError) => err.msg)
      .pop() as string;

    return buildError(res, errorText);
  }

  const companyNumber: string = req.body.companyNumber;
  const session: Session = req.session as Session;
  logger.infoRequest(req, `Retrieving company profile for company number ${companyNumber}`);

  let token: string;
  try {
    token = retrieveAccessTokenFromSession(session);

    const company: ObjectionCompanyProfile = await getCompanyProfile(companyNumber, token);

    addCompanyProfileToObjectionSession(session, company);
    return res.redirect(OBJECTIONS_CONFIRM_COMPANY);
  } catch (e) {
    logger.error(`Error fetching company profile for company number ${companyNumber}`);

    if (e.status === 404) {
      buildError(res, CompanySearchErrorMessages.COMPANY_NOT_FOUND);
    } else {
      return next(e);
    }
  }
};

const buildError = (res: Response, errorMessage: string): void => {
  const companyNumberErrorData: GovUkErrorData = createGovUkErrorData(
    errorMessage,
    "#company-number",
    true,
    "");
  return res.render(Templates.COMPANY_NUMBER, {
    companyNumberErr: companyNumberErrorData,
    errorList: [companyNumberErrorData],
    templateName: Templates.COMPANY_NUMBER,
  });
};

export default [...preValidators, padCompanyNumber, ...postValidators, post];
