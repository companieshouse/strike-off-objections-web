import { Request, Response, NextFunction } from "express";
import { Session } from "@companieshouse/node-session-handler";

let sessionMiddlewareNextBehavior: (req: Request, res: Response, next: NextFunction) => void = (req, res, next) => next();

export const sessionMock = { session: { data: {} } as Session | undefined };
export const setSessionMiddlewareNextBehavior = (newBehavior: (req: Request, res: Response, next: NextFunction) => void) => {
  sessionMiddlewareNextBehavior = newBehavior;
};

jest.mock("../../src/middleware/session.middleware", () => ({
  createSessionMiddleware: jest.fn(() => (req, res, next) => {
    req.session = sessionMock.session;
    sessionMiddlewareNextBehavior(req, res, next);
  }),
}));

