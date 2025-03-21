jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");

import { sessionMock } from "../mocks/session.middleware";
import "../mocks/csrf.middleware";

import {
  retrieveAccessTokenFromSession, retrieveCompanyProfileFromObjectionSession,
  retrieveFromObjectionSession, retrieveObjectionSessionFromSession,
} from "../../src/services/objection.session.service";
import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { CLIENT, MYSELF_OR_COMPANY, OBJECTIONS_SESSION_NAME, OBJECTOR_FIELDS, SESSION_OBJECTION_CREATE } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import {
  OBJECTIONS_CHECK_YOUR_ANSWERS,
  OBJECTIONS_COMPANY_NUMBER,
  OBJECTIONS_OBJECTING_ENTITY_NAME
} from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/utils/properties";
import { Objection, ObjectionCreate } from "../../src/modules/sdk/objections";
import { getObjection, updateObjectionUserDetails } from "../../src/services/objection.service";
import { ErrorMessages } from "../../src/model/error.messages";
import { ObjectionStatus } from "../../src/modules/sdk/objections";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
const mockRetrieveFromObjectionSession = retrieveFromObjectionSession as jest.Mock;
const mockRetrieveObjectionSessionFromSession = retrieveObjectionSessionFromSession as jest.Mock;
const mockRetrieveAccessToken = retrieveAccessTokenFromSession as jest.Mock;
const mockGetObjection = getObjection as jest.Mock;
const mockRetrieveCompanyProfileFromSession = retrieveCompanyProfileFromObjectionSession as jest.Mock;
const mockUpdateObjectionUserDetails = updateObjectionUserDetails as jest.Mock;

const FULL_NAME = "Bob Lawblaw";
const ERROR_500 = "Sorry, there is a problem with the service";
const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";
const ERROR_SCREEN_MESSAGE = "Sorry, there is a problem with the service";
const SESSION: Session = {
    data: {},
} as Session;

mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

