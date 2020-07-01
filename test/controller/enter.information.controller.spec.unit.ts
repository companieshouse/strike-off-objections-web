jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objections.session.service");
jest.mock("../../src/services/objections.api.service");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { SESSION_OBJECTION_ID } from "../../src/constants";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import { OBJECTIONS_ENTER_INFORMATION } from "../../src/model/page.urls";
import { createNewObjection } from "../../src/services/objections.api.service";
import { addToObjectionsSession, getValueFromObjectionsSession } from "../../src/services/objections.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const COMPANY_NUMBER: string = "00006400";
const OBJECTION_ID: string = "123456";

const SESSION: Session = {
        data: {},
    } as Session;

const mockGetObjectionSessionValue = getValueFromObjectionsSession as jest.Mock;
const mockSetObjectionSessionValue = addToObjectionsSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    req.session = SESSION;
    return next();
});

const mockCreateNewObjection = createNewObjection as jest.Mock;

describe("enter information tests", () => {

    it("should call the API to create a new objection and then render the page", async () => {

        mockGetObjectionSessionValue.mockReset();
        mockGetObjectionSessionValue.mockImplementation(() => dummyCompanyProfile);

        mockSetObjectionSessionValue.mockReset();

        mockCreateNewObjection.mockReset();
        mockCreateNewObjection.mockImplementation(() => OBJECTION_ID);

        const response = await request(app).get(OBJECTIONS_ENTER_INFORMATION)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);

        expect(mockSetObjectionSessionValue).toHaveBeenCalledWith(SESSION, SESSION_OBJECTION_ID, OBJECTION_ID);

        expect(mockCreateNewObjection).toHaveBeenCalledWith(COMPANY_NUMBER, undefined);

        expect(response.status).toEqual(200);
        expect(response.text).toContain("Tell us why");
    });
});

const dummyCompanyProfile: ObjectionCompanyProfile = {
    address: {
        line_1: "line1",
        line_2: "line2",
        postCode: "post code",
    },
    companyName: "Girls school trust",
    companyNumber: COMPANY_NUMBER,
    companyStatus: "Active",
    companyType: "limited",
    incorporationDate: "26 June 1872",
};
