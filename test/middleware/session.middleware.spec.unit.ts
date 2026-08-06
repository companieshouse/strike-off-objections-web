jest.mock("ioredis");

import { Request, Response, NextFunction } from "express";
import { createEnsureSessionCookiePresentMiddleware } from "../../src/middleware/session.middleware";
import { COOKIE_NAME } from "../../src/utils/properties";

const middleware = createEnsureSessionCookiePresentMiddleware();

const mockNext: NextFunction = jest.fn();
const mockRedirect = jest.fn();

const buildReq = (cookieValue?: string): Partial<Request> => ({
  cookies: cookieValue ? { [COOKIE_NAME]: cookieValue } : {},
  originalUrl: "/strike-off-objections/company-number",
  get: jest.fn(),
});

const buildRes = (): Partial<Response> => ({
  redirect: mockRedirect as any,
  header: jest.fn().mockReturnThis() as any,
});

describe("EnsureSessionCookiePresentMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() when the session cookie is present", () => {
    middleware(buildReq("abc123") as Request, buildRes() as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should redirect when the session cookie is absent", () => {
    middleware(buildReq() as Request, buildRes() as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/strike-off-objections/company-number");
  });
});