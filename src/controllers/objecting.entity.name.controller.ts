import { NextFunction, Request, Response } from "express";
import { check, ValidationError, validationResult } from "express-validator/check";
import { ErrorMessages } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { OBJECTIONS_COMPANY_NUMBER } from "../model/page.urls";
import { Templates } from "../model/template.paths";

const FULL_NAME_FIELD: string = "fullName";
const DIVULGE_INFO_FIELD: string = "divulgeInfo";

const validators = [
  check(FULL_NAME_FIELD).not().isEmpty().withMessage(ErrorMessages.ENTER_FULL_NAME),
  check(DIVULGE_INFO_FIELD).not().isEmpty().withMessage(ErrorMessages.SELECT_TO_DIVULGE),
];

export const processForm = [...validators, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  const errorListData: GovUkErrorData[] = [];
  if (!errors.isEmpty()) {
    let objectingEntityNameErr: GovUkErrorData | undefined;
    let divulgeInfoErr: GovUkErrorData | undefined;

    errors.array({ onlyFirstError: true })
      .forEach((valErr: ValidationError) => {
        const govUkErrorData: GovUkErrorData = createGovUkErrorData(valErr.msg, "#" + valErr.param, true, "");
        switch ((valErr.param)) {
            case FULL_NAME_FIELD:
              objectingEntityNameErr = govUkErrorData;
              break;
            case DIVULGE_INFO_FIELD:
              divulgeInfoErr = govUkErrorData;
              break;
        }

        errorListData.push(govUkErrorData);
      });
    return res.render(Templates.OBJECTING_ENTITY_NAME, {
      divulgeInfoErr,
      errorList: errorListData,
      objectingEntityNameErr,
      templateName: Templates.OBJECTING_ENTITY_NAME,
    });
  } else {
    return res.redirect(OBJECTIONS_COMPANY_NUMBER)
  }
}];
