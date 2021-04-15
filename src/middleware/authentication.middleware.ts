import { NextFunction, Request, Response } from "express";
import { authMiddleware } from "@companieshouse/web-security-node";
import { OBJECTIONS_OBJECTING_ENTITY_NAME, OBJECTIONS_OBJECTOR_ORGANISATION } from "../model/page.urls";
import * as pageURLs from "../model/page.urls";

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (isTheAccessibilityStatementUrl(req.originalUrl)) {
    return next();
  }

  const redirectUrl = (req.app.locals.showObjectorJourney) ? OBJECTIONS_OBJECTOR_ORGANISATION : OBJECTIONS_OBJECTING_ENTITY_NAME;

  const authMiddlewareConfig = getAuthMiddlewareConfig(redirectUrl);

  if (isADownloadUrl(req.originalUrl)) {
    authMiddlewareConfig.returnUrl = req.originalUrl;
  }

  return authMiddleware(authMiddlewareConfig)(req, res, next);
};

const getAuthMiddlewareConfig = (redirectUrl) => {
  return {
    accountWebUrl: "",
    returnUrl: redirectUrl,
  };
};

const isADownloadUrl = (url: string): boolean => {
  return url.endsWith(pageURLs.DOWNLOAD);
};

const isTheAccessibilityStatementUrl = (url: string): boolean => {
  return url.endsWith(pageURLs.ACCESSIBILITY_STATEMENT);
};
