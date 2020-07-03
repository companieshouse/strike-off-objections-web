import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import logger from "../../../utils/logger";
import { ApiError } from "./types";

export const STATUS_NO_RESPONSE = -1;
export const HTTP_POST: Method = "post";

/**
 * An axios config with common elements for API calls.
 * @param {Method} httpMethod the http method to use eg. get, post
 * @param {string} url of the api endpoint
 * @param {string} bearerToken token for API call
 */
export const getAxiosRequestConfig = (httpMethod: Method, url: string, bearerToken: string): AxiosRequestConfig => {
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
 * @throws {ApiError}
 */
export const makeAPICall = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
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
      status: response ? response.status : STATUS_NO_RESPONSE,
    } as ApiError;
  }
};
