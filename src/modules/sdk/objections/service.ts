import { AxiosRequestConfig, AxiosResponse } from "axios";
import FormData from "form-data";
import logger from "../../../utils/logger";
import { INTERNAL_API_URL } from "../../../utils/properties";
import { getBaseAxiosRequestConfig, HTTP_DELETE, HTTP_GET, HTTP_PATCH, HTTP_POST, makeAPICall } from "./axios.client";
import {
  Attachment,
  Download,
  HEADER_CONTENT_DISPOSITION,
  HEADER_CONTENT_LENGTH,
  HEADER_CONTENT_TYPE,
  Objection,
  ObjectionCreate, ObjectionCreatedResponse,
  ObjectionPatch,
} from "./types";

const OBJECTIONS_ELIGIBILITY_URL = (companyNumber: string): string =>
  `${INTERNAL_API_URL}/company/${companyNumber}/strike-off-objections/eligibility`;

const OBJECTIONS_API_URL = (companyNumber: string): string =>
  `${INTERNAL_API_URL}/company/${companyNumber}/strike-off-objections`;

const OBJECTIONS_API_PATCH_OR_GET_URL = (companyNumber: string, objectionId: string): string =>
  OBJECTIONS_API_URL(companyNumber) + `/${objectionId}`;

const OBJECTIONS_API_ATTACHMENT_URL = (companyNumber: string, objectionId: string): string =>
  OBJECTIONS_API_URL(companyNumber) + `/${objectionId}/attachments`;

const OBJECTIONS_API_SINGLE_ATTACHMENT_URL =
    (companyNumber: string, objectionId: string, attachmentId: string): string =>
      OBJECTIONS_API_URL(companyNumber) + `/${objectionId}/attachments/${attachmentId}`;

/**
 * Get the eligibility for the given company.
 *
 * @param {string} companyNumber the company number
 * @param {string} token the bearer security token to use to call the api
 *
 * @returns {boolean} the eligibility for the given company
 * @throws {ApiError}
 */
export const getCompanyEligibility = async (companyNumber: string, token: string): Promise<boolean> => {
  logger.debug(`getting eligibility for company number ${companyNumber} from the SDK`);

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
    HTTP_GET, OBJECTIONS_ELIGIBILITY_URL(companyNumber), token);
  return (await makeAPICall(axiosConfig)).data.is_eligible as boolean;
};

/**
 * Create a new objection for the given company.
 *
 * @param {string} companyNumber the company number
 * @param {string} token the bearer security token to use to call the api
 * @param {ObjectionCreate} createWithData the user data passed in the body of the request
 *
 * @returns {ObjectionCreatedResponse} containing the id and status of the newly created objection
 * @throws {ApiError}
 */
export const createNewObjection = async (companyNumber: string, token: string, createWithData: ObjectionCreate): Promise<ObjectionCreatedResponse> => {
  logger.debug(`Creating a new objection for company number ${companyNumber}`);

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
    HTTP_POST, OBJECTIONS_API_URL(companyNumber), token);
  axiosConfig.data = createWithData;

  const axiosResponseData = (await makeAPICall(axiosConfig)).data;
  return {
    objectionId: axiosResponseData.id,
    objectionStatus: axiosResponseData.status,
  } as ObjectionCreatedResponse;
};

/**
 * Patch an objection for the given company.
 *
 * @param companyNumber the company number
 * @param objectionId the id of the objection to patch
 * @param token the bearer security token to use to call the api
 * @param patch the changes to be applied to the objection
 *
 */
export const patchObjection = async (
  companyNumber: string, objectionId: string, token: string, patch: ObjectionPatch) => {

  logger.debug(`Patching an objection for company number ${companyNumber}`);

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
    HTTP_PATCH, OBJECTIONS_API_PATCH_OR_GET_URL(companyNumber, objectionId), token);
  axiosConfig.data = patch;

  await makeAPICall(axiosConfig);
};

export const addAttachment = async (companyNumber: string,
                                    token: string,
                                    objectionId: string,
                                    attachment: Buffer,
                                    fileName: string): Promise<string> => {

  logger.debug(`Adding an attachment to objectionId ${objectionId}`);

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
    HTTP_POST,
    OBJECTIONS_API_ATTACHMENT_URL(companyNumber, objectionId),
    token,
  );

  const data = new FormData();
  data.append("file", attachment, { filename: fileName });
  axiosConfig.data = data;

  axiosConfig.headers = {
    post: {
      ...{ Authorization: "Bearer " + token },
      ...data.getHeaders(),
    },
  };

  return (await makeAPICall(axiosConfig)).data.id as string;
};

export const getAttachments = async (companyNumber: string,
                                     token: string,
                                     objectionId: string): Promise<Attachment[]> => {

  logger.debug(`Getting attachments for objectionId ${objectionId}`);

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
    HTTP_GET,
    OBJECTIONS_API_ATTACHMENT_URL(companyNumber, objectionId),
    token);
  const response = await makeAPICall(axiosConfig);
  return response.data as Attachment[];
};

export const getAttachment = async (companyNumber: string,
                                    token: string,
                                    objectionId: string,
                                    attachmentId: string): Promise<Attachment> => {

  logger.debug(`Getting attachment ${attachmentId} from objectionId ${objectionId}`);

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
    HTTP_GET,
    OBJECTIONS_API_SINGLE_ATTACHMENT_URL(companyNumber, objectionId, attachmentId),
    token);
  const response = await makeAPICall(axiosConfig);
  return response.data as Attachment;
};

export const deleteAttachment = async (companyNumber: string,
                                       token: string,
                                       objectionId: string,
                                       attachmentId: string): Promise<void> => {

  logger.debug(`Deleting attachment ${attachmentId} from objectionId ${objectionId}`);

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
    HTTP_DELETE,
    OBJECTIONS_API_SINGLE_ATTACHMENT_URL(companyNumber, objectionId, attachmentId),
    token);
  await makeAPICall(axiosConfig);
  return;
};

/**
 * Download attachment from supplied url
 *
 * @param {string} downloadApiUrl the url of the attachment to download through api
 * @param {string} token the security access token to use for the api call
 * @returns {Download} wrapper object containing the file data and file header info
 * @throws {ApiError} if download fails
 */
export const downloadAttachment = async (downloadApiUrl: string,
                                         token: string): Promise<Download> => {
  logger.debug(`Downloading attachment from ${downloadApiUrl}`);

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: "Bearer " + token,
    },
    proxy: false,
  };
  config.method = HTTP_GET;
  config.url = `${INTERNAL_API_URL}${downloadApiUrl}`;
  config.responseType = "stream";

  const axiosResponse: AxiosResponse = await makeAPICall(config);

  logger.debug("download - axios response headers = " + JSON.stringify(axiosResponse.headers));

  return {
    data: axiosResponse.data,
    headers: {
      [HEADER_CONTENT_DISPOSITION]: axiosResponse.headers[HEADER_CONTENT_DISPOSITION],
      [HEADER_CONTENT_LENGTH]: axiosResponse.headers[HEADER_CONTENT_LENGTH],
      [HEADER_CONTENT_TYPE]: axiosResponse.headers[HEADER_CONTENT_TYPE],
    },
  } as Download;
};

export const getObjection = async (companyNumber: string,
                                   token: string,
                                   objectionId: string): Promise<Objection> => {

  logger.debug(`Getting objection ${objectionId}`);

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
    HTTP_GET,
    OBJECTIONS_API_PATCH_OR_GET_URL(companyNumber, objectionId),
    token);

  const response = await makeAPICall(axiosConfig);

  return response.data as Objection;
};
