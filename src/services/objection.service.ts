import { Session } from "ch-node-session-handler";
import * as objectionsSdk from "../modules/sdk/objections";
import { ObjectionPatch } from "../modules/sdk/objections/types";
import logger from "../utils/logger";
import { Session } from "ch-node-session-handler";
import ObjectionCompanyProfile from "../model/objection.company.profile";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveFromObjectionSession
} from "./objection.session.service";
import { SESSION_OBJECTION_ID } from "../constants";

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

export const addAttachment = async (session: Session,
                                    attachment: Buffer,
                                    fileName: string) => {
  const companyProfileInSession: ObjectionCompanyProfile = retrieveCompanyProfileFromObjectionSession(session);
  const companyNumber: string = companyProfileInSession.companyNumber;
  const objectionId: string = retrieveFromObjectionSession(session, SESSION_OBJECTION_ID);
  const token: string = retrieveAccessTokenFromSession(session);

  logger.info(`Adding attachment ${fileName} to objection ${objectionId}`);
  await objectionsSdk.addAttachment(companyNumber, token, objectionId, attachment, fileName);
};

export const getAttachments = (session: Session): any[] => {

  // TODO - any[] will be replaced with Attachment[]
  return [
    {
      id: "sghsaghj-3623-khh",
      name: "document1.jpg",
    },
    {
      id: "dshkj-5456-fdhfddf",
      name: "document2.jpg",
    },
  ];
};
