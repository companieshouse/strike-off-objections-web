import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { GovUkErrorData } from "model/govuk.error.data";

import { Session } from "@companieshouse/node-session-handler";

import { objectorOrganisation } from "../validation";
import { OBJECTIONS_OBJECTING_ENTITY_NAME } from "../model/page.urls";
import { Templates } from "../model/template.paths";

import logger from "../utils/logger";
import { addToObjectionSession, retrieveFromObjectionSession } from "../services/objection.session.service";
import { SESSION_OBJECTOR } from "../constants";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const objectorOrganisationField = retrieveFromObjectionSession(req.session as Session, SESSION_OBJECTOR);
    res.render(Templates.OBJECTOR_ORGANISATION_PAGE, {
      isMyselfOrCompanyChecked: objectorOrganisationField === "myself-or-company",
      isClientChecked: objectorOrganisationField === "client",
      templateName: Templates.OBJECTOR_ORGANISATION_PAGE
    });
  } catch (e) {
    logger.error(e.message);
    return next(e);
  }
};

const postObjectorOrganisation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      addToObjectionSession(req.session as Session, SESSION_OBJECTOR, req.body["objector-organisation"]);
      return res.redirect(OBJECTIONS_OBJECTING_ENTITY_NAME), { templateName: Templates.OBJECTOR_ORGANISATION_PAGE };
    }

    const selectObjectorOrganisation: GovUkErrorData = objectorOrganisation.createErrorData(errors);

    return res.render(Templates.OBJECTOR_ORGANISATION_PAGE, {
      errorList: [selectObjectorOrganisation],
      selectObjectorOrganisation,
      templateName: Templates.OBJECTOR_ORGANISATION_PAGE
    });

  } catch (e) {
    logger.error(e.message);
    return next(e);
  }
};

export const post = [...objectorOrganisation.validators, postObjectorOrganisation];