describe("objecting entity name tests", () => {

  beforeEach(() => {
    sessionMock.session = SESSION;
    mockObjectionSessionMiddleware.mockReset();
    mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      if (req.session) {
        req.session.data[OBJECTIONS_SESSION_NAME] = {};
        req.session.data[SESSION_OBJECTION_CREATE] = mockObjectionCreate;
      }
      return next();
    });
  });

  it("should render empty objecting entity name page if session object create present and the objector is 'client'", async() => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(false);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(mockObjectionCreate);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(3);
    expect(mockRetrieveObjectionSessionFromSession).not.toBeCalled();
    expect(mockGetObjection).not.toBeCalled();
    expect(response.status).toEqual(200);
    expect(response.text).toContain([OBJECTOR_FIELDS[CLIENT].objectingEntityNamePageText]);
    expect(response.text).toContain(FULL_NAME);
  });

  it("should render empty objecting entity name page if session object create present and the objector is 'myself or company'", async() => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(false);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(mockObjectionCreate);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(MYSELF_OR_COMPANY);

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(3);
    expect(mockRetrieveObjectionSessionFromSession).not.toBeCalled();
    expect(mockGetObjection).not.toBeCalled();
    expect(response.status).toEqual(200);
    expect(response.text).toContain([OBJECTOR_FIELDS[MYSELF_OR_COMPANY].objectingEntityNamePageText]);
    expect(response.text).toContain(FULL_NAME);
  });

  it("should render full objecting entity name page when objector is 'client'", async() => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(true);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);
    mockRetrieveObjectionSessionFromSession.mockReset();
    mockRetrieveObjectionSessionFromSession.mockReturnValueOnce(mockObjection);
    mockGetObjection.mockReset().mockResolvedValueOnce(mockObjection);

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(2);
    expect(mockGetObjection).toHaveBeenCalledTimes(1);
    expect(response.text).toContain([OBJECTOR_FIELDS[CLIENT].objectingEntityNamePageText]);
    expect(response.text).toContain(FULL_NAME);
  });

  it("should render full objecting entity name page when the objector is 'myself-or-company'", async() => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(true);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(MYSELF_OR_COMPANY);
    mockRetrieveObjectionSessionFromSession.mockReset();
    mockRetrieveObjectionSessionFromSession.mockReturnValueOnce(mockObjection);
    mockGetObjection.mockReset().mockResolvedValueOnce(mockObjection);

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(2);
    expect(mockGetObjection).toHaveBeenCalledTimes(1);
    expect(response.text).toContain([OBJECTOR_FIELDS[MYSELF_OR_COMPANY].objectingEntityNamePageText]);
    expect(response.text).toContain(FULL_NAME);
  });

  it("should throw exception when objection not found", async() => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(true);
    mockRetrieveObjectionSessionFromSession.mockReset();
    mockRetrieveObjectionSessionFromSession.mockReturnValueOnce(mockObjection);
    mockGetObjection.mockReset().mockResolvedValueOnce(undefined);

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(1);
    expect(mockGetObjection).toHaveBeenCalledTimes(1);
  });

  it("should catch and throw exception when get objection throws error", async() => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(true);
    mockRetrieveObjectionSessionFromSession.mockReset();
    mockRetrieveObjectionSessionFromSession.mockReturnValueOnce(mockObjection);
    mockGetObjection.mockReset().mockImplementation(() => {
      throw Error("Test");
    });

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(1);
    expect(mockGetObjection).toHaveBeenCalledTimes(1);
    expect(mockGetObjection).toThrow(Error("Test"));
  });

  it("should reroute to error page if session is not present", async() => {
    sessionMock.session = undefined;
    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.status).toEqual(500);
    expect(response.text).toContain(ERROR_SCREEN_MESSAGE);
  });

  it("should render company number page when posting entered details and objector value", async () => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);
    mockRetrieveObjectionSessionFromSession.mockReset();

    const response = await request(app).post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: FULL_NAME,
        shareIdentity: "yes"
      });

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_COMPANY_NUMBER);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(3);
    expect(mockRetrieveAccessToken).not.toBeCalled();
    expect(mockRetrieveCompanyProfileFromSession).not.toBeCalled();
  });

  it("should receive error messages when no information is provided and the objector is 'client'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: "",
        shareIdentity: ""
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_ORGANISATION_NAME);
    expect(response.text).toContain(ErrorMessages.SELECT_TO_DIVULGE);
  });

  it("should receive error messages when no information is provided and the objector is 'myself or company'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(MYSELF_OR_COMPANY);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: "",
        shareIdentity: ""
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_NAME_OR_COMPANY);
    expect(response.text).toContain(ErrorMessages.SELECT_TO_DIVULGE);
  });

  it("should receive error message when whitespace is provided and no divulge option is selected and the objector is 'client'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: " ",
        shareIdentity: ""
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_ORGANISATION_NAME);
    expect(response.text).toContain(ErrorMessages.SELECT_TO_DIVULGE);
  });

  it("should receive error message when whitespace is provided and no divulge option is selected and the objector is 'myself or company'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(MYSELF_OR_COMPANY);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: " ",
        shareIdentity: ""
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_NAME_OR_COMPANY);
    expect(response.text).toContain(ErrorMessages.SELECT_TO_DIVULGE);
  });

  it("should receive error messages when only whitespace is provided but a yes divulge option is selected and the objector is 'client'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: " ",
        shareIdentity: "yes"
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_ORGANISATION_NAME);
    expect(response.text).not.toContain(ErrorMessages.SELECT_TO_DIVULGE);
    expect(response.text).toContain("value=\"yes\" checked");
    expect(response.text).not.toContain("value=\"no\" checked");
  });

  it("should receive error messages when only whitespace is provided but a yes divulge option is selected and the objector is 'myself or company'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(MYSELF_OR_COMPANY);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: " ",
        shareIdentity: "yes"
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_NAME_OR_COMPANY);
    expect(response.text).not.toContain(ErrorMessages.SELECT_TO_DIVULGE);
    expect(response.text).toContain("value=\"yes\" checked");
    expect(response.text).not.toContain("value=\"no\" checked");
  });

  it("should receive error messages when only whitespace is provided but a no divulge option is selected and the objector is 'client'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: " ",
        shareIdentity: "no"
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_ORGANISATION_NAME);
    expect(response.text).not.toContain(ErrorMessages.SELECT_TO_DIVULGE);
    expect(response.text).toContain("value=\"no\" checked");
    expect(response.text).not.toContain("value=\"yes\" checked");
  });

  it("should receive error messages when only whitespace is provided but a no divulge option is selected and the objector is 'myself or company'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(MYSELF_OR_COMPANY);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: " ",
        shareIdentity: "no"
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_NAME_OR_COMPANY);
    expect(response.text).not.toContain(ErrorMessages.SELECT_TO_DIVULGE);
    expect(response.text).toContain("value=\"no\" checked");
    expect(response.text).not.toContain("value=\"yes\" checked");
  });

  it("should receive error message when no name is provided but a yes divulge option is selected and the objector is 'client'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: "",
        shareIdentity: "yes"
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_ORGANISATION_NAME);
    expect(response.text).not.toContain(ErrorMessages.SELECT_TO_DIVULGE);
    expect(response.text).toContain("value=\"yes\" checked");
    expect(response.text).not.toContain("value=\"no\" checked");
  });

  it("should receive error message when no name is provided but a yes divulge option is selected and the objector is 'myself or company'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(MYSELF_OR_COMPANY);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: "",
        shareIdentity: "yes"
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_NAME_OR_COMPANY);
    expect(response.text).not.toContain(ErrorMessages.SELECT_TO_DIVULGE);
    expect(response.text).toContain("value=\"yes\" checked");
    expect(response.text).not.toContain("value=\"no\" checked");
  });

  it("should receive error message when no name is provided but a no divulge option is selected and the objector is 'client'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: "",
        shareIdentity: "no"
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_ORGANISATION_NAME);
    expect(response.text).not.toContain(ErrorMessages.SELECT_TO_DIVULGE);
    expect(response.text).toContain("value=\"no\" checked");
    expect(response.text).not.toContain("value=\"yes\" checked");
  });

  it("should receive error message when no name is provided but a no divulge option is selected and the objector is 'myself or company'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(MYSELF_OR_COMPANY);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: "",
        shareIdentity: "no"
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.ENTER_NAME_OR_COMPANY);
    expect(response.text).not.toContain(ErrorMessages.SELECT_TO_DIVULGE);
    expect(response.text).toContain("value=\"no\" checked");
    expect(response.text).not.toContain("value=\"yes\" checked");
  });

  it("should receive error message when name is provided but no divulge option is selected and the objector is 'client'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: FULL_NAME,
        shareIdentity: ""
      });

    expect(response.status).toEqual(200);
    expect(response.text).not.toContain(ErrorMessages.ENTER_ORGANISATION_NAME);
    expect(response.text).toContain(ErrorMessages.SELECT_TO_DIVULGE);
    expect(response.text).toContain(FULL_NAME);
  });

  it("should receive error message when name is provided but no divulge option is selected and the objector is 'myself or company'", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(MYSELF_OR_COMPANY);

    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: FULL_NAME,
        shareIdentity: ""
      });

    expect(response.status).toEqual(200);
    expect(response.text).not.toContain(ErrorMessages.ENTER_NAME_OR_COMPANY);
    expect(response.text).toContain(ErrorMessages.SELECT_TO_DIVULGE);
    expect(response.text).toContain(FULL_NAME);
  });

  it("should render error page if session is not present", async () => {
    sessionMock.session = undefined;
    const response = await request(app).post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: FULL_NAME,
        shareIdentity: "yes"
      });

    expect(response.status).toEqual(500);
    expect(response.text).toContain(ERROR_500);
  });

  it("should navigate to check your answers when posting entered details", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveCompanyProfileFromSession.mockReset();
    mockRetrieveCompanyProfileFromSession.mockReturnValueOnce(COMPANY_NUMBER);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(undefined);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(undefined);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(true);
    mockRetrieveObjectionSessionFromSession.mockReset();
    mockUpdateObjectionUserDetails.mockReset();

    const response = await request(app).post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: FULL_NAME,
        shareIdentity: "yes"
      });

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_CHECK_YOUR_ANSWERS);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(4);
    expect(mockRetrieveAccessToken).toHaveBeenCalledTimes(1);
    expect(mockRetrieveCompanyProfileFromSession).toHaveBeenCalledTimes(1);
  });

  it("should catch and throw exception when updateObjectionUserDetails throws an error", async () => {
    mockRetrieveAccessToken.mockReset();
    mockRetrieveAccessToken.mockReturnValueOnce(ACCESS_TOKEN);
    mockRetrieveCompanyProfileFromSession.mockReset();
    mockRetrieveCompanyProfileFromSession.mockReturnValueOnce(COMPANY_NUMBER);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(undefined);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(CLIENT);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(true);
    mockRetrieveObjectionSessionFromSession.mockReset();
    mockUpdateObjectionUserDetails.mockReset();
    mockUpdateObjectionUserDetails.mockImplementation(() => {
      throw new Error("Test");
    });

    const response = await request(app).post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: FULL_NAME,
        shareIdentity: "yes"
      });

    expect(response.status).toEqual(500);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(4);
    expect(mockRetrieveAccessToken).toHaveBeenCalledTimes(1);
    expect(mockRetrieveCompanyProfileFromSession).toHaveBeenCalledTimes(1);
    expect(mockUpdateObjectionUserDetails).toThrow(Error("Test"));
  });

  it("should return error page when objection returned from mongo but name missing", async () => {
    mockRetrieveFromObjectionSession.mockReset().mockReturnValueOnce(true);
    mockGetObjection.mockReset().mockResolvedValueOnce(
      {
        created_by: {
          share_identity: false,
        }
      } as Objection
    );

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(response.text).toContain(ERROR_SCREEN_MESSAGE);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(2);
    expect(mockGetObjection).toHaveBeenCalledTimes(1);
  });

  it("should return error page when objection returned from mongo but shareIdentity missing", async () => {
    mockRetrieveFromObjectionSession.mockReset().mockReturnValueOnce(true);
    mockGetObjection.mockReset().mockResolvedValueOnce(
      {
        created_by: {
          full_name: FULL_NAME,
        }
      } as Objection
    );

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(response.text).toContain(ERROR_SCREEN_MESSAGE);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(2);
    expect(mockGetObjection).toHaveBeenCalledTimes(1);
  });
});

const mockObjection: Objection = {
  id: "",
  attachments: [
    {
      name: "attachment.jpg",
    },
    {
      name: "document.pdf",
    }],
  created_by: {
    full_name: FULL_NAME,
    share_identity: false,
    objector: ""
  },
  reason: "Owed some money",
  status: ObjectionStatus.OPEN,
};

const mockObjectionCreate: ObjectionCreate = {
  full_name: FULL_NAME,
  share_identity: false,
  objector: ""
};
