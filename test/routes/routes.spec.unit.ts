jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/modules/sdk/objections");

import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { CLIENT, MYSELF_OR_COMPANY, OBJECTIONS_SESSION_NAME } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import { CompanyEligibility, EligibilityStatus, Objection } from "../../src/modules/sdk/objections";
import { getCompanyEligibility, getObjection } from "../../src/services/objection.service";
import { retrieveCompanyProfileFromObjectionSession, retrieveFromObjectionSession } from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockGetObjectionSessionValue = retrieveCompanyProfileFromObjectionSession as jest.Mock;
const mockGetCompanyEligibility = getCompanyEligibility as jest.Mock;
const mockRetrieveFromObjectionSession = retrieveFromObjectionSession as jest.Mock;

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

const mockGetObjection = getObjection as jest.Mock;

describe("Basic URL Tests", () => {

  it("should find start page with cookie", async () => {
    const response = await request(app)
      .get("/strike-off-objections")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/To object online you need:/);
    expect(response.text).toMatch(/the limited company number of the company that is being struck off/);
  });

  it("should find start page without cookie", async () => {
    const response = await request(app)
      .get("/strike-off-objections");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/To object online you need:/);
    expect(response.text).toMatch(/the limited company number of the company that is being struck off/);
  });

  it("should find the objector-organisation page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/objector-organisation");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Who is applying to object/);
  });

  it("should find the objecting entity name page when the objector is 'client'", async () => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(false);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(undefined);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);

    const response = await request(app)
      .get("/strike-off-objections/objecting-entity-name");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/What is the name of your organisation?/);
  });

  it("should find the objecting entity name page when the objector is 'myself or company'", async () => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(false);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(undefined);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(MYSELF_OR_COMPANY);

    const response = await request(app)
      .get("/strike-off-objections/objecting-entity-name");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Tell us your name, or the name of the company you work for/);
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
    mockGetCompanyEligibility.mockReset().mockImplementationOnce(() => {
      return {
        is_eligible: false,
        eligibility_status: EligibilityStatus.INELIGIBLE_NO_DISSOLUTION_ACTION
      } as CompanyEligibility;
    });

    const response = await request(app)
      .get("/strike-off-objections/confirm-company");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Confirm this is the correct company/);
  });

  it("should find the enter information page", async () => {
    mockGetObjection.mockReset().mockResolvedValueOnce(mockObjection);

    const response = await request(app)
      .get("/strike-off-objections/enter-information");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Tell us why you&#39;re objecting to the company being struck off/);
  });

  it("should find the document upload page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/document-upload");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Upload documents to support your objection/);
  });

  it("should find the check your answers page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/check-your-answers");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Check your answers/);
  });

  it("should find the error page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/error");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Sorry, there is a problem with the service/);
  });

  it("should find the notice expired page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/notice-expired");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/It's too late to object to the company being struck off/);
  });

  it("should find the no strike off page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/no-strike-off");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/There is no strike off notice for the company/);
  });

  it("should find the accessibility statement page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/accessibility-statement");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Accessibility statement for the Apply to object to a company being struck off service/);
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

const mockObjection: Objection = {
  attachments: [
    {
      name: "attachment.jpg",
    },
    {
      name: "document.pdf",
    }],
  created_by: {
    full_name: "name",
    share_identity: false,
    objector: "client"
  },
  reason: "Reason",
};
