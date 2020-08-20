jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/modules/sdk/objections");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import objectionSessionMiddleware from "../../src/middleware/objection.session.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import {
  retrieveCompanyProfileFromObjectionSession,
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockGetObjectionSessionValue = retrieveCompanyProfileFromObjectionSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = {
    data: {},
  } as Session;
  return next();
});

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    req.session.data[OBJECTIONS_SESSION_NAME] = {};
    return next();
  }

  return next(new Error("No session on request"));
});

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
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    const response = await request(app)
      .get("/strike-off-objections/confirm-company");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Confirm this is the correct company/);
  });

  it("should find the enter information page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/enter-information");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Tell us why you're objecting to the company being struck off/);
  });

  it("should find the document upload page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/document-upload");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Add documents to support your objection/);
  });

  it("should find the check your answers page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/check-your-answers");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Check your answers before submitting your objection application/);
  });

  it("should find the error page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/error");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Sorry, there is a problem with the service/);
  });

});

const dummyCompanyProfile: ObjectionCompanyProfile = {
  address: {
    line_1: "line1",
    line_2: "line2",
    postCode: "post code",
  },
  companyName: "Girls school trust",
  companyNumber: "00006400",
  companyStatus: "Active",
  companyType: "limited",
  incorporationDate: "26 June 1872",
};
