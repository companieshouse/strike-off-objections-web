jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/company.profile.service");

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import {
    COMPANY_NOT_FOUND,
    COMPANY_NUMBER_TOO_LONG,
    INVALID_COMPANY_NUMBER,
    NO_COMPANY_NUMBER_SUPPLIED } from "../../src/model/error.messages";
import { ObjectionCompanyProfile } from "../../src/model/objection.company.profile";
import { COMPANY_NUMBER, OBJECTIONS_COMPANY_NUMBER, OBJECTIONS_CONFIRM_COMPANY } from "../../src/model/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("company number validation tests", () => {

    const mockCompanyProfile = (getCompanyProfile as jest.Mock);

    beforeEach(() => {
        mockCompanyProfile.mockReset();
    });

    it("should not throw invalid error for company with two letter prefix", async () => {
        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "AB012345"});

        expect(response.status).toEqual(302);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should not throw invalid error for company with one letter prefix", async () => {
        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "A0123456"});

        expect(response.status).toEqual(302);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when empty company number is supplied", async () => {
        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: ""});

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when blank company number is supplied", async () => {
        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "    "});

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when undefined company number is supplied", async () => {
        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: undefined});

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when company number is invalid (characters)", async () => {
        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "asdfg!!@"});

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when company number is too long", async () => {
        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "000064000"});

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when company is not found", async () => {
        mockCompanyProfile.mockImplementation(() => {
            throw {
                message: COMPANY_NOT_FOUND,
                status: 404,
            };
        });

        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "00012345"});

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
        expect(response.text).toContain(COMPANY_NOT_FOUND);
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
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
        expect(response.text).not.toContain(COMPANY_NOT_FOUND);
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

    it("should pad company details for a valid abbreviated company number", async () => {
        mockCompanyProfile.mockResolvedValueOnce(getDummyCompanyProfile);

        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "6400"});

        expect(response.header.location).toEqual(OBJECTIONS_CONFIRM_COMPANY);
        expect(response.status).toEqual(302);
        expect(mockCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER, ACCESS_TOKEN);
    });

    it("should pad company details for a valid abbreviated company number - single letter prefix", async () => {
        mockCompanyProfile.mockResolvedValueOnce(getDummyCompanyProfile);

        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "A123"});

        expect(response.header.location).toEqual(OBJECTIONS_CONFIRM_COMPANY);
        expect(response.status).toEqual(302);
        expect(mockCompanyProfile).toHaveBeenCalledWith("A0000123", ACCESS_TOKEN);
    });

    it("should pad company details for a valid abbreviated company number - double letter prefix", async () => {
        mockCompanyProfile.mockResolvedValueOnce(getDummyCompanyProfile);

        const response = await request(app)
            .post(OBJECTIONS_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "AA123"});

        expect(response.header.location).toEqual(OBJECTIONS_CONFIRM_COMPANY);
        expect(response.status).toEqual(302);
        expect(mockCompanyProfile).toHaveBeenCalledWith("AA000123", ACCESS_TOKEN);
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
