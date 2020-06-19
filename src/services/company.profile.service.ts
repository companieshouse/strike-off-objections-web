import { createApiClient } from "ch-sdk-node";
import { CompanyProfile } from "ch-sdk-node/dist/services/company-profile";
import Resource from "ch-sdk-node/dist/services/resource";
import logger from "../logger";
import { ObjectionCompanyProfile } from "../model/objection.company.profile";
import { lookupCompanyStatus, lookupCompanyType } from "../utils/api.enumerations";
import { formatDateForDisplay } from "../utils/date.formatter";

/**
 * Get the company profile from the api. If the company does not exist or there has been an error, an exception
 * will be thrown.
 *
 * @param companyNumber the company number.
 * @param token the bearer security token to use to call the api
 */
export const getCompanyProfile = async (companyNumber: string, token: string): Promise<ObjectionCompanyProfile> => {
  logger.debug("Creating CH SDK ApiClient");
  const api = createApiClient(undefined, token);

  logger.debug(`Looking for company profile with company number ${companyNumber}`);
  const sdkResponse: Resource<CompanyProfile> =
    await api.companyProfile.getCompanyProfile(companyNumber.toUpperCase());

  if (sdkResponse.httpStatusCode >= 400) {
    throw {
      status: sdkResponse.httpStatusCode,
    };
  }

  logger.debug("Data from company profile SDK call " + JSON.stringify(sdkResponse, null, 2));

  const companyProfile = sdkResponse.resource as CompanyProfile;

  return {
    address: {
      line_1: companyProfile.registeredOfficeAddress.addressLineOne,
      line_2: companyProfile.registeredOfficeAddress.addressLineTwo,
      postCode: companyProfile.registeredOfficeAddress.postalCode,
    },
    companyName: companyProfile.companyName,
    companyNumber: companyProfile.companyNumber,
    companyStatus: lookupCompanyStatus(companyProfile.companyStatus),
    companyType: lookupCompanyType(companyProfile.type),
    incorporationDate: formatDateForDisplay(companyProfile.dateOfCreation),
    jurisdiction: companyProfile.jurisdiction,
  };
};
