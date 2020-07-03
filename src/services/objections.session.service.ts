import { Session } from "ch-node-session-handler";
import { AccessTokenKeys } from "ch-node-session-handler/lib/session/keys/AccessTokenKeys";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { IAccessToken, ISignInInfo } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import { OBJECTIONS_SESSION_NAME, SESSION_COMPANY_PROFILE } from "../constants";
import ObjectionCompanyProfile from "../model/objection.company.profile";
import ObjectionSessionExtraData from "../model/objection.session.extra.data";

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

  return token as string;
};

export const retrieveCompanyProfileFromObjectionsSession = (session: Session): ObjectionCompanyProfile => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionsSessionFromSession(session);
  const company: ObjectionCompanyProfile | undefined = objectionsExtraData.objections_company_profile;
  if (company) {
    return company;
  }
  throw new Error("Error retrieving company profile from objections session");
};

export const addCompanyProfileToObjectionsSession = (session: Session, company: ObjectionCompanyProfile): void => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionsSessionFromSession(session);
  if (objectionsExtraData) {
    objectionsExtraData[SESSION_COMPANY_PROFILE] = company;
    return;
  }

  throw new Error("No objections session extra data to add company too");
};

export const retrieveObjectionsSessionFromSession = (session: Session): ObjectionSessionExtraData => {
  const extraData: ObjectionSessionExtraData | undefined = session.getExtraData(OBJECTIONS_SESSION_NAME);
  if (extraData) {
    return extraData;
  }

  throw new Error("No Objections Session found in Session");
};

export const retrieveFromObjectionsSession = (session: Session, key: string): any => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionsSessionFromSession(session);
  return objectionsExtraData[key];
};

export const addToObjectionsSession = (session: Session, key: string, v: any): void => {
  const objectionsExtraData: ObjectionSessionExtraData = retrieveObjectionsSessionFromSession(session);
  objectionsExtraData[key] = v;
};
