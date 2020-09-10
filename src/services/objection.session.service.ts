import { Session } from "ch-node-session-handler";
import { AccessTokenKeys } from "ch-node-session-handler/lib/session/keys/AccessTokenKeys";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "ch-node-session-handler/lib/session/keys/UserProfileKeys";
import { IAccessToken, ISignInInfo, IUserProfile } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import {OBJECTIONS_SESSION_NAME, SESSION_COMPANY_PROFILE, SESSION_OBJECTION_CREATE} from "../constants";
import ObjectionCompanyProfile from "../model/objection.company.profile";
import ObjectionSessionExtraData from "../model/objection.session.extra.data";
import { ObjectionCreate } from "../modules/sdk/objections";

export const retrieveUserEmailFromSession = (session: Session): string => {
  const signInInfo: ISignInInfo | undefined = session.get(SessionKey.SignInInfo);
  if (!signInInfo) {
    throw new Error("No sign in info");
  }
  const userProfile: IUserProfile | undefined = signInInfo[SignInInfoKeys.UserProfile];
  if (!userProfile) {
    throw new Error("No user profile in sign in session");
  }
  const email: string | undefined = userProfile[UserProfileKeys.Email];
  if (!email) {
    throw new Error("No email in sign in user profile");
  }
  return email;
};

export const retrieveAccessTokenFromSession = (session: Session): string => {
  const signInInfo: ISignInInfo | undefined = session.get(SessionKey.SignInInfo);
  if (!signInInfo) {
    throw new Error("No sign in info");
  }
  const accessToken: IAccessToken | undefined = signInInfo[SignInInfoKeys.AccessToken];
  if (!accessToken) {
    throw new Error("No access token in sign in session");
  }

  const token: string | undefined = accessToken[AccessTokenKeys.AccessToken];
  if (!token) {
    throw new Error("No access token found in access token object");
  }

  return token;
};

export const retrieveObjectionCreateFromObjectionSession = (session: Session): ObjectionCreate => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionSessionFromSession(session);
  if (objectionsExtraData) {
    const objectionCreate: ObjectionCreate | undefined = objectionsExtraData.objection_create;
    if (objectionCreate) {
      return objectionCreate;
    }
    throw new Error("Error retrieving user details for creating objection from objection session");
  }
  throw new Error("No Objection session to retrieve create objection from");
}

export const retrieveCompanyProfileFromObjectionSession = (session: Session): ObjectionCompanyProfile => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionSessionFromSession(session);
  const company: ObjectionCompanyProfile | undefined = objectionsExtraData.objections_company_profile;
  if (company) {
    return company;
  }
  throw new Error("Error retrieving company profile from objection session");
};

export const addObjectionCreateToObjectionSession = (session: Session, objectionCreate: ObjectionCreate): void => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionSessionFromSession(session);
  if (objectionsExtraData) {
    objectionsExtraData[SESSION_OBJECTION_CREATE] = objectionCreate;
    return;
  }

  throw new Error("No Objection session extra data to add objection create to");
};

export const deleteObjectionCreateFromObjectionSession = (session: Session): void => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionSessionFromSession(session);
  if (objectionsExtraData) {
    delete objectionsExtraData[SESSION_OBJECTION_CREATE];
    return;
  }
  throw new Error("Error deleting objection create");
};

export const addCompanyProfileToObjectionSession = (session: Session, company: ObjectionCompanyProfile): void => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionSessionFromSession(session);
  if (objectionsExtraData) {
    objectionsExtraData[SESSION_COMPANY_PROFILE] = company;
    return;
  }

  throw new Error("No Objection session extra data to add company to");
};

export const retrieveObjectionSessionFromSession = (session: Session): ObjectionSessionExtraData => {
  const extraData: ObjectionSessionExtraData | undefined = session.getExtraData(OBJECTIONS_SESSION_NAME);
  if (extraData) {
    return extraData;
  }

  throw new Error("No Objection Session found in Session");
};

export const retrieveFromObjectionSession = (session: Session, key: string): any => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionSessionFromSession(session);
  return objectionsExtraData[key];
};

export const addToObjectionSession = (session: Session, key: string, v: any): void => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionSessionFromSession(session);
  objectionsExtraData[key] = v;
};
