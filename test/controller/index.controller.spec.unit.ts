jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/modules/sdk/objections");
jest.mock("@companieshouse/node-session-handler/lib/session/model/Session");

import { sessionMock } from "../mocks/session.middleware";
import "../mocks/csrf.middleware";

import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { OBJECTIONS_OBJECTOR_ORGANISATION } from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/utils/properties";

const testEmail = "testEmail";
const mockDeleteExtraData = Session.prototype.deleteExtraData as jest.Mock;

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    req.session.data[OBJECTIONS_SESSION_NAME] = {
      "objection_create": {
        "full_name": "Joe Bloggs",
        "share_identity": true,
      }
    };
    return next();
  }
  return next(new Error("No session on request"));
});

const SESSION: Session = {
      data: {
        signin_info: {
          user_profile: {
            email: testEmail
          },
        }
      },
      deleteExtraData: mockDeleteExtraData
    } as unknown as Session;

describe("Index page Tests", () => {
  beforeEach(() => {
    mockDeleteExtraData.mockClear();
    sessionMock.session = SESSION;
  });

  describe('GET', () => {
    it("should contain a cookie banner", async () => {
      const response = await request(app).get("/strike-off-objections");

      expect(response.status).toEqual(200);
      expect(mockDeleteExtraData).not.toHaveBeenCalled();
      expect(response.text).toContain("govuk-cookie-banner");
    });
    it("should redirect to objector-organisation page", async () => {
      const response = await request(app).get("/strike-off-objections?start=0");

      expect(response.status).toEqual(302);
      expect(mockDeleteExtraData).toHaveBeenCalledWith(OBJECTIONS_SESSION_NAME);
      expect(response.header.location).toEqual(OBJECTIONS_OBJECTOR_ORGANISATION);
    });
  });

  describe('POST', () => {
    it("should post index page and wipe session data", async () => {
      const response = await request(app)
        .post("/strike-off-objections")
        .set("Cookie", [`${COOKIE_NAME}=123`]);

      expect(response.status).toEqual(302);
      expect(mockDeleteExtraData).toHaveBeenCalledWith(OBJECTIONS_SESSION_NAME);
      expect(response.header.location).toEqual(OBJECTIONS_OBJECTOR_ORGANISATION);
    });

    it("shouldn't call deleteExtraData when posting index page with no session data", async () => {
      sessionMock.session = undefined;
      mockObjectionSessionMiddleware.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => next());

      const response = await request(app)
        .post("/strike-off-objections")
        .set("Cookie", [`${COOKIE_NAME}=123`]);

      expect(response.status).toEqual(302);
      expect(mockDeleteExtraData).not.toHaveBeenCalled();
      expect(response.header.location).toEqual(OBJECTIONS_OBJECTOR_ORGANISATION);
    });
  });
});
