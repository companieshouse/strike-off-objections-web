import {
  addToObjectionSession,
  retrieveCompanyProfileFromObjectionSession
} from "../../src/services/objection.session.service";

jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.service");

import request from "supertest";
import { COOKIE_NAME } from "../../src/utils/properties";
import { OBJECTIONS_CHANGE_ANSWERS } from "../../src/model/page.urls";
import app from "../../src/app";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import { NextFunction, Request, Response } from "express";
import sessionMiddleware from "../../src/middleware/session.middleware";
import { Session } from "ch-node-session-handler/lib/session/model/Session";
import objectionSessionMiddleware from "../../src/middleware/objection.session.middleware";
import { CHANGE_ANSWER_KEY, OBJECTIONS_SESSION_NAME } from "../../src/constants";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";

const OBJECTION_ID = "123456";
const COMPANY_NUMBER = "00006400";
const ERROR_500 = "Sorry, there is a problem with the service";

const SESSION: Session = {
  data: {},
} as Session;

const mockGetObjectionSessionValue = retrieveCompanyProfileFromObjectionSession as jest.Mock;

const mockSetObjectionSessionValue = addToObjectionSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = SESSION;
  return next();
});

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    req.session.data[OBJECTIONS_SESSION_NAME] = { objection_id: OBJECTION_ID };
    return next();
  }

  return next(new Error("No session on request"));
});

describe("change answers tests", () => {
  it("should redirect to objecting-entity-name when query is passed and update session", async () => {

    const queryId: string = "?changePage=objecting-entity-name";
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementationOnce(() => dummyCompanyProfile);

    mockSetObjectionSessionValue.mockReset();

    const res = await request(app)
      .get(OBJECTIONS_CHANGE_ANSWERS + queryId)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(302);
    expect(mockSetObjectionSessionValue).toHaveBeenCalledWith(SESSION, CHANGE_ANSWER_KEY, true);
    expect(res.text).toContain("Found. Redirecting to /strike-off-objections/objecting-entity-name");
  });

  it("should redirect to enter-information when query is passed and update session", async () => {

    const queryId: string = "?changePage=enter-information";
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementationOnce(() => dummyCompanyProfile);

    mockSetObjectionSessionValue.mockReset();

    const res = await request(app)
      .get(OBJECTIONS_CHANGE_ANSWERS + queryId)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(302);
    expect(mockSetObjectionSessionValue).toHaveBeenCalledWith(SESSION, CHANGE_ANSWER_KEY, true);
    expect(res.text).toContain("Found. Redirecting to /strike-off-objections/enter-information");
  });

  it("should redirect to document-upload when query is passed and update session", async () => {

    const queryId: string = "?changePage=document-upload";
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementationOnce(() => dummyCompanyProfile);

    mockSetObjectionSessionValue.mockReset();

    const res = await request(app)
      .get(OBJECTIONS_CHANGE_ANSWERS + queryId)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(302);
    expect(mockSetObjectionSessionValue).toHaveBeenCalledWith(SESSION, CHANGE_ANSWER_KEY, true);
    expect(res.text).toContain("Found. Redirecting to /strike-off-objections/document-upload");
  });

  it("should redirect to error page when session is missng", async () => {

    const queryId: string = "?changePage=objecting-entity-name";
    mockSessionMiddleware.mockReset();
    mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      return next();
    });

    const res = await request(app)
      .get(OBJECTIONS_CHANGE_ANSWERS + queryId)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(500);
    expect(res.text).toContain(ERROR_500);
  });

  it("should redirect to error page when query is missng", async () => {

    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementationOnce(() => dummyCompanyProfile);

    const res = await request(app)
      .get(OBJECTIONS_CHANGE_ANSWERS)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(500);
    expect(res.text).toContain(ERROR_500);
  });
});

const dummyCompanyProfile: ObjectionCompanyProfile = {
  address: {
    line_1: "line1",
    line_2: "line2",
    postCode: "post code",
  },
  companyName: "Girls school trust",
  companyNumber: COMPANY_NUMBER,
  companyStatus: "Active",
  companyType: "limited",
  incorporationDate: "26 June 1872",
};
