import { authMiddleware } from "web-security-node";
import * as pageURLs from "../model/page.urls";

const authMiddlewareConfig = {
  accountWebUrl: "",
  returnUrl: `${pageURLs.STRIKE_OFF_OBJECTIONS}${pageURLs.COMPANY_NUMBER}`,
};

const authenticationMiddleware = authMiddleware(authMiddlewareConfig);

export default authenticationMiddleware;
