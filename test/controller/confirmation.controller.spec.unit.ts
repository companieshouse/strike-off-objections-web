jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/middleware/objection.session.middleware");

import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import objectionSessionMiddleware from "../../src/middleware/objection.session.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import { OBJECTIONS_CONFIRMATION } from "../../src/model/page.urls";
import {
    retrieveFromObjectionSession,
    retrieveUserProfileFromSession,
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockRetrieveUserProfileFromSession = retrieveUserProfileFromSession  as jest.Mock;
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

const dummyUserProfile = {
  email: "mttest@test.co.uk",
};
const OBJECTION_ID: string = "a1b2c3";

describe("confirmation screen tests", () => {
   it("should land on confirmation screen with submitted message and correct details", async () => {

       mockRetrieveUserProfileFromSession.mockReset();
       mockRetrieveUserProfileFromSession.mockResolvedValue(dummyUserProfile);
       mockRetrieveFromObjectionSession.mockReset();
       mockRetrieveFromObjectionSession.mockResolvedValue(OBJECTION_ID);

       const response = await request(app).get(OBJECTIONS_CONFIRMATION)
           .set("Referer", "/")
           .set("Cookie", [`${COOKIE_NAME}=123`]);

       expect(response.status).toEqual(200);
       expect(response.text).toContain(OBJECTION_ID);
       expect(response.text).toContain("mttest@test.co.uk");
   });
});
