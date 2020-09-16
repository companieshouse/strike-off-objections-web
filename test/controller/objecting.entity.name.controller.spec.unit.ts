import {
  addObjectionCreateToObjectionSession,
} from "../../src/services/objection.session.service";

jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.session.service");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import objectionSessionMiddleware from "../../src/middleware/objection.session.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import {
  OBJECTIONS_COMPANY_NUMBER,
  OBJECTIONS_OBJECTING_ENTITY_NAME
} from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockAddObjectCreate = addObjectionCreateToObjectionSession as jest.Mock

const FULL_NAME = "Bob Lawblaw";
const ENTER_FULL_NAME = "Enter your full name";
const SELECT_TO_DIVULGE = "Select if we can share your name and email address with the company if they request that information";
const ERROR_500 = "Sorry, there is a problem with the service";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

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

describe("objecting entity name tests", () => {

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
