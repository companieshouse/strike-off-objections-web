jest.mock("ioredis");
jest.mock("../../src/middleware/session.middleware");

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import sessionMiddleware from "../../src/middleware/session.middleware";
import { OBJECTIONS_COMPANY_NUMBER } from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  return next(new Error("Error"));
});

const ERROR_500 = "Sorry, there is a problem with the service";

describe("error controller", () => {

  it("should render the error template", async () => {
    const response = await request(app)
      .get(OBJECTIONS_COMPANY_NUMBER)
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(response.text).toContain(ERROR_500);
  });
});
