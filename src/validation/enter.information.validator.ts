/* istanbul ignore file */
import { check, Result, ValidationError } from "express-validator";

import { createGovUkErrorData } from "../model/govuk.error.data";
import { ErrorMessages } from "../model/error.messages";

const ENTER_INFORMATION = "information";

export const validators = [
  check(ENTER_INFORMATION).not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ENTER_OBJECTION_INFORMATION),
];

export const createErrorData = (errors: Result) => {
  const enterInformationErrorMessage = errors.array({ onlyFirstError: true })
    .map((err: ValidationError) => err.msg)
    .pop() as string;

  return createGovUkErrorData(
    enterInformationErrorMessage,
    "#" + ENTER_INFORMATION,
    true,
    "");
};