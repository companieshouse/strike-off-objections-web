/* istanbul ignore file */
import { check, Result, ValidationError } from "express-validator";

import { createGovUkErrorData } from "../model/govuk.error.data";
import { ErrorMessages } from "../model/error.messages";

const ENTER_INFORMATION = "information";

export const validators = [
  check(ENTER_INFORMATION).not().isEmpty().withMessage(ErrorMessages.REASON_TEXT_BOX_EMPTY),
];

export const createErrorData = (errors: Result) => {
  const errorText = errors.array()
    .map((err: ValidationError) => err.msg)
    .pop() as string;

  return createGovUkErrorData(
    errorText,
    "#" + ENTER_INFORMATION,
    true,
    "");
};