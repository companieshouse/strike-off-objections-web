import { SESSION_COMPANY_PROFILE } from "../constants";
import ObjectionCompanyProfile from "./objection.company.profile";

export default interface ObjectionSessionExtraData {
  [SESSION_COMPANY_PROFILE]?: ObjectionCompanyProfile;
  objection_id?: string;
}
