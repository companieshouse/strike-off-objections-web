jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objections.session.service");

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import { ObjectionCompanyProfile } from "../../src/model/objection.company.profile";
import { OBJECTIONS_CONFIRM_COMPANY } from "../../src/model/page.urls";
import { getValueFromObjectionsSession } from "../../src/services/objections.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockGetObjectionSessionValue = getValueFromObjectionsSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("check company tests", () => {

    it("should render the page with company data from the session", async () => {

        mockGetObjectionSessionValue.mockReset();
        mockGetObjectionSessionValue.mockImplementation(() => getDummyCompanyProfile);

        const response = await request(app).get(OBJECTIONS_CONFIRM_COMPANY)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
        expect(response.status).toEqual(200);

        expect(response.text).toContain("THE GIRLS DAY SCHOOL TRUST");
        expect(response.text).toContain("00006400");
        expect(response.text).toContain("Active");
        expect(response.text).toContain("26 June 1872");
        expect(response.text).toContain("limited");
        expect(response.text).toContain("line1");
        expect(response.text).toContain("line2");
        expect(response.text).toContain("post code");
    });
});

export const getDummyCompanyProfile = (): ObjectionCompanyProfile => {
    return {
        address: {
            line_1: "line1",
            line_2: "line2",
            postCode: "post code",
        },
        companyName: "Girl's school trust",
        companyNumber: "00006400",
        companyStatus: "Active",
        companyType: "limited",
        incorporationDate: "26 June 1872",
    };
};
