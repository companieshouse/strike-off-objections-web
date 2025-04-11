jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/middleware/objection.session.middleware");

import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { SESSION_OBJECTION_ID, OBJECTIONS_SESSION_NAME } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { OBJECTIONS_CONFIRMATION } from "../../src/model/page.urls";
import {
  deleteFromObjectionSession,
  deleteObjectionCreateFromObjectionSession,
  retrieveFromObjectionSession,
  retrieveUserEmailFromSession,
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockRetrieveUserEmailFromSession = retrieveUserEmailFromSession  as jest.Mock;
const mockRetrieveFromObjectionSession = retrieveFromObjectionSession  as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const SESSION: Session = {
  data: {},
} as Session;

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

const mockDeleteObjectionSessionValue = deleteFromObjectionSession as jest.Mock;
const mockDeleteObjectionCreateFromObjectionSession = deleteObjectionCreateFromObjectionSession as jest.Mock;

const email = "mttest@test.co.uk";
const OBJECTION_ID = "a1b2c3";

describe("confirmation screen tests", () => {

  beforeEach(() => {
    mockDeleteObjectionSessionValue.mockClear();
    mockDeleteObjectionCreateFromObjectionSession.mockClear();
    mockSessionMiddleware.mockClear();
  });

  it("should land on confirmation screen with submitted message and correct details", async () => {
    mockRetrieveUserEmailFromSession.mockReturnValueOnce(email);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(OBJECTION_ID);

    const response = await request(app).get(OBJECTIONS_CONFIRMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toContain(OBJECTION_ID);
    expect(response.text).toContain(email);
  });

  it("should remove the objection id from the session before showing the confirmation screen", async () => {
    mockRetrieveUserEmailFromSession.mockReturnValueOnce(email);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(OBJECTION_ID);

    const response = await request(app).get(OBJECTIONS_CONFIRMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockDeleteObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(mockDeleteObjectionSessionValue).toHaveBeenCalledWith(SESSION, SESSION_OBJECTION_ID);

    expect(response.status).toEqual(200);
    expect(response.text).toContain(OBJECTION_ID);
    expect(response.text).toContain(email);
  });

  it("should remove the objecting entity details from the session before showing the confirmation screen", async () => {
    mockRetrieveUserEmailFromSession.mockReturnValueOnce(email);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(OBJECTION_ID);

    const response = await request(app).get(OBJECTIONS_CONFIRMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockDeleteObjectionCreateFromObjectionSession).toHaveBeenCalledTimes(1);
    expect(mockDeleteObjectionCreateFromObjectionSession).toHaveBeenCalledWith(SESSION);

    expect(response.status).toEqual(200);
    expect(response.text).toContain(OBJECTION_ID);
    expect(response.text).toContain(email);
  });

  it("should land on error screen if no session is available", async () => {
    mockRetrieveUserEmailFromSession.mockReturnValueOnce(email);
    mockRetrieveFromObjectionSession.mockReturnValueOnce(OBJECTION_ID);

    mockSessionMiddleware.mockImplementationOnce((next: NextFunction) => {
      return next();
    });

    const response = await request(app).get(OBJECTIONS_CONFIRMATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(response).not.toBeUndefined();
    expect(response.text).toContain("Sorry, there is a problem with the service");
  });
});
