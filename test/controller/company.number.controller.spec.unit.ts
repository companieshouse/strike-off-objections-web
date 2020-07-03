jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/objections.session.service");
jest.mock("../../src/middleware/objections.session.middleware");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import objectionsSessionMiddleware from "../../src/middleware/objections.session.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import ObjectionSessionExtraData from "../../src/model/objection.session.extra.data";
import { COMPANY_NUMBER, OBJECTIONS_COMPANY_NUMBER, OBJECTIONS_CONFIRM_COMPANY } from "../../src/model/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import {
  retrieveAccessTokenFromSession,
  retrieveObjectionsSessionFromSession,
} from "../../src/services/objections.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = {
    data: {},
  } as Session;
  return next();
});

const mockObjectionSessionMiddleware = objectionsSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    req.session.data[OBJECTIONS_SESSION_NAME] = {};
    return next();
  }

  return next(new Error("No session on request"));
});

describe("company number lookup tests", () => {

  const mockCompanyProfile = getCompanyProfile as jest.Mock;

  beforeEach(() => {
    mockCompanyProfile.mockReset();
  });

  // TODO - Implement generic error page when company search failure handling is implemented
  //        based on story requirements

  // it("should return the error page when company search fails", async () => {
  //     mockCompanyProfile.mockImplementation(() => {
  //         throw {
  //             message: "Unexpected error",
  //             status: 500,
  //         };
  //     });

  //     const response = await request(app)
  //         .post(OBJECTIONS_COMPANY_NUMBER)
  //         .set("Accept", "application/json")
  //         .set("Referer", "/")
  //         .set("Cookie", [`${COOKIE_NAME}=123`])
  //         .send({companyNumber: "00012345"});

  //     expect(response.status).toEqual(500);
  //     expect(response).not.toBeUndefined();
  // });

  it("should redirect to the check company details screen when company is found", async () => {

    const mockValidAccessToken = retrieveAccessTokenFromSession as jest.Mock;
    const mockGetObjectionsSession =  retrieveObjectionsSessionFromSession as jest.Mock;

    beforeEach(() => {
      mockValidAccessToken.mockReset();
      mockGetObjectionsSession.mockReset();
    });

    mockValidAccessToken.mockImplementation(() => ACCESS_TOKEN );
    mockGetObjectionsSession.mockImplementation(() => ({} as ObjectionSessionExtraData) );

    mockCompanyProfile.mockResolvedValueOnce(dummyCompanyProfile);

    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: COMPANY_NUMBER });

    expect(response.header.location).toEqual(OBJECTIONS_CONFIRM_COMPANY);
    expect(response.status).toEqual(302);
    expect(mockCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER, ACCESS_TOKEN);
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
