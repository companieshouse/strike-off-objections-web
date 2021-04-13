jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");

import { NextFunction, Request, Response } from "express";
import request from "supertest";

import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";

import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { COOKIE_NAME } from "../../src/utils/properties";

import { OBJECTIONS_OBJECTING_ENTITY_NAME, OBJECTIONS_OBJECTOR_ORGANISATION } from "../../src/model/page.urls";
import { ErrorMessages } from "../../src/model/error.messages";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
const mockSessionMiddleware = sessionMiddleware as jest.Mock;
const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;

mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());


describe('objector organisation controller tests', () => {
  beforeEach(() => {
    mockSessionMiddleware.mockReset();
    mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      req.session = { data: {}, } as Session;

      return next();
    });

    mockObjectionSessionMiddleware.mockReset();
    mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      if (req.session) { req.session.data[OBJECTIONS_SESSION_NAME] = {}; }

      return next();
    });
  });

  it('should render objecting entity name page when option selected', async () => {
    const response = await request(app)
      .post(OBJECTIONS_OBJECTOR_ORGANISATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({
        "objector-organisation": "client"
      });

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(OBJECTIONS_OBJECTING_ENTITY_NAME);
  });

  it("should receive error messages when no choice has been selected", async () => {
    const response = await request(app)
      .post(OBJECTIONS_OBJECTOR_ORGANISATION)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toContain(ErrorMessages.SELECT_OBJECTOR_ORGANISATION);
  });

});