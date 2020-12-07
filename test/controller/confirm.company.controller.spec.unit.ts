jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/company.filing.history.service");

import { FilingHistoryItem } from "@companieshouse/api-sdk-node/dist/services/company-filing-history";
import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME, SESSION_OBJECTION_ID } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import {
  OBJECTIONS_CONFIRM_COMPANY,
  OBJECTIONS_ENTER_INFORMATION,
  OBJECTIONS_NO_STRIKE_OFF,
  OBJECTIONS_NOTICE_EXPIRED
} from "../../src/model/page.urls";
import {
  ApiError,
  CompanyEligibility,
  EligibilityStatus,
  ObjectionCreate,
  ObjectionCreatedResponse,
  ObjectionStatus
} from "../../src/modules/sdk/objections";
import { getLatestGaz1FilingHistoryItem } from "../../src/services/company.filing.history.service";
import { createNewObjection, getCompanyEligibility } from "../../src/services/objection.service";
import {
  addToObjectionSession,
  deleteObjectionCreateFromObjectionSession,
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveObjectionCreateFromObjectionSession
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const OBJECTION_ID = "123456";
const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const SESSION: Session = {
  data: {},
} as Session;

const mockGetObjectionSessionValue = retrieveCompanyProfileFromObjectionSession as jest.Mock;
const mockGetObjectCreate = retrieveObjectionCreateFromObjectionSession as jest.Mock;
const mockDeleteObjectCreate = deleteObjectionCreateFromObjectionSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = SESSION;
  return next();
});

const mockSetObjectionSessionValue = addToObjectionSession as jest.Mock;

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    req.session.data[OBJECTIONS_SESSION_NAME] = {};
    return next();
  }

  return next(new Error("No session on request"));
});

const mockCreateNewObjection = createNewObjection as jest.Mock;
const mockGetCompanyEligibility = getCompanyEligibility as jest.Mock;

