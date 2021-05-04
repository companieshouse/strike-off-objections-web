/* istanbul ignore file */
import { check, Result, ValidationError } from "express-validator";

import { createGovUkErrorData } from "../model/govuk.error.data";
import { ErrorMessages } from "../model/error.messages";
import { OBJECTOR_ORGANISATION, ENTER_INFORMATION } from "../constants";

export const validators = {
  [OBJECTOR_ORGANISATION]: [check(OBJECTOR_ORGANISATION).not().isEmpty().withMessage(ErrorMessages.SELECT_OBJECTOR_ORGANISATION)],
  [ENTER_INFORMATION]: check(ENTER_INFORMATION).not().isEmpty().withMessage(ErrorMessages.REASON_TEXT_BOX_EMPTY),
};

export const createErrorData = (errors: Result, id: string) => {
  const errorText = errors.array()
    .map((err: ValidationError) => err.msg)
    .pop() as string;

  return createGovUkErrorData(errorText, "#" + id, true, "");
};
