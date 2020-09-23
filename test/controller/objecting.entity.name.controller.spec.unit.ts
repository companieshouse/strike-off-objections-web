jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");

import {
  retrieveFromObjectionSession, retrieveObjectionSessionFromSession,
} from "../../src/services/objection.session.service";
import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import {OBJECTIONS_SESSION_NAME, SESSION_OBJECTION_CREATE} from "../../src/constants";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import objectionSessionMiddleware from "../../src/middleware/objection.session.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import {
  OBJECTIONS_COMPANY_NUMBER,
  OBJECTIONS_OBJECTING_ENTITY_NAME
} from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/utils/properties";
import { Objection, ObjectionCreate } from "../../src/modules/sdk/objections";
import { getObjection } from "../../src/services/objection.service";

const FULL_NAME = "Bob Lawblaw";
const ENTER_FULL_NAME = "Enter your full name";
const SELECT_TO_DIVULGE = "Select if we can share your name and email address with the company if they request that information";
const ERROR_500 = "Sorry, there is a problem with the service";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockSessionMiddleware = sessionMiddleware as jest.Mock;

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;

const mockRetrieveFromObjectionSession = retrieveFromObjectionSession as jest.Mock;

const mockRetrieveObjectionSessionFromSession = retrieveObjectionSessionFromSession as jest.Mock;

const mockGetObjection = getObjection as jest.Mock;

describe("objecting entity name tests", () => {

  beforeEach(() => {
    mockSessionMiddleware.mockReset();
    mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      req.session = {
        data: {},
      } as Session;
      return next();
    });
    mockObjectionSessionMiddleware.mockReset();
    mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      if (req.session) {
        req.session.data[OBJECTIONS_SESSION_NAME] = {};
        req.session.data[SESSION_OBJECTION_CREATE] = mockObjectionCreate;
        return next();
      }

      return next(new Error("No session on request"));
    });
  });

  it("should render empty objecting entity name page if no change answer flag is set in session", async() => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(undefined);

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(2);
    expect(mockRetrieveObjectionSessionFromSession).not.toBeCalled();
    expect(mockGetObjection).not.toBeCalled();
    expect(response.status).toEqual(200);
    expect(response.text).toContain("What is your full name");
    expect(response.text).not.toContain(FULL_NAME);
  });

  it("should render empty objecting entity name page if change answer flag is set to false", async() => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(false);

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(2);
    expect(mockRetrieveObjectionSessionFromSession).not.toBeCalled();
    expect(mockGetObjection).not.toBeCalled();
    expect(response.status).toEqual(200);
    expect(response.text).toContain("What is your full name");
    expect(response.text).not.toContain(FULL_NAME);
  });

  it("should render full objecting entity name page if change answer flag is set to true", async() => {
    mockRetrieveObjectionSessionFromSession.mockReset();
    mockRetrieveObjectionSessionFromSession.mockReturnValueOnce(mockObjection);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(true);
    mockGetObjection.mockReset().mockResolvedValueOnce(mockObjection);

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(1);
    expect(mockRetrieveObjectionSessionFromSession).toHaveBeenCalledTimes(1);
    expect(mockGetObjection).toHaveBeenCalledTimes(1);
    expect(response.text).toContain("What is your full name");
    expect(response.text).toContain(FULL_NAME);
  });

  it("should throw exception when objection not found even when change answer flag is set to true", async() => {
    mockRetrieveObjectionSessionFromSession.mockReset();
    mockRetrieveObjectionSessionFromSession.mockReturnValueOnce(mockObjection);
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockReturnValueOnce(true);
    mockGetObjection.mockReset().mockResolvedValueOnce(undefined);

    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(1);
    expect(mockRetrieveObjectionSessionFromSession).toHaveBeenCalledTimes(1);
    expect(mockGetObjection).toHaveBeenCalledTimes(1);
  });

  it("should reroute to error page if session is not present", async() => {
    mockSessionMiddleware.mockReset();
    mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      return next();
    });
    const response = await request(app).get(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.status).toEqual(500);
  });

  it("should render the company number page when posting with entered details", async () => {
    const response = await request(app).post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: FULL_NAME,
        shareIdentity: "yes"
      });

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_COMPANY_NUMBER);
  });

  it("should receive error messages when no information is provided", async () => {
    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ENTER_FULL_NAME);
    expect(response.text).toContain(SELECT_TO_DIVULGE);
  });

  it("should receive error message when no name is provided but a yes divulge option is selected", async () => {
    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        shareIdentity: "yes"
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ENTER_FULL_NAME);
    expect(response.text).not.toContain(SELECT_TO_DIVULGE);
    expect(response.text).toContain("value=\"yes\" checked");
    expect(response.text).not.toContain("value=\"no\" checked");
  });

  it("should receive error message when no name is provided but a no divulge option is selected", async () => {
    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        shareIdentity: "no"
      });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ENTER_FULL_NAME);
    expect(response.text).not.toContain(SELECT_TO_DIVULGE);
    expect(response.text).toContain("value=\"no\" checked");
    expect(response.text).not.toContain("value=\"yes\" checked");
  });

  it("should receive error message when name is provided but no divulge option is selected", async () => {
    const response = await request(app)
      .post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        fullName: FULL_NAME
      });

    expect(response.status).toEqual(200);
    expect(response.text).not.toContain(ENTER_FULL_NAME);
    expect(response.text).toContain(SELECT_TO_DIVULGE);
    expect(response.text).toContain(FULL_NAME);
  });

  it("should render error page if session is not present", async () => {
    mockSessionMiddleware.mockReset();
    mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      return next();
    });
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
});

const mockObjection: Objection = {
  attachments: [
    {
      name: "attachment.jpg",
    },
    {
      name: "document.pdf",
    }],
  created_by: {
    fullName: FULL_NAME,
    shareIdentity: false
  },
  reason: "Owed some money",
}

const mockObjectionCreate: ObjectionCreate = {
  fullName: FULL_NAME,
  shareIdentity: false,
};
