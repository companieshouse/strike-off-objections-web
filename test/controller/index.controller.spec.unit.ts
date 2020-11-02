jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/modules/sdk/objections");

import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import ObjectionSessionExtraData from "../../src/model/objection.session.extra.data";

import { COOKIE_NAME } from "../../src/utils/properties";

const testEmail = "testEmail";
const extraData: ObjectionSessionExtraData = { objection_id: "id" };

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  const session: Session = new Session();
  session.data = {
    signin_info: {
      user_profile: {
        email: testEmail,
      },
    },
  };
  req.session = session;
  return next();
});

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    // req.session.data[OBJECTIONS_SESSION_NAME] = {};
    req.session.data[OBJECTIONS_SESSION_NAME] = { "objection_create": {
      "full_name": "Joe Bloggs",
      "share_identity": true,
    }
    };
    //  req.session.setExtraData(OBJECTIONS_SESSION_NAME, extraData);
    return next();
  }

  return next(new Error("No session on request"));
});

describe("Index page post tests", () => {
  it("should post index page and wipe session data", async () => {
    const response = await request(app)
      .post("/strike-off-objections")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(302);
    expect(response.text).toMatch(/What is your full name or the name of your organisation?/);
    expect(response.text).not.toContain("Joe Bloggs");
  });
});
