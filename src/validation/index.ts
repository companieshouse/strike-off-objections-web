import { check, Result, ValidationError } from "express-validator";

import { createGovUkErrorData } from "../model/govuk.error.data";
import { ErrorMessages } from "../model/error.messages";
import {
  OBJECTOR_ORGANISATION,
  ENTER_INFORMATION,
  FULL_NAME_FIELD,
  MYSELF_OR_COMPANY,
  CLIENT,
  SHARE_IDENTITY_FIELD,
  SESSION_OBJECTOR,
  OBJECTING_ENTITY_NAME } from "../constants";
import { retrieveFromObjectionSession } from "../services/objection.session.service";

export const validators = {
  [OBJECTOR_ORGANISATION]: [check(OBJECTOR_ORGANISATION).not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.SELECT_OBJECTOR_ORGANISATION)],
  [ENTER_INFORMATION]: [check(ENTER_INFORMATION).not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMPTY_REASON)],
  [OBJECTING_ENTITY_NAME]: [
    check(FULL_NAME_FIELD).custom((value, { req }) => {

      const objectorOrganisationField = retrieveFromObjectionSession(req.session, SESSION_OBJECTOR);
      const noTextOrOnlyWhitespacesEntered = value?.trim() === "";

      if (objectorOrganisationField === MYSELF_OR_COMPANY && noTextOrOnlyWhitespacesEntered) {
        throw Error(ErrorMessages.ENTER_NAME_OR_COMPANY);
      } else if (objectorOrganisationField === CLIENT && noTextOrOnlyWhitespacesEntered) {
        throw Error(ErrorMessages.ENTER_ORGANISATION_NAME);
      }
      return true;
    }),
    check(SHARE_IDENTITY_FIELD).not().isEmpty().withMessage(ErrorMessages.SELECT_TO_DIVULGE),
  ]
};

export const createErrorData = (errors: Result, id: string) => {
  const errorText = errors.array()
    .map((err: ValidationError) => err.msg)
    .pop() as string;

  return createGovUkErrorData(errorText, "#" + id, true, "");
};
