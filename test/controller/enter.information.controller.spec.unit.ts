jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");
jest.mock("../../src/middleware/objection.session.middleware");

import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME, PREVIOUSLY_SELECTED_COMPANY } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { ErrorMessages } from "../../src/model/error.messages";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import {
  OBJECTIONS_CHECK_YOUR_ANSWERS,
  OBJECTIONS_DOCUMENT_UPLOAD,
  OBJECTIONS_ENTER_INFORMATION
} from "../../src/model/page.urls";
import { Objection } from "../../src/modules/sdk/objections";
import { getObjection, updateObjectionReason } from "../../src/services/objection.service";
import {
  retrieveCompanyProfileFromObjectionSession,
  retrieveFromObjectionSession,
  retrieveObjectionSessionFromSession,
  addToObjectionSession,
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const COMPANY_NUMBER = "00006400";
const OBJECTION_ID = "123456";
const REASON = "Owed Money";

const SESSION: Session = {
  data: {},
} as Session;

const mockGetObjectionSessionValue = retrieveCompanyProfileFromObjectionSession as jest.Mock;
const mockSetObjectionSessionValue = addToObjectionSession as jest.Mock;
const mockRetrieveFromObjectionSession = retrieveFromObjectionSession as jest.Mock;

const mockUpdateObjectionReason = updateObjectionReason as jest.Mock;

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

const mockRetrieveObjectionSessionFromSession = retrieveObjectionSessionFromSession as jest.Mock;

const mockGetObjection = getObjection as jest.Mock;

describe("enter information tests", () => {

  it("should render the page", async () => {
    mockRetrieveFromObjectionSession.mockReset();
    mockGetObjection.mockReset().mockResolvedValueOnce(mockObjection);

    const response = await request(app).get(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toContain("Tell us why");
    expect(response.text).not.toContain(REASON);
  });

  it("should receive error messages when no information entered", async () => {
    mockRetrieveFromObjectionSession.mockReset();
    mockGetObjection.mockReset().mockResolvedValueOnce(mockObjection);

    const response = await request(app).post(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        information: ""
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.EMPTY_REASON);
  });

  it("should receive error messages when only whitespace entered", async () => {
    mockRetrieveFromObjectionSession.mockReset();
    mockGetObjection.mockReset().mockResolvedValueOnce(mockObjection);

    const response = await request(app).post(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        information: " "
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.EMPTY_REASON);
  });

  it("should render the page with existing information when present", async () => {
    mockRetrieveFromObjectionSession.mockReset();
    mockGetObjection.mockReset().mockResolvedValueOnce(mockObjectionWithReason);

    const response = await request(app).get(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(mockGetObjection).toHaveBeenCalledTimes(1);
    expect(response.text).toContain("Tell us why");
    expect(response.text).toContain(REASON);
  });

  it("should redirect to the document-upload page on post and change flag undefined", async () => {

    mockGetObjectionSessionValue.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce("objectionId");
    mockRetrieveFromObjectionSession.mockReturnValueOnce(undefined);
    mockGetObjectionSessionValue.mockImplementationOnce(() => dummyCompanyProfile);

    const response = await request(app).post(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        information: REASON
      });

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_DOCUMENT_UPLOAD);
  });

  it("should throw an error when no session is present", async () => {
    mockRetrieveFromObjectionSession.mockReset();
    mockGetObjection.mockReset().mockResolvedValueOnce(mockObjection);
    mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      req.session = undefined;
      return next();
    });

    const response = await request(app).get(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, there is a problem with the service");
  });

  it("should throw an error when no objection is present", async () => {
    mockRetrieveFromObjectionSession.mockReset();
    mockGetObjection.mockReset().mockResolvedValueOnce(undefined);
    mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      req.session = SESSION;
      return next();
    });

    const response = await request(app).get(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, there is a problem with the service");
  });

  it("should redirect to the check-your-answers page on post with change key set to true", async () => {
    mockSessionMiddleware.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
      req.session = SESSION;
      return next();
    });
    mockGetObjectionSessionValue.mockReset();
    mockRetrieveObjectionSessionFromSession.mockReset();
    mockRetrieveFromObjectionSession.mockReset().mockReturnValueOnce("objectionId");
    mockRetrieveFromObjectionSession.mockReturnValueOnce(true);
    mockGetObjectionSessionValue.mockImplementationOnce(() => dummyCompanyProfile);
    mockGetObjection.mockReset().mockResolvedValueOnce(mockObjectionWithReason);

    const response = await request(app).post(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        information: REASON
      });

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_CHECK_YOUR_ANSWERS);
  });

  it("should call the API to update the objection with the reason", async () => {
    mockSessionMiddleware.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
      req.session = SESSION;
      return next();
    });
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementationOnce(() => dummyCompanyProfile);

    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockImplementationOnce(() => OBJECTION_ID);

    mockUpdateObjectionReason.mockReset();

    const response = await request(app).post(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ information: REASON });

    expect(mockUpdateObjectionReason).toHaveBeenCalledWith(COMPANY_NUMBER, OBJECTION_ID, undefined, REASON);

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_DOCUMENT_UPLOAD);
  });

  it("should render error page if updating objection reason produces error", async () => {
    mockSessionMiddleware.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
      req.session = SESSION;
      return next();
    });
    mockGetObjectionSessionValue.mockReset();
    mockGetObjectionSessionValue.mockImplementationOnce(() => dummyCompanyProfile);

    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockImplementationOnce(() => OBJECTION_ID);

    mockUpdateObjectionReason.mockReset();
    mockUpdateObjectionReason.mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    const response = await request(app).post(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({ information: REASON });

    expect(mockUpdateObjectionReason).toHaveBeenCalledWith(COMPANY_NUMBER, OBJECTION_ID, undefined, REASON);

    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, there is a problem with the service");
  });

  it("should save the selected company as previously selected company in session", async () => {
    const mockRetrieveFromObjectionSession = retrieveFromObjectionSession as jest.Mock;
    mockRetrieveFromObjectionSession.mockReturnValueOnce(dummyCompanyProfile);

    const response = await request(app).get(OBJECTIONS_ENTER_INFORMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(mockGetObjection).toHaveBeenCalledTimes(1);
    expect(mockSetObjectionSessionValue).toHaveBeenCalledWith(SESSION, PREVIOUSLY_SELECTED_COMPANY, dummyCompanyProfile.companyNumber);
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
    share_identity: false
  },
};

const mockObjectionWithReason: Objection = {
  attachments: [
    {
      name: "attachment.jpg",
    },
    {
      name: "document.pdf",
    }],
  created_by: {
    full_name: "name",
    share_identity: false
  },
  reason: REASON,
};
