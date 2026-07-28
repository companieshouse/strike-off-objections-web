jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/middleware/objection.session.middleware");

import "../mocks/session.middleware";
import "../mocks/csrf.middleware";

import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME, PREVIOUSLY_SELECTED_COMPANY } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import ObjectionSessionExtraData from "../../src/model/objection.session.extra.data";
import { OBJECTIONS_COMPANY_NUMBER, OBJECTIONS_CONFIRM_COMPANY } from "../../src/model/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import {
  retrieveAccessTokenFromSession,
  retrieveObjectionSessionFromSession,
  addToObjectionSession,
  retrieveFromObjectionSession,
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const COMPANY_NUMBER = "00006400";
const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const INVALID_COMPANY_NUMBER = "Invalid company number";
const COMPANY_NUMBER_TOO_LONG = "Company number too long";
const NO_COMPANY_NUMBER_SUPPLIED = "You must enter a company number";
const COMPANY_NOT_FOUND = "No results found for that company number";

const mockSetObjectionSessionValue = addToObjectionSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
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

  it("should save the company as previously selected company", async () => {
    const mockRetrieveFromObjectionSession = retrieveFromObjectionSession as jest.Mock;
    mockRetrieveFromObjectionSession.mockReturnValueOnce(dummyCompanyProfile);

    const SESSION: Session = {
      data: {},
    } as Session;
    SESSION.data[OBJECTIONS_SESSION_NAME] = {
    };

    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: COMPANY_NUMBER
      });

    expect(response.status).toBe(302);
    expect(mockSetObjectionSessionValue).toHaveBeenCalledWith(SESSION, PREVIOUSLY_SELECTED_COMPANY, dummyCompanyProfile.companyNumber);
  });

  it("should create an error message when no company number is supplied (empty string)", async () => {
    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "" });

    expect(response.status).toEqual(200);
    expect(response).not.toBeUndefined();
    expect(response.text).toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
  });

  it("should create an error message when no company number is supplied (spaces)", async () => {
    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "    " });

    expect(response.status).toEqual(200);
    expect(response).not.toBeUndefined();
    expect(response.text).toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
  });

  it("should create an error message when company number is supplied (non-alphanumeric)", async () => {
    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "&" });

    expect(response.status).toEqual(200);
    expect(response).not.toBeUndefined();
    expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
  });

  it("should create an error message when company number is invalid (characters)", async () => {
    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "asdfg!!@" });

    expect(response.status).toEqual(200);
    expect(response).not.toBeUndefined();
    expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
  });

  it("should create an error message when company number is too long", async () => {
    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "000064000" });

    expect(response.status).toEqual(200);
    expect(response).not.toBeUndefined();
    expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).toContain(COMPANY_NUMBER_TOO_LONG);
  });

  it("should create an error message when company is not found", async () => {
    mockCompanyProfile.mockImplementation(() => {
      throw new Error("status: 404");
    });

    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "00012345" });

    expect(response.status).toEqual(200);
    expect(response).not.toBeUndefined();
    expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    expect(response.text).toContain(COMPANY_NOT_FOUND);
  });





  it("should return the error page when company search fails", async () => {
    mockCompanyProfile.mockImplementation(() => {
      throw {
        message: "Unexpected error",
        status: 500,
      };
    });

    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "00012345" });

    expect(response.status).toEqual(500);
    expect(response).not.toBeUndefined();
    expect(response.text).toContain("Sorry, there is a problem with the service");
  });

  it("should redirect to the check company details screen when company is found", async () => {

    const mockValidAccessToken = retrieveAccessTokenFromSession as jest.Mock;
    const mockGetObjectionsSession =  retrieveObjectionSessionFromSession as jest.Mock;

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

  it("should not throw invalid error for company with two letter prefix", async () => {
    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "AB012345" });

    expect(response.status).toEqual(302);
    expect(response).not.toBeUndefined();
    expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
  });

  it("should not throw invalid error for company with one letter prefix", async () => {
    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "A0123456" });

    expect(response.status).toEqual(302);
    expect(response).not.toBeUndefined();
    expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
  });

  it("should not throw invalid error for company with lower case letter prefix", async () => {
    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "ab123456" });

    expect(response.status).toEqual(302);
    expect(response).not.toBeUndefined();
    expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
  });

  it("should throw invalid error for company with letters after numbers", async () => {
    const response = await request(app)
      .post(OBJECTIONS_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ companyNumber: "1B345678" });

    expect(response.status).toEqual(200);
    expect(response).not.toBeUndefined();
    expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
  });

  it("should pad company details for a valid abbreviated company number", async () => {

    const mockValidAccessToken = retrieveAccessTokenFromSession as jest.Mock;
    const mockGetObjectionsSession =  retrieveObjectionSessionFromSession as jest.Mock;

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
      .send({ companyNumber: "6400" });

    expect(response.header.location).toEqual(OBJECTIONS_CONFIRM_COMPANY);
    expect(response.status).toEqual(302);
    expect(mockCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER, ACCESS_TOKEN);
  });

  it("should pad company details for a valid abbreviated company number - single letter prefix", async () => {

    const mockValidAccessToken = retrieveAccessTokenFromSession as jest.Mock;
    const mockGetObjectionsSession =  retrieveObjectionSessionFromSession as jest.Mock;

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
      .send({ companyNumber: "A123" });

    expect(response.header.location).toEqual(OBJECTIONS_CONFIRM_COMPANY);
    expect(response.status).toEqual(302);
    expect(mockCompanyProfile).toHaveBeenCalledWith("A0000123", ACCESS_TOKEN);
  });

  it("should pad company details for a valid abbreviated company number - double letter prefix", async () => {

    const mockValidAccessToken = retrieveAccessTokenFromSession as jest.Mock;
    const mockGetObjectionsSession =  retrieveObjectionSessionFromSession as jest.Mock;

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
      .send({ companyNumber: "AA123" });

    expect(response.header.location).toEqual(OBJECTIONS_CONFIRM_COMPANY);
    expect(response.status).toEqual(302);
    expect(mockCompanyProfile).toHaveBeenCalledWith("AA000123", ACCESS_TOKEN);
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