describe("confirm company tests", () => {

  const mockLatestGaz1FilingHistoryItem = getLatestGaz1FilingHistoryItem as jest.Mock;

  beforeEach(() => {
    mockLatestGaz1FilingHistoryItem.mockReset();
  });

  it("should render the page with company data from the session", async () => {

    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    mockGetCompanyEligibility.mockReset();
    mockGetCompanyEligibility.mockImplementation(() => false);

    const response = await request(app).get(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.text).toContain("Girls school trust");
    expect(response.text).toContain("00006400");
    expect(response.text).toContain("Active");
    expect(response.text).toContain("26 June 1872");
    expect(response.text).toContain("limited");
    expect(response.text).toContain("line1");
    expect(response.text).toContain("line2");
    expect(response.text).toContain("post code");
    expect(response.text).toContain("No notice in The Gazette");
  });

  it("should call the API to create a new objection then render the enter information page", async () => {

    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    mockSetObjectionSessionValue.mockReset();

    mockCreateNewObjection.mockReset();
    mockCreateNewObjection.mockImplementation(() => dummyOpenObjectionCreatedResponse);

    mockGetObjectCreate.mockReset();
    mockGetObjectCreate.mockImplementation(() =>  dummyObjectionCreate );

    const response = await request(app).post(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(mockSetObjectionSessionValue).toHaveBeenCalledWith(SESSION, SESSION_OBJECTION_ID, OBJECTION_ID);
    expect(mockCreateNewObjection).toHaveBeenCalledWith(dummyCompanyProfile.companyNumber, undefined, dummyObjectionCreate);
    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_ENTER_INFORMATION);
  });

  it("should render the notice expired page when an objection is created with the status INELIGIBLE_COMPANY_STRUCK_OFF", async () => {
    mockDeleteObjectCreate.mockReset();
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    mockSetObjectionSessionValue.mockReset();

    mockCreateNewObjection.mockReset();
    mockCreateNewObjection.mockImplementation(() => dummyStruckOffObjectionCreatedResponse);

    const response = await request(app).post(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockDeleteObjectCreate).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_NOTICE_EXPIRED);
  });

  it("should render the no strike off page when an objection is created with the status INELIGIBLE_NO_DISSOLUTION_ACTION", async () => {
    mockDeleteObjectCreate.mockReset();
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    mockSetObjectionSessionValue.mockReset();

    mockCreateNewObjection.mockReset();
    mockCreateNewObjection.mockImplementation(() => dummyNoDissolutionActionObjectionCreatedResponse);

    const response = await request(app).post(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockDeleteObjectCreate).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_NO_STRIKE_OFF);
  });

  it("should render the generic error page when an api error occurs with an unknown status", async () => {

    const apiError: ApiError = {
      data: {
        status: "UNKNOWN"
      },
      message: "There is an error",
      status: 500,
    };

    const ERROR_500 = "Sorry, there is a problem with the service";

    mockDeleteObjectCreate.mockReset();
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    mockSetObjectionSessionValue.mockReset();

    mockCreateNewObjection.mockReset();
    mockCreateNewObjection.mockImplementation(() => {
      throw apiError;
    });

    const response = await request(app).post(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockDeleteObjectCreate).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(500);
    expect(response.text).toContain(ERROR_500);
  });

  it("should re-direct to error page when action code is eligible but no GAZ1 date is found", async () => {

    const mockValidAccessToken = retrieveAccessTokenFromSession as jest.Mock;

    beforeEach(() => {
      mockValidAccessToken.mockReset();
    });

    mockValidAccessToken.mockImplementation(() => ACCESS_TOKEN );

    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    mockGetCompanyEligibility.mockReset();
    mockGetCompanyEligibility.mockImplementation(() => dummyCompanyEligibility);

    mockLatestGaz1FilingHistoryItem.mockResolvedValueOnce(undefined);

    const response = await request(app).get(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(500);

    expect(response.text).toContain("Sorry, there is a problem with the service");

  });

  it("should correctly display the latest GAZ1 date from the filing history if action code is eligible", async () => {

    const mockValidAccessToken = retrieveAccessTokenFromSession as jest.Mock;
    mockValidAccessToken.mockReset().mockImplementation(() => ACCESS_TOKEN );

    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    mockGetCompanyEligibility.mockReset();
    mockGetCompanyEligibility.mockImplementation(() => dummyCompanyEligibility);

    mockLatestGaz1FilingHistoryItem.mockResolvedValueOnce(dummyFilingHistoryItem);

    const response = await request(app).get(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);

    expect(response.text).toContain("00006400");
    expect(response.text).toContain("14 April 2015");
  });

  it("should correctly display the latest GAZ1 date from the filing history if company in gaz1, with gaz2 requested", async () => {

    const mockValidAccessToken = retrieveAccessTokenFromSession as jest.Mock;
    mockValidAccessToken.mockReset().mockImplementation(() => ACCESS_TOKEN);

    mockGetObjectionSessionValue.mockReset().mockImplementation(() => dummyCompanyProfile);

    mockGetCompanyEligibility.mockReset().mockImplementation(() => dummyCompanyEligibilityIneligibleGaz2Requested);

    mockLatestGaz1FilingHistoryItem.mockResolvedValueOnce(dummyFilingHistoryItem);

    const response = await request(app).get(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);

    expect(response.text).toContain("00006400");
    expect(response.text).toContain("14 April 2015");
  });

  it("should render the strike off expired page when an objection is created with the status INELIGIBLE_GAZ2_REQUESTED", async () => {
    mockDeleteObjectCreate.mockReset();
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    mockSetObjectionSessionValue.mockReset();

    mockCreateNewObjection.mockReset();
    mockCreateNewObjection.mockImplementation(() => dummyGaz2RequestedObjectionCreatedResponse);

    const response = await request(app).post(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockDeleteObjectCreate).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_NOTICE_EXPIRED);
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

const dummyFilingHistoryItem: FilingHistoryItem = {
  category: "",
  date: "2015-04-14",
  description: "",
  transactionId: "",
  type: "GAZ1",
};

const dummyObjectionCreate: ObjectionCreate = {
  full_name: "Joe Bloggs",
  share_identity: false,
};

const dummyOpenObjectionCreatedResponse: ObjectionCreatedResponse = {
  objectionId: OBJECTION_ID,
  objectionStatus: ObjectionStatus.OPEN,
};

const dummyNoDissolutionActionObjectionCreatedResponse: ObjectionCreatedResponse = {
  objectionId: OBJECTION_ID,
  objectionStatus: ObjectionStatus.INELIGIBLE_NO_DISSOLUTION_ACTION,
};

const dummyGaz2RequestedObjectionCreatedResponse: ObjectionCreatedResponse = {
  objectionId: OBJECTION_ID,
  objectionStatus: ObjectionStatus.INELIGIBLE_GAZ2_REQUESTED,
};

const dummyStruckOffObjectionCreatedResponse: ObjectionCreatedResponse = {
  objectionId: OBJECTION_ID,
  objectionStatus: ObjectionStatus.INELIGIBLE_COMPANY_STRUCK_OFF,
};

const dummyCompanyEligibility: CompanyEligibility = {
  is_eligible: true,
  eligibility_status: EligibilityStatus.ELIGIBLE,
};

const dummyCompanyEligibilityIneligibleGaz2Requested: CompanyEligibility = {
  is_eligible: false,
  eligibility_status: EligibilityStatus.INELIGIBLE_GAZ2_REQUESTED,
};
