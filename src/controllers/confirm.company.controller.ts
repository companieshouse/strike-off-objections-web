import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { SESSION_OBJECTION_ID } from "../constants";
import { OBJECTIONS_ENTER_INFORMATION, OBJECTIONS_NO_STRIKE_OFF, OBJECTIONS_NOTICE_EXPIRED } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { EligibilityStatus, ObjectionCreate, ObjectionStatus } from "../modules/sdk/objections";
import { createNewObjection, getCompanyEligibility } from "../services/objection.service";
import {
  addToObjectionSession,
  deleteObjectionCreateFromObjectionSession,
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveObjectionCreateFromObjectionSession
} from "../services/objection.session.service";
import logger from "../utils/logger";
import { formatCHSDateForDisplay } from "../utils/date.formatter";
import { getLatestGaz1FilingHistoryItem } from "../services/company.filing.history.service";
import { FilingHistoryItem } from "@companieshouse/api-sdk-node/dist/services/company-filing-history";

const INELIGIBLE_PAGES = {
  [ObjectionStatus.INELIGIBLE_COMPANY_STRUCK_OFF]: OBJECTIONS_NOTICE_EXPIRED,
  [ObjectionStatus.INELIGIBLE_NO_DISSOLUTION_ACTION]: OBJECTIONS_NO_STRIKE_OFF,
  [ObjectionStatus.INELIGIBLE_GAZ2_REQUESTED]: OBJECTIONS_NOTICE_EXPIRED,
};

/**
 * GET controller for check company details screen
 * @param req
 * @param res
 * @param next
 */

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;

  if (session) {
    try {
      const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(session);

      const token: string = retrieveAccessTokenFromSession(session);

      let latestGaz1Date: string;
      const { eligibility_status } = await getCompanyEligibility(company.companyNumber, token);

      if (eligibility_status === EligibilityStatus.ELIGIBLE) {
        latestGaz1Date = await getLatestGaz1Date(company.companyNumber, token);
      } else if (eligibility_status === EligibilityStatus.INELIGIBLE_GAZ2_REQUESTED ||
                 eligibility_status === EligibilityStatus.INELIGIBLE_COMPANY_STRUCK_OFF) {
        latestGaz1Date = "Notice expired";
      } else {
        latestGaz1Date = "No notice in The Gazette";
      }

      return res.render(Templates.CONFIRM_COMPANY, {
        company,
        latestGaz1Date,
      });
    } catch (e) {
      logger.errorRequest(req, "Error retrieving company profile from session");
      return next(e);
    }
  }

  return next(new Error("No Session present"));
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;
  try {
    const token: string = retrieveAccessTokenFromSession(session);
    const { companyNumber }: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(session);
    const objectionCreate: ObjectionCreate = retrieveObjectionCreateFromObjectionSession(session);
    const { objectionId, objectionStatus } = await createNewObjection(companyNumber, token, objectionCreate);

    const ineligiblePage = getIneligiblePage(objectionStatus);
    if (ineligiblePage) {
      deleteObjectionCreateFromObjectionSession(session);
      logger.info(`Objection status is ${objectionStatus} for objection id ${objectionId}, company ${companyNumber},`
        + ` redirecting user to ${ineligiblePage}`);
      return res.redirect(ineligiblePage);
    }

    addToObjectionSession(session, SESSION_OBJECTION_ID, objectionId);
    return res.redirect(OBJECTIONS_ENTER_INFORMATION);
  } catch (e) {
    deleteObjectionCreateFromObjectionSession(session);
    return next(e);
  }
};

const getIneligiblePage = (objectionStatus: ObjectionStatus): string => {
  return INELIGIBLE_PAGES[objectionStatus];
};

const getLatestGaz1Date = async (companyNumber: string, token: string): Promise<string> => {
  const filingHistoryItem: FilingHistoryItem = await getLatestGaz1FilingHistoryItem(companyNumber, token);

  if (!filingHistoryItem) {
    throw new Error(`No GAZ1 present for company: ${companyNumber}`);
  }

  return formatCHSDateForDisplay(filingHistoryItem.date);
};

