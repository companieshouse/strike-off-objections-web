import logger from "../utils/logger";

/**
 * Different types of ObjectionStatus available to web app
 */
export enum ObjectionStatus {
  OPEN,
  SUBMITTED,
  PROCESSED,
}

/**
 * Data strucrure for patching an Objection
 */
export interface ObjectionPatch {
  reason?: string;
  status?: ObjectionStatus;
}

/**
 * Create a new objection for the given company.
 *
 * @param companyNumber the company number
 * @param token the bearer security token to use to call the api
 *
 * @returns the id of the newly created objection
 */
export const createNewObjection = (companyNumber: string, token: string): string => {

  logger.debug(`Creating a new objection for company number ${companyNumber}`);

  // TODO Call the actual Objections API when end-point is implemented. Covered by JIRA
  //      sub-task BI-4121

  // Until API is called to return an objection id, just generate a random 6 digit number
  return String(Math.floor(100000 + Math.random() * 900000));
};

/**
 * Patch an objection for the given company.
 *
 * @param companyNumber the company number
 * @param token the bearer security token to use to call the api
 *
 */
export const patchObjection = (companyNumber: string, token: string, patch: ObjectionPatch) => {

  logger.debug(`Patching an objection for company number ${companyNumber}`);

  // TODO Call the actual Objections API when end-point is implemented. Covered by JIRA
  //      sub-task BI-4143
};
