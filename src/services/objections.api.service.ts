
import * as objectionsSdk from "../sdk/objections";
import logger from "../utils/logger";

/**
 * Create a new objection for the given company.
 *
 * @param {string} companyNumber the company number
 * @param {string} token the bearer security token to use to call the api
 *
 * @returns {string} the id of the newly created objection
 * @throws {ApiError}
 */
export const createNewObjection = async (companyNumber: string, token: string): Promise<string> => {
  return await objectionsSdk.createNewObjection(companyNumber, token);
};

/**
 * Update an objection reason for the given company.
 *
 * @param {string} objectionId the id of the objection
 * @param {string} token the bearer security token to use to call the api
 * @param {string} reason
 */
export const updateObjectionReason = (objectionId: string, token: string, reason: string) => {

  logger.info(`Updating objection reason for objectionId ${objectionId}`);

  // TODO Call the Objections SDK. Covered by JIRA
  //      sub-task BI-4143
};

/**
 * Update an objection status for the given company.
 *
 * @param {string} objectionId the id of the objection
 * @param {string} token the bearer security token to use to call the api
 */
export const updateObjectionStatusToSubmitted = (objectionId: string, token: string) => {

 logger.info(`Updating objection status to submitted for objectionId ${objectionId}`);

  // TODO Call the Objections SDK. Covered by JIRA
  //      sub-task BI-4143
};
