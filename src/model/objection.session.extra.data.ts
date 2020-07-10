import { SESSION_COMPANY_PROFILE, SESSION_OBJECTION_ID } from "../constants";
import ObjectionCompanyProfile from "./objection.company.profile";

export default interface ObjectionSessionExtraData {
  [SESSION_COMPANY_PROFILE]?: ObjectionCompanyProfile;
  [SESSION_OBJECTION_ID]?: string;
}
