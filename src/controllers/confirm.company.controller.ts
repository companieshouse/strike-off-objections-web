import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import ObjectionCompanyProfile from "model/objection.company.profile";
import { SESSION_OBJECTION_ID } from "../constants";
import { OBJECTIONS_ENTER_INFORMATION, OBJECTIONS_NO_STRIKE_OFF, OBJECTIONS_NOTICE_EXPIRED } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { ApiError, ObjectionCreate, ObjectionStatus } from "../modules/sdk/objections";
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
import { getCompanyFilingHistory } from "../services/company.filing.history.service";
import { CompanyFilingHistory, FilingHistoryItem } from "ch-sdk-node/dist/services/company-filing-history";

const GAZETTE_CATEGORY = "gazette";
const GAZ1_TYPE = "GAZ1";
const INELIGIBLE_PAGES = {
  [ObjectionStatus.INELIGIBLE_COMPANY_STRUCK_OFF]: OBJECTIONS_NOTICE_EXPIRED,
  [ObjectionStatus.INELIGIBLE_NO_DISSOLUTION_ACTION]: OBJECTIONS_NO_STRIKE_OFF,
};

/**
 * GET controller for check company details screen
 * @param req
 * @param res
 * @param next
 */

export const get = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    try {
      const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(req.session);

      const session: Session = req.session as Session;
      const token: string = retrieveAccessTokenFromSession(session);

      let latestGaz1Date: string;
      if (getCompanyEligibility(company.companyNumber, token)) {
        latestGaz1Date = await getLatestGaz1Date(company.companyNumber, token);
      } else {
        latestGaz1Date = "No notice in The Gazette";
      }

      return res.render(Templates.CONFIRM_COMPANY, {
        company,
        latestGaz1Date,
        templateName: Templates.CONFIRM_COMPANY,
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
    const company: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(session);
    const objectionCreate: ObjectionCreate = retrieveObjectionCreateFromObjectionSession(session);
    const objectionId = await createNewObjection(company.companyNumber, token, objectionCreate);
    addToObjectionSession(session, SESSION_OBJECTION_ID, objectionId);
    deleteObjectionCreateFromObjectionSession(session);
    return res.redirect(OBJECTIONS_ENTER_INFORMATION);
  } catch (e) {
    deleteObjectionCreateFromObjectionSession(session);
    if (e.status === 400 && e.data.status) {
      const ineligiblePage = getIneligiblePage(e);
      if (ineligiblePage) {
        return res.redirect(ineligiblePage);
      }
    }
    return next(e);
  }
};

const getIneligiblePage = (apiError: ApiError): string => {
  return INELIGIBLE_PAGES[apiError.data.status];
};

const getLatestGaz1Date = async (companyNumber: string, token: string): Promise<string> => {
  const companyGazetteHistory: CompanyFilingHistory = await getCompanyFilingHistory(companyNumber, GAZETTE_CATEGORY, token);
  const companyGaz1History = companyGazetteHistory.items.filter(isGaz1);
  // Response from API should be in reverse chronological order, so first in list is most recent
  const mostRecentGaz1Item = companyGaz1History.shift();

  if (!mostRecentGaz1Item) {
    throw new Error(`No GAZ1 present for company: ${companyNumber}`);
  }

  return formatCHSDateForDisplay(mostRecentGaz1Item.date);
};

function isGaz1(element: FilingHistoryItem) {
  return element.type === GAZ1_TYPE;
}
