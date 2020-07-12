import { AxiosRequestConfig } from "axios";
import logger from "../../../utils/logger";
import { INTERNAL_API_URL } from "../../../utils/properties";
import { getBaseAxiosRequestConfig, HTTP_PATCH, HTTP_POST, makeAPICall } from "./axios.client";
import { ObjectionPatch } from "./types";

const OBJECTIONS_API_URL = (companyNumber: string): string =>
    `${INTERNAL_API_URL}/company/${companyNumber}/strike-off-objections`;

const OBJECTIONS_API_PATCH_URL = (companyNumber: string, objectionId: string): string =>
    OBJECTIONS_API_URL(companyNumber) + `/${objectionId}`;

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

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
      HTTP_POST, OBJECTIONS_API_URL(companyNumber), token);

  return (await makeAPICall(axiosConfig)).data.id as string;
};

/**
 * Patch an objection for the given company.
 *
 * @param companyNumber the company number
 * @param token the bearer security token to use to call the api
 * @param patch the changes to be applied to the objection
 *
 */
export const patchObjection = async (
    companyNumber: string, objectionId: string, token: string, patch: ObjectionPatch) => {

  logger.debug(`Patching an objection for company number ${companyNumber}`);

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
      HTTP_PATCH, OBJECTIONS_API_PATCH_URL(companyNumber, objectionId), token);
  axiosConfig.data = patch;

  await makeAPICall(axiosConfig);
};

export const addAttachment = (companyNumber: string,
                              token: string,
                              objectionId: string,
                              attachment: Buffer,
                              fileName: string) => {

  // TODO Call the actual Objections API when end-point is implemented. Covered by JIRA
  //      sub-tasks OBJ-63 and OBJ-70

};