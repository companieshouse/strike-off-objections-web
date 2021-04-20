import {
  OBJECTIONS_OBJECTOR_ORGANISATION,
  STRIKE_OFF_OBJECTIONS } from "./model/page.urls";

export const APP_NAME = "strike-off-objections-web";
export const OBJECTIONS_SESSION_NAME = "strike_off_objections_session";
export const SESSION_COMPANY_PROFILE = "objections_company_profile";
export const SESSION_OBJECTION_CREATE = "objection_create";
export const SESSION_OBJECTION_ID = "objection_id";
export const SESSION_OBJECTOR = "objector";
export const CHANGE_ANSWER_KEY = "change";


export const FULL_NAME_FIELD = "fullName";
export const DIVULGE_INFO_FIELD = "shareIdentity";
export const GENERIC_INFO = "generic";
export const OBJECTOR_FIELDS = {
  "myself-or-company": {
    textFullName: "Tell us your name, or the name of the company you work for",
    textSharedIdentity: "Can we share the name and email address with the company if they request that information?",
    backLink: OBJECTIONS_OBJECTOR_ORGANISATION
  },
  "client": {
    textFullName: "What is the name of your organisation?",
    textSharedIdentity: "Can we share the name of your organisation and your email address with the company if they request that information?",
    backLink: OBJECTIONS_OBJECTOR_ORGANISATION
  },
  [GENERIC_INFO]: {
    textFullName: "What is your full name or the name of your organisation?",
    textSharedIdentity: "Can we share your name and email address with the company if they request that information?",
    backLink: STRIKE_OFF_OBJECTIONS
  },
};
