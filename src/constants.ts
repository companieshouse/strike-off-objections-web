import { OBJECTIONS_OBJECTOR_ORGANISATION } from "./model/page.urls";

export const APP_NAME = "strike-off-objections-web";
export const OBJECTIONS_SESSION_NAME = "strike_off_objections_session";
export const SESSION_COMPANY_PROFILE = "objections_company_profile";
export const SESSION_OBJECTION_CREATE = "objection_create";
export const SESSION_OBJECTION_ID = "objection_id";
export const SESSION_OBJECTOR = "objector";
export const CHANGE_ANSWER_KEY = "change";


export const FULL_NAME_FIELD = "fullName";
export const SHARE_IDENTITY_FIELD = "shareIdentity";
export const MYSELF_OR_COMPANY = "myself-or-company";
export const CLIENT = "client";
export const OBJECTOR_FIELDS = {
  [MYSELF_OR_COMPANY]: {
    objectingEntityNamePageTitleText: "Tell us your name, or the name of the company you work for - Companies House - GOV.UK",
    objectingEntityNamePageText: "Tell us your name, or the name of the company you work for",
    textSharedIdentity: "Can we share the name and email address with the company if they request that information?",
    backLink: OBJECTIONS_OBJECTOR_ORGANISATION
  },
  [CLIENT]: {
    objectingEntityNamePageTitleText: "What is the name of your organisation? - Companies House - GOV.UK",
    objectingEntityNamePageText: "What is the name of your organisation?",
    textSharedIdentity: "Can we share the name of your organisation and your email address with the company if they request that information?",
    backLink: OBJECTIONS_OBJECTOR_ORGANISATION
  }
};
export const OBJECTOR_ORGANISATION = "objector-organisation";
export const ENTER_INFORMATION = "information";
export const OBJECTING_ENTITY_NAME = "objectingEntityName";