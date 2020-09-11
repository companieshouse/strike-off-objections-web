import { SESSION_COMPANY_PROFILE, SESSION_OBJECTION_CREATE, SESSION_OBJECTION_ID } from "../constants";
import ObjectionCompanyProfile from "./objection.company.profile";
import { ObjectionCreate } from "../modules/sdk/objections";

export default interface ObjectionSessionExtraData {
  [SESSION_COMPANY_PROFILE]?: ObjectionCompanyProfile;
  [SESSION_OBJECTION_CREATE]?: ObjectionCreate;
  [SESSION_OBJECTION_ID]?: string;
}
