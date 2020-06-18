import request from "supertest";
import app from "../../src/app";
import { COOKIE_NAME } from "../../src/properties";

describe("Basic URL Tests", () => {

  it("should find start page with cookie", async () => {
    const response = await request(app)
        .get("/strike-off-objections")
        .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Use this service to tell us why a limited company should not be removed from the companies register./);
  });

  it("should find start page without cookie", async () => {
    const response = await request(app)
        .get("/strike-off-objections");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Use this service to tell us why a limited company should not be removed from the companies register./);
  });

  it("should find the company number page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/company-number");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/What is the company number/);
  });
});
