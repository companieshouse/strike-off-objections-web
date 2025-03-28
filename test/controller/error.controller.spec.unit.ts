jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/objection.session.middleware");

import { setSessionMiddlewareNextBehavior } from "../mocks/session.middleware";
import "../mocks/csrf.middleware";

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { ErrorMessages } from "../../src/model/error.messages";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { OBJECTIONS_COMPANY_NUMBER, STRIKE_OFF_OBJECTIONS } from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/utils/properties";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const DODGY_URL = STRIKE_OFF_OBJECTIONS  + "/company-numberhh";
const ERROR_500 = "Sorry, there is a problem with the service";

describe("error controller", () => {

  it("should render the 404 template if a page is not found", async () => {
    setSessionMiddlewareNextBehavior((req, res, next) => next());
    mockObjectionSessionMiddleware.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
      if (req.session) {
        req.session.data[OBJECTIONS_SESSION_NAME] = {};
        return next();
      }

      return next(new Error("No session on request"));
    });

    const resp = await request(app)
      .get(DODGY_URL)
      .set("referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(resp.status).toEqual(404);
    expect(resp.text).toContain(ErrorMessages.ERROR_404);
  });

  it("should render the error template", async () => {
    setSessionMiddlewareNextBehavior((req, res, next) => next(new Error("Error")));
    const response = await request(app)
      .get(OBJECTIONS_COMPANY_NUMBER)
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(500);
    expect(response.text).toContain(ERROR_500);
  });
});
