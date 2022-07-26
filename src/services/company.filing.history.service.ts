import logger from "../utils/logger";
import { createApiClient } from "@companieshouse/api-sdk-node";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  CompanyFilingHistory,
  FilingHistoryItem
} from "@companieshouse/api-sdk-node/dist/services/company-filing-history";


const GAZETTE_CATEGORY = "gazette";
const GAZ1_TYPE = "GAZ1";
const GAZ1A_TYPE = "GAZ1(A)";

export const getLatestGaz1FilingHistoryItem = async (companyNumber: string, token: string): Promise<FilingHistoryItem> => {
  logger.debug(`Getting latest GAZ1 filing history item for company number ${companyNumber}`);
  const companyGazetteHistory: CompanyFilingHistory = await getCompanyFilingHistory(companyNumber.toUpperCase(), GAZETTE_CATEGORY, token);

  const companyGaz1History = companyGazetteHistory.items.filter(isGaz1);
  logger.debug("Company GAZ1 history: " + JSON.stringify(companyGaz1History));
  // Response from API should be in reverse chronological order, so first in list is most recent
  const mostRecentGaz1Item = companyGaz1History.shift();
  logger.debug("Most recent GAZ1 item: " + JSON.stringify(mostRecentGaz1Item));

  return mostRecentGaz1Item as FilingHistoryItem;
};

const getCompanyFilingHistory = async (companyNumber: string, category: string, token: string): Promise<CompanyFilingHistory> => {
  logger.debug("Creating SDK Node ApiClient");
  const api = createApiClient(undefined, token);

  logger.debug(`Looking for company filing history with company number ${companyNumber} and category ${category}`);
  const sdkResponse: Resource<CompanyFilingHistory> =
      await api.companyFilingHistory.getCompanyFilingHistory(companyNumber.toUpperCase(), category);

  if (sdkResponse.httpStatusCode >= 400) {
  throw new Error("Status: " + sdkResponse.httpStatusCode);
  }

  logger.debug("Data from company filing history SDK call " + JSON.stringify(sdkResponse, null, 2));

  return sdkResponse.resource as CompanyFilingHistory;
};

const isGaz1 = (element: FilingHistoryItem) => {
  if (element.type) {
    return element.type.toUpperCase() === GAZ1_TYPE || element.type.toUpperCase() === GAZ1A_TYPE;
  }
  return false;
};
