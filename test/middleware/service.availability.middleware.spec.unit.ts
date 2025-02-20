jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/objection.session.middleware");

import "../mocks/session.middleware";
import "../mocks/csrf.middleware";
import "../mocks/multipart.middleware";

import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;
  session.data[OBJECTIONS_SESSION_NAME] = {};
  return next();
});

afterAll(() => {
  process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";
});

describe("Availability tests", () => {

  it("should show the service offline page when offline flag is true", async () => {
    process.env.SHOW_SERVICE_OFFLINE_PAGE = "true";

    const response = await request(app)
      .get("/strike-off-objections");
    expect(response.text).toMatch(/Sorry, the service is unavailable/);
  });

  it("should not show the service offline page when offline flag is false", async () => {
    process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";

    const response = await request(app)
      .get("/strike-off-objections");
    expect(response.text).not.toMatch(/Sorry, the service is unavailable/);
    expect(response.text).toMatch(/Use this service to tell us why a company should not be removed from the Companies House register./);
  });

  it("should show the service offline page when offline flag is true, cookie present", async () => {
    process.env.SHOW_SERVICE_OFFLINE_PAGE = "true";

    const response = await request(app)
      .get("/strike-off-objections")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.text).toMatch(/Sorry, the service is unavailable/);
  });

  it("should show the service offline page with slash", async () => {
    process.env.SHOW_SERVICE_OFFLINE_PAGE = "true";

    const response = await request(app)
      .get("/strike-off-objections/");
    expect(response.text).toMatch(/Sorry, the service is unavailable/);
  });

  it("should not show the service offline page when offline flag is false, cookie present", async () => {
    process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";

    const response = await request(app)
      .get("/strike-off-objections")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.text).not.toMatch(/Sorry, the service is unavailable/);
    expect(response.text).toMatch(/Use this service to tell us why a company should not be removed from the Companies House register./);
  });

  it("should show the service offline page for non start page", async () => {
    process.env.SHOW_SERVICE_OFFLINE_PAGE = "true";

    const response = await request(app)
      .get("/strike-off-objections/company-number");
    expect(response.text).toMatch(/Sorry, the service is unavailable/);
  });

});
