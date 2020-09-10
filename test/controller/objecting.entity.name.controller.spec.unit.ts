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
import { ObjectionCreate } from "../../src/modules/sdk/objections";

const mockAddObjectCreate = addObjectionCreateToObjectionSession as jest.Mock

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

const ERROR_500 = "Sorry, there is a problem with the service";

describe("objecting entity name tests", () => {
  mockAddObjectCreate.mockReset();
  it("should render the company number page when posting", async () => {
    const response = await request(app).post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_COMPANY_NUMBER);
  });

  it("should render error page if objection create is undefined", async () => {
    mockAddObjectCreate.mockReset();
    mockAddObjectCreate.mockImplementation(() => { throw new Error("Error object create test"); });
    const response = await request(app).post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.status).toEqual(500);
    expect(response.text).toContain(ERROR_500);
  });

  it("should render error page if session is not present", async () => {
    mockObjectionSessionMiddleware.mockReset();
    mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      return next();
    });
    const response = await request(app).post(OBJECTIONS_OBJECTING_ENTITY_NAME)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.status).toEqual(500);
    expect(response.text).toContain(ERROR_500);
  });
});

const dummyObjectionCreate: ObjectionCreate = {
  fullName: "Joe Bloggs",
  shareIdentity: false,
};
