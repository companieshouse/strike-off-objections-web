jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/modules/sdk/objections");

import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import {
  retrieveCompanyProfileFromObjectionSession,
} from "../../src/services/objection.session.service";

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

describe("notice expired tests", () => {

  it("should find the notice expired page with correct company name", async () => {
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    const response = await request(app)
      .get("/strike-off-objections/notice-expired");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/It's too late to object to the company being struck off/);
    expect(response.text).toMatch(/Girls school trust/);
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
