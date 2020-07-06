jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objections.session.service");
jest.mock("../../src/modules/sdk/objections");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import { getValueFromObjectionsSession } from "../../src/services/objections.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockGetObjectionSessionValue = getValueFromObjectionsSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    req.session = {
        data: {},
    } as Session;
    return next();
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
