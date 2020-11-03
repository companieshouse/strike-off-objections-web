jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.service");

import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { CHANGE_ANSWER_KEY, OBJECTIONS_SESSION_NAME } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import { OBJECTIONS_CHECK_YOUR_ANSWERS, OBJECTIONS_CONFIRMATION } from "../../src/model/page.urls";
import { Objection } from "../../src/modules/sdk/objections";
import { getObjection, submitObjection } from "../../src/services/objection.service";
import {
  deleteFromObjectionSession,
  retrieveCompanyProfileFromObjectionSession,
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const dummySession: Session = {
  data: {},
} as Session;

const mockGetObjectionSessionValue = retrieveCompanyProfileFromObjectionSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = dummySession;
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

const mockGetObjection = getObjection as jest.Mock;

const mockSubmitObjection = submitObjection as jest.Mock;

const mockDeleteFromObjectionsSession = deleteFromObjectionSession as jest.Mock;

describe("check company tests", () => {

  beforeEach(() => {
    mockDeleteFromObjectionsSession.mockReset();
  });

  it("should render the page with company data from the session with share id yes", async () => {

    mockGetObjectionSessionValue.mockReset().mockReturnValue(dummyCompanyProfile);

    mockGetObjection.mockReset().mockResolvedValue(dummyObjectionShare);

    const response = await request(app).get(OBJECTIONS_CHECK_YOUR_ANSWERS)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(mockDeleteFromObjectionsSession).toHaveBeenCalledTimes(1);
    expect(mockDeleteFromObjectionsSession).toHaveBeenCalledWith(dummySession, CHANGE_ANSWER_KEY);
    expect(response.status).toEqual(200);
    expect(response.text).toContain("Girls school trust");
    expect(response.text).toContain("00006400");
    expect(response.text).toContain("Owed some money");
    expect(response.text).toContain("attachment.jpg");
    expect(response.text).toContain("document.pdf");
    expect(response.text).toContain("Joe Bloggs");
    expect(response.text).toContain("Yes");
  });

  it("should render the page with company data from the session with share id no", async () => {

    mockGetObjectionSessionValue.mockReset().mockReturnValue(dummyCompanyProfile);

    mockGetObjection.mockReset().mockResolvedValue(dummyObjectionDoNotShare);

    const response = await request(app).get(OBJECTIONS_CHECK_YOUR_ANSWERS)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(mockDeleteFromObjectionsSession).toHaveBeenCalledTimes(1);
    expect(mockDeleteFromObjectionsSession).toHaveBeenCalledWith(dummySession, CHANGE_ANSWER_KEY);
    expect(response.status).toEqual(200);
    expect(response.text).toContain("Girls school trust");
    expect(response.text).toContain("00006400");
    expect(response.text).toContain("Owed some money");
    expect(response.text).toContain("attachment.jpg");
    expect(response.text).toContain("document.pdf");
    expect(response.text).toContain("No Bloggs");
    expect(response.text).toContain("No");
  });

  it ("should forward to confirmation page and submit the objection on post", async () => {
    const res = await request(app)
      .post(OBJECTIONS_CHECK_YOUR_ANSWERS)
      .set("referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockSubmitObjection).toBeCalledWith(dummySession);

    expect(res.status).toEqual(302);
    expect(res.header.location).toEqual(OBJECTIONS_CONFIRMATION);
  });

  it("should have double click prevention on the submit button", async () => {
    mockGetObjectionSessionValue.mockReset().mockReturnValueOnce(dummyCompanyProfile);

    mockGetObjection.mockReset().mockResolvedValueOnce(dummyObjectionShare);

    const response = await request(app).get(OBJECTIONS_CHECK_YOUR_ANSWERS)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.text).toContain("data-prevent-double-click=\"true\"");
  });

  it ("should return the error page when submitting an objection fails", async () => {
    mockSubmitObjection.mockImplementation(() => {
      throw {
        message: "Unexpected error",
        status: 500,
      };
    });

    const res = await request(app)
      .post(OBJECTIONS_CHECK_YOUR_ANSWERS)
      .set("referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockSubmitObjection).toBeCalledWith(dummySession);

    expect(res.status).toEqual(500);
    expect(res).not.toBeUndefined();
    expect(res.text).toContain("Sorry, there is a problem with the service");
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

const dummyObjectionShare: Objection = {
  attachments: [
    {
      name: "attachment.jpg",
    },
    {
      name: "document.pdf",
    }],
  created_by: {
    full_name: "Joe Bloggs",
    share_identity: true
  },
  reason: "Owed some money",
};

const dummyObjectionDoNotShare: Objection = {
  attachments: [
    {
      name: "attachment.jpg",
    },
    {
      name: "document.pdf",
    }],
  created_by: {
    full_name: "No Bloggs",
    share_identity: false
  },
  reason: "Owed some money",
};
