import { NextFunction, Request, Response } from "express";
import { authMiddleware } from "web-security-node";
import { OBJECTIONS_COMPANY_NUMBER } from "../model/page.urls";
import * as pageURLs from "../model/page.urls";

const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authMiddlewareConfig = getAuthMiddlewareConfig();

  if (isADownloadUrl(req.originalUrl)) {
    authMiddlewareConfig.returnUrl = req.originalUrl;
  }
  return authMiddleware(authMiddlewareConfig)(req, res, next);
};

const getAuthMiddlewareConfig = () => {
  return {
    accountWebUrl: "",
    returnUrl: OBJECTIONS_COMPANY_NUMBER,
  };
};

const isADownloadUrl = (url: string): boolean => {
  return url.endsWith(pageURLs.DOWNLOAD);
};

export default authenticationMiddleware;
