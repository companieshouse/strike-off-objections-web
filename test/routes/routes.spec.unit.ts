jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Basic URL Tests", () => {

  it("should find start page with cookie", async () => {
    const response = await request(app)
        .get("/strike-off-objections")
        .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Use this service to tell us why a limited company should not be removed from the Companies House register./);
  });

  it("should find start page without cookie", async () => {
    const response = await request(app)
        .get("/strike-off-objections");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Use this service to tell us why a limited company should not be removed from the Companies House register./);
  });

  it("should find the company number page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/company-number");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/What is the company number/);
  });

  it("should find the confirm company page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/confirm-company");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Confirm this is the correct company/);
  });

});
