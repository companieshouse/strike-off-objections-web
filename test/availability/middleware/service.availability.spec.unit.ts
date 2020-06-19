import request from "supertest";
import app from "../../../src/app";
import { COOKIE_NAME } from "../../../src/properties";

afterAll(() => {
    process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";
});

describe("Availability tests", () => {

    it("should show the service offline page when offline flag is true", async () => {
        process.env.SHOW_SERVICE_OFFLINE_PAGE = "true";

        const response = await request(app)
            .get("/strike-off-objections");
        expect(response.text).toMatch(/Sorry, the service is unavailable/);
    });

    it("should not show the service offline page when offline flag is false", async () => {
        process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";

        const response = await request(app)
            .get("/strike-off-objections");
        expect(response.text).not.toMatch(/Sorry, the service is unavailable/);
        expect(response.text).toMatch(/Use this service to tell us why a limited company should not be removed from the companies register./);
    });

    it("should show the service offline page when offline flag is true, cookie present", async () => {
        process.env.SHOW_SERVICE_OFFLINE_PAGE = "true";

        const response = await request(app)
            .get("/strike-off-objections")
            .set("Cookie", [`${COOKIE_NAME}=123`]);
        expect(response.text).toMatch(/Sorry, the service is unavailable/);
    });

    it("should show the service offline page with slash", async () => {
        process.env.SHOW_SERVICE_OFFLINE_PAGE = "true";

        const response = await request(app)
            .get("/strike-off-objections/");
        expect(response.text).toMatch(/Sorry, the service is unavailable/);
    });

    it("should not show the service offline page when offline flag is false, cookie present", async () => {
        process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";

        const response = await request(app)
            .get("/strike-off-objections")
            .set("Cookie", [`${COOKIE_NAME}=123`]);
        expect(response.text).not.toMatch(/Sorry, the service is unavailable/);
        expect(response.text).toMatch(/Use this service to tell us why a limited company should not be removed from the companies register./);
    });

    it("should show the service offline page for non start page", async () => {
        process.env.SHOW_SERVICE_OFFLINE_PAGE = "true";

        const response = await request(app)
            .get("/strike-off-objections/company-number");
        expect(response.text).toMatch(/Sorry, the service is unavailable/);
    });

});
