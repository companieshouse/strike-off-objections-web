import * as fs from "fs";
import * as yaml from "js-yaml";

const API_CONSTANTS_PATH: string = "api-enumerations/constants.yml";

const apiConstants = yaml.safeLoad(fs.readFileSync(API_CONSTANTS_PATH, "utf8"));

export const lookupCompanyType = (companyTypeKey: string): string => {
  // we actually use the 'company_summary' values from the yaml file to
  //  display the company type (following the ch.gov.uk templates)
  return apiConstants.company_summary[companyTypeKey] || companyTypeKey ;
};

export const lookupCompanyStatus = (companyStatusKey: string): string => {
  return apiConstants.company_status[companyStatusKey] || companyStatusKey ;
};
