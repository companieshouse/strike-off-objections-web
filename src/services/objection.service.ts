import { Session } from "@companieshouse/node-session-handler";
import { SESSION_OBJECTION_ID } from "../constants";
import ObjectionCompanyProfile from "../model/objection.company.profile";
import * as objectionsSdk from "../modules/sdk/objections";
import logger from "../utils/logger";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveFromObjectionSession,
} from "./objection.session.service";

/**
 * Get the eligibility for the given company.
 *
 * @param {string} companyNumber the company number
 * @param {string} token the bearer security token to use to call the api
 *
 * @returns {boolean} the eligibility for the given company
 * @throws {ApiError}
 */
export const getCompanyEligibility = async (companyNumber: string, token: string): Promise<objectionsSdk.CompanyEligibility> => {
  logger.info(`getting eligibility for company number ${companyNumber}`);
  return objectionsSdk.getCompanyEligibility(companyNumber, token);
};

/**
 * Create a new objection for the given company.
 *
 * @param {string} companyNumber the company number
 * @param {string} token the bearer security token to use to call the api
 * @param {ObjectionCreate} createWithData the user data passed in the body of the request
 *
 * @returns {string} the id of the newly created objection
 * @throws {ApiError}
 */
export const createNewObjection = async (companyNumber: string, token: string, createWithData: objectionsSdk.ObjectionCreate): Promise<objectionsSdk.ObjectionCreatedResponse> => {
  logger.info(`Creating objection for company number ${companyNumber}`);

  const response: objectionsSdk.ObjectionCreatedResponse = await objectionsSdk.createNewObjection(companyNumber, token, createWithData);

  logger.info(`Id of newly created objection is ${response.objectionId}`);
  return response;
};

export const updateObjectionUserDetails = async (companyNumber: string, objectionId: string,
                                                 token: string, userData: objectionsSdk.ObjectionCreate) => {
  logger.info(`Updating objection user details for company number ${companyNumber}`);
  const patch: objectionsSdk.ObjectionPatch = { full_name: userData.full_name, share_identity: userData.share_identity  };
  await objectionsSdk.patchObjection(companyNumber, objectionId, token, patch);
};

/**
 * Update an objection reason for the given objection ID.
 *
 * @param {string} companyNumber the company number
 * @param {string} objectionId the id of the objection
 * @param {string} token the bearer security token to use to call the api
 * @param {string} objectionReason reason why the user is objecting to strike-off
 */
export const updateObjectionReason = async (
  companyNumber: string, objectionId: string, token: string, objectionReason: string) => {

  logger.info(`Updating objection reason for objectionId ${objectionId}`);

  const patch: objectionsSdk.ObjectionPatch = { reason: objectionReason };

  await objectionsSdk.patchObjection(companyNumber, objectionId, token, patch);
};

/**
 * Update objection status to submitted for the given objection ID.
 *
 * @param {Session} session the web session
 */
export const submitObjection = async (session: Session) => {

  const { objectionId, companyNumber, token } = getValuesForApiCall(session);

  logger.info(`Updating objection status to submitted for objectionId ${objectionId}`);

  const patch: objectionsSdk.ObjectionPatch = { status: objectionsSdk.ObjectionStatus.SUBMITTED };

  await objectionsSdk.patchObjection(companyNumber, objectionId, token, patch);
};

export const addAttachment = async (session: Session,
                                    attachment: Buffer,
                                    fileName: string): Promise<string> => {
  const { objectionId, companyNumber, token } = getValuesForApiCall(session);

  logger.info(`Adding a new attachment to objectionId ${objectionId}`);
  return objectionsSdk.addAttachment(companyNumber, token, objectionId, attachment, fileName);
};

export const getAttachments = async (session: Session): Promise<objectionsSdk.Attachment[]> => {
  const { objectionId, companyNumber, token } = getValuesForApiCall(session);

  logger.info(`Getting attachments for objectionId ${objectionId}`);
  return objectionsSdk.getAttachments(companyNumber, token, objectionId);
};

export const getAttachment = async (session: Session, attachmentId: string): Promise<objectionsSdk.Attachment> => {
  const { objectionId, companyNumber, token } = getValuesForApiCall(session);

  logger.info(`Getting attachment ${attachmentId} for objectionId ${objectionId}`);
  return objectionsSdk.getAttachment(companyNumber, token, objectionId, attachmentId);
};

export const deleteAttachment = async (session: Session, attachmentId: string) => {
  const { objectionId, companyNumber, token } = getValuesForApiCall(session);

  logger.info(`Deleting attachment ${attachmentId} for objectionId ${objectionId}`);
  return objectionsSdk.deleteAttachment(companyNumber, token, objectionId, attachmentId);
};

/**
 * Downloads attachment from the provided api url
 *
 * @param {string} downloadUrl the url of the attachment to download through api
 * @param {Session} session the web session
 * @returns {Download} wrapper object containing the file data and file header info
 * @throws {ApiError} if the download failed
 */
export const downloadAttachment = async (downloadUrl: string, session: Session): Promise<objectionsSdk.Download> => {
  const token: string = retrieveAccessTokenFromSession(session);

  logger.info(`Downloading objection attachment from ${downloadUrl}`);

  return objectionsSdk.downloadAttachment(downloadUrl, token);
};

/**
 * Gets objection details for the company and objection present in the web session.
 *
 * @param {Session} session the web session
 *
 * @returns {Objection} details of the existing objection
 */
export const getObjection = async (session: Session): Promise<objectionsSdk.Objection> => {
  const { objectionId, companyNumber, token } = getValuesForApiCall(session);

  logger.info(`Getting objectionId ${objectionId}`);

  return objectionsSdk.getObjection(companyNumber, token, objectionId);
};

/**
 * Gets values needed to call to the api
 * @param {Session} session the session object containing the values
 * @returns { string, string, string } { objectionId, companyNumber, token } the values for the api
 */
const getValuesForApiCall = (session: Session) => {
  logger.info("Getting session values for Api call");
  const companyProfileInSession: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(session);
  const companyNumber: string = companyProfileInSession.companyNumber;
  const objectionId: string = retrieveFromObjectionSession(session, SESSION_OBJECTION_ID);
  const token: string = retrieveAccessTokenFromSession(session);
  return { objectionId, companyNumber, token };
};
