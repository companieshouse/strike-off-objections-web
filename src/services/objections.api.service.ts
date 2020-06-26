import NewObjection from "../model/new.objection";
import logger from "../utils/logger";

/**
 * Create a new objection for the given company.
 *
 * @param companyNumber the company number
 * @param token the bearer security token to use to call the api
 *
 * @returns the id of the newly created objection
 */
export const createNewObjection = async (companyNumber: string, token: string): Promise<NewObjection> => {

  logger.debug(`Creating a new objection for company number ${companyNumber}`);

  // TODO Call the actual Objections API (via the SDK Node API?) when end-point is implemented. Covered by
  //      JIRA sub-task BI-4121

  return {
    // Until API is called to return an objection id, just generate a random 6 digit number and set that
    objectionId: String(Math.floor(100000 + Math.random() * 900000)),
  };
};
