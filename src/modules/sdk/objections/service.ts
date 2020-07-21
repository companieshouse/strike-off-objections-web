import { AxiosRequestConfig } from "axios";
import FormData from "form-data";
import logger from "../../../utils/logger";
import { INTERNAL_API_URL } from "../../../utils/properties";
import { getBaseAxiosRequestConfig, HTTP_DELETE, HTTP_GET, HTTP_PATCH, HTTP_POST, makeAPICall } from "./axios.client";
import { Attachment, Objection, ObjectionPatch } from "./types";

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
                                    fileName: string) => {

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
    HTTP_POST,
    OBJECTIONS_API_ATTACHMENT_URL(companyNumber, objectionId),
    token,
  );

  const data = new FormData();
  data.append("file", attachment, {filename: fileName});
  axiosConfig.data = data;

  axiosConfig.headers = {
    post: {
      ...{Authorization: "Bearer " + token},
      ...data.getHeaders(),
    },
  };
  await makeAPICall(axiosConfig);
};

export const getAttachments = async (companyNumber: string,
                                     token: string,
                                     objectionId: string): Promise<Attachment[]> => {

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

  const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
    HTTP_DELETE,
    OBJECTIONS_API_SINGLE_ATTACHMENT_URL(companyNumber, objectionId, attachmentId),
    token);
  await makeAPICall(axiosConfig);
  return;
};

export const getObjection = async (companyNumber: string,
                                   token: string,
                                   objectionId: string): Promise<Objection> => {

  // TODO Uncomment these lines, remove the stub code below and call the API when end-point
  //      is available (OBJ-125)

  // const axiosConfig: AxiosRequestConfig = getBaseAxiosRequestConfig(
  //     HTTP_GET,
  //     OBJECTIONS_API_PATCH_OR_GET_URL(companyNumber, objectionId),
  //     token);

  // const response = await makeAPICall(axiosConfig);

  // return response.data as Objection;

  return {
    attachments: [
      { id: "ABC123",
        name: "attachment.jpg",
      },
      {
        id: "ABC456",
          name: "document.pdf",
      }],
    id: "XYZ123",
    reason: "Owed money" };
};
