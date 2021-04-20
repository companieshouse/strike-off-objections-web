jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.session.service");

import { NextFunction, Request, Response } from "express";
import request from "supertest";

import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";

import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME, SESSION_OBJECTOR } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { ErrorMessages } from "../../src/model/error.messages";
import { OBJECTIONS_OBJECTING_ENTITY_NAME, OBJECTIONS_OBJECTOR_ORGANISATION } from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/utils/properties";

import { objectorOrganisation } from "../../src/validation";
import { addToObjectionSession, retrieveFromObjectionSession } from "../../src/services/objection.session.service";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
const mockSessionMiddleware = sessionMiddleware as jest.Mock;
const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
const mockSetObjectionSessionValue = addToObjectionSession as jest.Mock;
const mockRetrieveFromObjectionSession = retrieveFromObjectionSession as jest.Mock;

describe('objector organisation controller tests', () => {
  beforeEach(() => {
    mockSessionMiddleware.mockReset();
    mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      req.session = { data: {}, } as Session;

      return next();
    });

    mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

    mockObjectionSessionMiddleware.mockReset();
    mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      if (req.session) { req.session.data[OBJECTIONS_SESSION_NAME] = {}; }

      return next();
    });
  });

  it('should render objecting entity name page when option selected', async () => {
    mockSetObjectionSessionValue.mockReset();

    const response = await request(app)
      .post(OBJECTIONS_OBJECTOR_ORGANISATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        "objector-organisation": "client"
      });

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_OBJECTING_ENTITY_NAME);
    expect(response.text).not.toContain(ErrorMessages.SELECT_OBJECTOR_ORGANISATION);
  });

  it("should receive error messages when no choice has been selected", async () => {
    const response = await request(app)
      .post(OBJECTIONS_OBJECTOR_ORGANISATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.SELECT_OBJECTOR_ORGANISATION);
  });

  it('should catch and throw exception when createErrorData throws an error', async () => {
    const mockCreateErrorData = jest.spyOn(objectorOrganisation, "createErrorData")
      .mockImplementation(() => {
        throw Error("Throw Error on createErrorData");
      });

    const response = await request(app)
      .post(OBJECTIONS_OBJECTOR_ORGANISATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(mockCreateErrorData).toHaveBeenCalledTimes(1);
    expect(mockCreateErrorData).toThrow(Error("Throw Error on createErrorData"));
  });

  it('should render objector organization page and verify the two radio-buttons', async () => {
    mockSetObjectionSessionValue.mockReset();

    const response = await request(app)
      .get(OBJECTIONS_OBJECTOR_ORGANISATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toContain("myself-or-company");
    expect(response.text).toContain("client");
    expect(response.text).not.toContain(ErrorMessages.SELECT_OBJECTOR_ORGANISATION);
  });

  it('should catch and throw exception when retrieveFromObjectionSession', async () => {
    mockRetrieveFromObjectionSession.mockReset();
    mockRetrieveFromObjectionSession.mockImplementation(() => {
      throw new Error("No Objection Session found in Session");
    });

    const response = await request(app)
      .get(OBJECTIONS_OBJECTOR_ORGANISATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(mockRetrieveFromObjectionSession).toHaveBeenCalledTimes(1);
    expect(mockRetrieveFromObjectionSession).toThrow(Error("No Objection Session found in Session"));
  });

});