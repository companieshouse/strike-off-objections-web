import { NextFunction, Request, Response } from "express";
import {check, validationResult} from "express-validator/check";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { ValidationError } from "../model/validation.error";
import { ErrorMessages } from "../model/error.messages";
import { OBJECTIONS_COMPANY_NUMBER } from "../model/page.urls";
import { Templates } from "../model/template.paths";

const validators = [
  check("fullName").not().isEmpty().withMessage(ErrorMessages.ENTER_FULL_NAME),
  check("divulgeInfo").not().isEmpty().withMessage(ErrorMessages.SELECT_TO_DIVULGE),
];

export const processForm = [...validators, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errMsg = errors.array({onlyFirstError: true}).map((err: ValidationError) => err.msg).pop() as string;
    if (errMsg) {
      const objectingEntityNameErr: GovUkErrorData = createGovUkErrorData(errMsg, "objecting-entity-name", true, "blank");
      return res.render(Templates.OBJECTING_ENTITY_NAME, {
        errorList: [
          objectingEntityNameErr,
        ],
        objectingEntityNameErr,
        templateName: Templates.OBJECTING_ENTITY_NAME,
      });
    }
  } else {
    return res.redirect(OBJECTIONS_COMPANY_NUMBER)
  }
}];

// /**
//  * POST controller for objecting entity name screen
//  * @param req
//  * @param res
//  * @param next
//  */
// export const post = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   if (req.body.fullName.isEmpty()) {
//
//   }
//
//   return res.redirect(OBJECTIONS_COMPANY_NUMBER)
// };
