import { NextFunction, Request, Response } from "express";
import { authMiddleware } from "@companieshouse/web-security-node";
import * as pageURLs from "../model/page.urls";

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (isTheAccessibilityStatementUrl(req.originalUrl)) {
    return next();
  }

  const authMiddlewareConfig = getAuthMiddlewareConfig();

  if (isADownloadUrl(req.originalUrl)) {
    authMiddlewareConfig.returnUrl = req.originalUrl;
  }

  return authMiddleware(authMiddlewareConfig)(req, res, next);
};

const getAuthMiddlewareConfig = () => {
  return {
    accountWebUrl: "",
    chsWebUrl: process.env.CHS_URL || "",
    returnUrl: pageURLs.OBJECTIONS_OBJECTOR_ORGANISATION,
  };
};

const isADownloadUrl = (url: string): boolean => {
  return url.endsWith(pageURLs.DOWNLOAD);
};

const isTheAccessibilityStatementUrl = (url: string): boolean => {
  return url.endsWith(pageURLs.ACCESSIBILITY_STATEMENT);
};
