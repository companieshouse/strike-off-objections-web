import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { GovUkErrorData } from "model/govuk.error.data";

import { objectorOrganisation } from "../validation";

import { OBJECTIONS_OBJECTING_ENTITY_NAME } from "../model/page.urls";
import { Templates } from "../model/template.paths";

import logger from "../utils/logger";

const postObjectorOrganisation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return res.redirect(OBJECTIONS_OBJECTING_ENTITY_NAME);
    }

    const selectObjectorOrganisation: GovUkErrorData = objectorOrganisation.createErrorData(errors);

    return res.render(Templates.OBJECTOR_ORGANISATION_PAGE, {
      errorList: [selectObjectorOrganisation],
      selectObjectorOrganisation,
    });

  } catch (e) {
    logger.error(e.message);
    return next(e);
  }
};

export const post = [...objectorOrganisation.validators, postObjectorOrganisation];