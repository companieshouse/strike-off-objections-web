import logger from "../utils/logger";
import { createApiClient } from "ch-sdk-node";
import Resource from "ch-sdk-node/dist/services/resource";
import { CompanyFilingHistory } from "ch-sdk-node/dist/services/company-filing-history";

export const getCompanyFilingHistory = async (companyNumber: string, category: string, token: string):
  Promise<CompanyFilingHistory> => {
  logger.debug("Creating CH SDK ApiClient");
  const api = createApiClient(undefined, token);

  logger.debug(`Looking for company filing history with company number ${companyNumber} and category ${category}`);
  const sdkResponse: Resource<CompanyFilingHistory> =
    await api.companyFilingHistory.getCompanyFilingHistory(companyNumber.toUpperCase(), category);

  if (sdkResponse.httpStatusCode >= 400) {
    throw {
      status: sdkResponse.httpStatusCode,
    };
  }

  logger.debug("Data from company filing history SDK call " + JSON.stringify(sdkResponse, null, 2));

  return sdkResponse.resource as CompanyFilingHistory;
}
