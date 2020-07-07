
import * as objectionsSdk from "../modules/sdk/objections";
import { ObjectionPatch } from "../modules/sdk/objections/types";
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
  logger.info(`Creating objection for company number ${companyNumber}`);

  const objectionId: string = await objectionsSdk.createNewObjection(companyNumber, token);

  logger.debug(`Id of newly created objection is ${objectionId}`);
  return objectionId;
};

/**
 * Update an objection reason for the given objection ID.
 *
 * @param {string} objectionId the id of the objection
 * @param {string} token the bearer security token to use to call the api
 * @param {string} objectionReason reason why the user is objecting to strike-off
 */
export const updateObjectionReason = async (
    companyNumber: string, objectionId: string, token: string, objectionReason: string) => {

  logger.info(`Updating objection reason for objectionId ${objectionId}`);

  const patch: ObjectionPatch = { reason: objectionReason };

  await objectionsSdk.patchObjection(companyNumber, objectionId, token, patch);
};

/**
 * Update objection status to submitted for the given objection ID.
 *
 * @param {string} objectionId the id of the objection
 * @param {string} token the bearer security token to use to call the api
 */
export const submitObjection = (objectionId: string, token: string) => {

 logger.info(`Updating objection status to submitted for objectionId ${objectionId}`);

  // TODO Call the Objections SDK. Covered by JIRA
  //      sub-task BI-4143
};

export const addAttachment = (companyNumber: string,
                              token: string,
                              objectionId: string,
                              attachment: Buffer,
                              fileName: string) => {

  logger.info(`Adding attachment ${fileName} to objection ${objectionId}`);
  objectionsSdk.addAttachment(companyNumber, token, objectionId, attachment, fileName);
};
