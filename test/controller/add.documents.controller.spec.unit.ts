jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objections.session.service");
jest.mock("../../src/services/objections.service");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import { OBJECTIONS_ENTER_INFORMATION } from "../../src/model/page.urls";
import { updateObjectionReason } from "../../src/services/objections.service";
import { getValueFromObjectionsSession } from "../../src/services/objections.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const COMPANY_NUMBER: string = "00006400";
const OBJECTION_ID: string = "123456";
const REASON = "Owed Money";

const SESSION: Session = {
        data: {},
    } as Session;

const mockGetObjectionSessionValue = getValueFromObjectionsSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    req.session = SESSION;
    return next();
});

const mockUpdateObjectionReason = updateObjectionReason as jest.Mock;

describe("add document tests", () => {

    it("should call the API to update the objection with the reason", async () => {

        mockGetObjectionSessionValue.mockReset();
        mockGetObjectionSessionValue.mockImplementationOnce(() => dummyCompanyProfile)
            .mockImplementationOnce(() => OBJECTION_ID);

        mockUpdateObjectionReason.mockReset();

        const response = await request(app).post(OBJECTIONS_ENTER_INFORMATION)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ information: REASON });

        expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(2);

        expect(mockUpdateObjectionReason).toHaveBeenCalledWith(COMPANY_NUMBER, OBJECTION_ID, undefined, REASON);

        expect(response.status).toEqual(200);

        // TODO Update expected screen text when user is redirected to the add documents page
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
