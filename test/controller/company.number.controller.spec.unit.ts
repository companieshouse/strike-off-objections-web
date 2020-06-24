jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/company.profile.service");

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import { COMPANY_NUMBER, OBJECTIONS_COMPANY_NUMBER, OBJECTIONS_CONFIRM_COMPANY } from "../../src/model/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("company number lookup tests", () => {

    const mockCompanyProfile = getCompanyProfile as jest.Mock;

    beforeEach(() => {
        mockCompanyProfile.mockReset();
    });

    it("should return the error page when company search fails", async () => {
        mockCompanyProfile.mockImplementation(() => {
            throw {
                message: "Unexpected error",
                status: 500,
            };
        });

        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "00012345"});

        expect(response.status).toEqual(500);
        expect(response).not.toBeUndefined();
    });

    it("should redirect to the check company details screen when company is found", async () => {
        mockCompanyProfile.mockResolvedValueOnce(getDummyCompanyProfile);

        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: COMPANY_NUMBER});

        expect(response.header.location).toEqual(OBJECTIONS_CONFIRM_COMPANY);
        expect(response.status).toEqual(302);
        expect(mockCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER, ACCESS_TOKEN);
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
