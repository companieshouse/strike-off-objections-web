import { ObjectionCompanyProfile } from "../../src/model/objection.company.profile";

jest.mock("../../src/middleware/session.middleware");

import * as request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_CONFIRM_COMPANY } from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/utils/properties";
import sessionMiddleware from "../../src/middleware/session.middleware";
import { NextFunction, Request, Response } from "express";

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("check company tests", () => {

    it("should render the page with company data from the session", async () => {

        mockSessionMiddleware.mockReset();
        mockSessionMiddleware.mockImplementation(() => getDummyCompanyProfile);

        const response = await request(app).get(OBJECTIONS_CONFIRM_COMPANY)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(response.status).toEqual(200);

        expect(response.text).toContain("THE GIRLS DAY SCHOOL TRUST");
        expect(response.text).toContain("00006400");
        expect(response.text).toContain("Active");
        expect(response.text).toContain("23 September 1973");
        expect(response.text).toContain("Limited");
        expect(response.text).toContain("123");
        expect(response.text).toContain("street");
        expect(response.text).toContain("CF1 123");
        expect(response.text).toContain("2019-05-12");
        expect(response.text).toContain("Your accounts are overdue");
        expect(response.text).toContain("2019-09-03");
        expect(response.text).toContain("Your confirmation statement is overdue");
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
