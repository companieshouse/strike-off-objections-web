import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import logger from "../../../utils/logger";
import { ApiError } from "./types";

export const STATUS_NO_RESPONSE = -1;
export const HTTP_GET: Method = "get";
export const HTTP_POST: Method = "post";
export const HTTP_PATCH: Method = "patch";
export const HTTP_DELETE: Method = "delete";

/**
 * Gets axios config with common elements for API calls. Some clients may need to add further details
 * to the returned config object, e.g. a 'data' field.
 * @param {Method} httpMethod the http method to use eg. get, post
 * @param {string} url of the api endpoint
 * @param {string} bearerToken token for API call
 */
export const getBaseAxiosRequestConfig = (
  httpMethod: Method, url: string, bearerToken: string): AxiosRequestConfig => {
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
 * @param {AxiosRequestConfig} config axios request config
 * @returns {Promise<AxiosResponse>} the api response
 * @throws {ApiError} if something goes wrong
 */
export const makeAPICall = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  try {
    logger.debug(`Calling ${config.method} ${config.url}`);
    const axiosResponse: AxiosResponse = await axios.request<any>(config);
    try {
      const loggableAxiosResponse = {
        status: axiosResponse.status,
        data: axiosResponse.data,
      };
      logger.debug(`axios response from api call ${config.method} ${config.url} : ${JSON.stringify(loggableAxiosResponse, null, 2)}`);
    } catch (logErr) {
      // Downloads contain circular object references so can't be Json parsed causing error to be thrown
      // we don't want the log to fill up with these errors for each download so just logger.debug it
      logger.debug(`Unable to log axios response - ${logErr}`);
    }
    return axiosResponse;
  } catch (apiErr) {
    logger.error(`ERROR calling API ${config.url} - ${apiErr}`);
    const axiosError = apiErr as AxiosError;
    const { response, message } = axiosError;
    const thrownError: ApiError = {
      data: response ? response.data : [],
      message: message,
      status: response ? response.status : STATUS_NO_RESPONSE,
  };
  throw thrownError
  }
};