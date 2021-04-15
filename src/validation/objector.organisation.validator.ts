/* istanbul ignore file */
import { check, Result, ValidationError } from "express-validator";

import { createGovUkErrorData } from "../model/govuk.error.data";
import { ErrorMessages } from "../model/error.messages";

const OBJECTOR_ORGANISATION = "objector-organisation";

export const validators = [
  check(OBJECTOR_ORGANISATION).not().isEmpty().withMessage(ErrorMessages.SELECT_OBJECTOR_ORGANISATION),
];

export const createErrorData = (errors: Result) => {
  const errorText = errors.array()
    .map((err: ValidationError) => err.msg)
    .pop() as string;

  return createGovUkErrorData(
    errorText,
    "#" + OBJECTOR_ORGANISATION,
    true,
    "");
};