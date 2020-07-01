import { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import axios from "axios";
import logger from "../../utils/logger";
import { INTERNAL_API_URL } from "../../utils/properties";
import { ApiError, ObjectionPatch } from "./types";

const HTTP_POST: Method = "post";

/**
 * An axios config with common elements for API calls.
 * @param {Method} httpMethod the http method to use eg. get, post
 * @param {string} url of the api endpoint
 * @param {string} token Bearer token for API call
 */
const getAxiosRequestConfig = (httpMethod: Method, url: string, bearerToken: string): AxiosRequestConfig => {
  return {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + bearerToken,
    },
    method: httpMethod,
    proxy: false,
    url,
  };
};

/**
 * Call the API using the supplied Axios request config.
 * @param {AxiosRequestConfig} axios request config
 * @returns {Promise<AxiosResponse>} the api response
 * @throws {ApiError}
 */
const makeAPICall = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  try {
    logger.debug(`Calling ${config.method} ${config.url} with data ${config.data}`);
    const axiosResponse: AxiosResponse = await axios.request<any>(config);
    logger.debug(`data returned from axios api call : ${JSON.stringify(axiosResponse.data, null, 2)}`);
    return axiosResponse;
  } catch (err) {
    logger.error(`ERROR calling API ${JSON.stringify(err, null, 2)}`);
    const axiosError = err as AxiosError;
    const { response, message } = axiosError;
    throw {
      data: response ? response.data.errors : [],
      message,
      status: response ? response.status : -1,
    } as ApiError;
  }
};

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

  const createNewObjectionUrl = `${INTERNAL_API_URL}/company/${companyNumber}/strike-off-objections/`;
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
