import { NextFunction, Request, Response } from "express";
import { authMiddleware } from "web-security-node";
import { OBJECTIONS_COMPANY_NUMBER } from "../model/page.urls";
import * as pageURLs from "../model/page.urls";

const authMiddlewareConfig = {
  accountWebUrl: "",
  returnUrl: "",
};

const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  setAuthenticationToReturnTo(OBJECTIONS_COMPANY_NUMBER);

  if (isADownloadUrl(req.originalUrl)) {
    setAuthenticationToReturnTo(req.originalUrl);
  }
  return authMiddleware(authMiddlewareConfig)(req, res, next);
};

const isADownloadUrl = (url: string): boolean => {
  return url.endsWith(pageURLs.DOWNLOAD);
};

const setAuthenticationToReturnTo = (url: string) => {
  authMiddlewareConfig.returnUrl = url;
};

export default authenticationMiddleware;
