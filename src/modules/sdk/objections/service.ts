import { AxiosRequestConfig } from "axios";
import logger from "../../../utils/logger";
import { INTERNAL_API_URL } from "../../../utils/properties";
import { getAxiosRequestConfig, HTTP_POST, makeAPICall } from "./axios.client";
import { ObjectionPatch } from "./types";

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
  logger.info(`Creating a new objection for company number ${companyNumber}`);

  const createNewObjectionUrl = `${INTERNAL_API_URL}/company/${companyNumber}/strike-off-objections`;
  const axiosConfig: AxiosRequestConfig = getAxiosRequestConfig(HTTP_POST, createNewObjectionUrl, token);

  return (await makeAPICall(axiosConfig)).data.id as string;
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
