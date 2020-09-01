jest.mock("axios");
jest.mock("../../../../src/utils/logger");

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { ApiError } from "../../../../src/modules/sdk/objections";
import {
  getBaseAxiosRequestConfig,
  HTTP_POST,
  makeAPICall,
  STATUS_NO_RESPONSE,
} from "../../../../src/modules/sdk/objections/axios.client";
import logger from "../../../../src/utils/logger";

const mockAxiosRequest = axios.request as jest.Mock;
const mockJSONStringify = JSON.stringify = jest.fn();

const dummyAxiosResponse: AxiosResponse = {
  config: {},
  data: {},
  headers: "header",
  status: 100,
  statusText: "Error",
};

const ERROR_MSG_PREFIX = "ERROR calling API";

describe("axios client tests", () => {

  mockAxiosRequest.mockResolvedValue(dummyAxiosResponse);

  beforeEach(() => {
    mockAxiosRequest.mockClear();
    mockJSONStringify.mockClear();
  });

  it("should return axios config with the correct fields", () => {
    const method: Method = HTTP_POST;
    const token = "abc123";
    const url = "http://localhost:4000/company/1234/strike-off-objections";

    const config: AxiosRequestConfig = getBaseAxiosRequestConfig(method, url, token);

    expect(config.headers).toEqual({ Accept: "application/json", Authorization: "Bearer abc123" });
    expect(config.url).toEqual(url);
    expect(config.method).toEqual(method);
  });

  it("should handle successful axios call", async () => {
    const config: AxiosRequestConfig = {};
    dummyAxiosResponse.status = 200;
    const response: AxiosResponse = await makeAPICall(config);
    expect(response.status).toEqual(200);
  });

  it("should handle axios errors", async () => {
    const config: AxiosRequestConfig = {};

    const errorMessage = "There is an error";
    const dataError = "Test error";
    const statusCode = 500;

    const axiosError = {
      message: errorMessage,
      response: {
        data: {
          errors: [dataError]
        },
        status: statusCode,
      },
    } as AxiosError;

    mockAxiosRequest.mockRejectedValueOnce(axiosError);

    const expectedError: ApiError = {
      data: {
        errors: [dataError]
      },
      message: errorMessage,
      status: statusCode,
    };

    await expect(makeAPICall(config)).rejects.toStrictEqual(expectedError);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(ERROR_MSG_PREFIX));
  });

  it("should handle axios errors with no response object", async () => {
    const config: AxiosRequestConfig = {};

    const errorMessage = "There is an error";

    const axiosError = {
      message: errorMessage,
    } as AxiosError;

    mockAxiosRequest.mockRejectedValueOnce(axiosError);

    const expectedError: ApiError = {
      data: [],
      message: errorMessage,
      status: STATUS_NO_RESPONSE,
    };

    await expect(makeAPICall(config)).rejects.toStrictEqual(expectedError);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(ERROR_MSG_PREFIX));
  });

  it("should recover when logging out axios response throws an error", async () => {
    const err = new Error("hello");
    mockJSONStringify.mockImplementationOnce(() => { throw err; });

    const config: AxiosRequestConfig = {};
    dummyAxiosResponse.status = 200;
    const response: AxiosResponse = await makeAPICall(config);

    expect(logger.debug).toBeCalledWith(expect.stringContaining(err.message));
    expect(response.status).toEqual(200);
  });
});
