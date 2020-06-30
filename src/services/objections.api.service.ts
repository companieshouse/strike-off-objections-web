import logger from "../utils/logger";

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
  //      sub-task BI-4121. Until then, just generate a random 6 digit number

  const objectionId: string = String(Math.floor(100000 + Math.random() * 900000));

  logger.debug(`Id of newly created objection is ${objectionId}`);

  return objectionId;
};
