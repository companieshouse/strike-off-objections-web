import request from "supertest";
import app from "../../src/app";

describe("Sign in middleware tests", () => {

  it("should redirect to sign in page with no cookie", async () => {

    const response = await request(app)
      .get("/strike-off-objections/company_number");

    expect(response.status).toEqual(302);
  });

  it("should not redirect to sign in page with cookie", async () => {
    const response = await request(app)
      .get("/strike-off-objections/company_number");

    expect(response.status).toEqual(200);
  });

});
