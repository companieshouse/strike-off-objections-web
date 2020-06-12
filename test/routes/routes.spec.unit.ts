import * as request from "supertest";
import app from "../../src/app";

describe("Basic URL Tests", () => {

  it("should find the company number page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/company-number");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/What is the company number/);
  });
});
