jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/company.filing.history.service");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
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
import { ApiError, ObjectionCreate } from "../../src/modules/sdk/objections";
import { createNewObjection, getCompanyEligibility } from "../../src/services/objection.service";
import {
  addToObjectionSession,
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveObjectionCreateFromObjectionSession,
  deleteObjectionCreateFromObjectionSession
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";
import { getCompanyFilingHistory } from "../../src/services/company.filing.history.service";
import { CompanyFilingHistory } from "ch-sdk-node/dist/services/company-filing-history";

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

// TODO test scenario when an error is logged - check that this is happening correctly

describe("confirm company tests", () => {

  const mockCompanyFilingHistory = getCompanyFilingHistory as jest.Mock;

  beforeEach(() => {
    mockCompanyFilingHistory.mockReset();
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

    // TODO "girl's" caused the html version of apostrophe to be returned
    // something like eg &1233; - just check that apostrophe is rendered ok in browser
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
    mockCreateNewObjection.mockImplementation(() => OBJECTION_ID);

    mockGetObjectCreate.mockReset();
    mockGetObjectCreate.mockImplementation(() =>  dummyObjectionCreate );

    mockDeleteObjectCreate.mockReset();

    const response = await request(app).post(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(mockDeleteObjectCreate).toHaveBeenCalledTimes(1);
    expect(mockSetObjectionSessionValue).toHaveBeenCalledWith(SESSION, SESSION_OBJECTION_ID, OBJECTION_ID);
    expect(mockCreateNewObjection).toHaveBeenCalledWith(dummyCompanyProfile.companyNumber, undefined, dummyObjectionCreate);
    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_ENTER_INFORMATION);
  });

  it("should render the notice expired page when an api error occurs with the status INELIGIBLE_COMPANY_STRUCK_OFF", async () => {

    const apiError: ApiError = {
      data: {
        status: "INELIGIBLE_COMPANY_STRUCK_OFF"
      },
      message: "There is an error",
      status: 400,
    };

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
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_NOTICE_EXPIRED);
  });

  it("should render the no strike off page when an api error occurs with the status INELIGIBLE_NO_DISSOLUTION_ACTION", async () => {

    const apiError: ApiError = {
      data: {
        status: "INELIGIBLE_NO_DISSOLUTION_ACTION"
      },
      message: "There is an error",
      status: 400,
    };

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
    mockGetCompanyEligibility.mockImplementation(() => true);

    mockCompanyFilingHistory.mockResolvedValueOnce(dummyCompanyFilingHistoryWithNoGaz1Date);

    const response = await request(app).get(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(500);

    expect(response.text).toContain("Sorry, there is a problem with the service");

  });

  it("should correctly extract the latest GAZ1 date from the filing history if action code is eligible", async () => {

    const mockValidAccessToken = retrieveAccessTokenFromSession as jest.Mock;

    beforeEach(() => {
      mockValidAccessToken.mockReset();
    });

    mockValidAccessToken.mockImplementation(() => ACCESS_TOKEN );

    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

    mockGetCompanyEligibility.mockReset();
    mockGetCompanyEligibility.mockImplementation(() => true);

    mockCompanyFilingHistory.mockResolvedValueOnce(dummyCompanyFilingHistory);

    const response = await request(app).get(OBJECTIONS_CONFIRM_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);

    expect(response.text).toContain("00006400");
    expect(response.text).toContain("14 April 2015");
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

const dummyCompanyFilingHistory: CompanyFilingHistory = {
  etag: "",
  filingHistoryStatus: "",
  items: [
    {
      // This entry should be ignored when extracting the GAZ1 date as type is different
      category: "",
      date: "2015-04-14",
      description: "",
      transactionId: "",
      type: "288a",
    },
    {
      category: "",
      date: "2015-04-14",
      description: "",
      transactionId: "",
      type: "GAZ1",
    },
    // And this entry shouldn't be used as it's last in the list
    {
      category: "",
      date: "2011-07-21",
      description: "",
      transactionId: "",
      type: "GAZ1",
    },
  ],
  itemsPerPage: 1,
  kind: "",
  startIndex: 1,
  totalCount: 1,
};

const dummyCompanyFilingHistoryWithNoGaz1Date: CompanyFilingHistory = {
  etag: "",
  filingHistoryStatus: "",
  items: [
    {
      // This entry should be ignored when extracting the GAZ1 date as type is different
      category: "",
      date: "2015-04-14",
      description: "",
      transactionId: "",
      type: "288a",
    },
  ],
  itemsPerPage: 1,
  kind: "",
  startIndex: 1,
  totalCount: 1,
};

const dummyObjectionCreate: ObjectionCreate = {
  full_name: "Joe Bloggs",
  share_identity: false,
};
