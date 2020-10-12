import logger from "../utils/logger";
import { createApiClient } from "ch-sdk-node";
import Resource from "ch-sdk-node/dist/services/resource";
import { CompanyFilingHistory, FilingHistoryItem } from "ch-sdk-node/dist/services/company-filing-history";
import { inspect } from "util";

const GAZETTE_CATEGORY = "gazette";
const GAZ1_TYPE = "GAZ1";

export const getLatestGaz1FilingHistoryItem = async (companyNumber: string, token: string): Promise<FilingHistoryItem> => {
  logger.debug("Creating CH SDK ApiClient");
  const api = createApiClient(undefined, token);

  logger.debug(`Looking for company filing history with company number ${companyNumber}`);
  const sdkResponse: Resource<CompanyFilingHistory> =
      await api.companyFilingHistory.getCompanyFilingHistory(companyNumber.toUpperCase(), GAZETTE_CATEGORY);

  if (sdkResponse.httpStatusCode >= 400) {
    throw {
      status: sdkResponse.httpStatusCode,
    };
  }

  logger.debug("Data from company filing history SDK call " + inspect(sdkResponse));

  const companyGazetteHistory: CompanyFilingHistory = sdkResponse.resource as CompanyFilingHistory;

  const companyGaz1History = companyGazetteHistory.items.filter(isGaz1);
  // Response from API should be in reverse chronological order, so first in list is most recent
  const mostRecentGaz1Item = companyGaz1History.shift();

  return mostRecentGaz1Item as FilingHistoryItem;
};

function isGaz1(element: FilingHistoryItem) {
  return element.type === GAZ1_TYPE;
}
