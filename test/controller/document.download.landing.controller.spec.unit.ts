jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/middleware/objection.session.middleware");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import objectionSessionMiddleware from "../../src/middleware/objection.session.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = {
    data: {},
  } as Session;
  return next();
});

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;

const DOWNLOAD_LANDING_PAGE_URL: string = "/strike-off-objections/download/company/1234/strike-off-objections/5678/attachments/8888/download";
const DOWNLOAD_FILE_URL: string = "/strike-off-objections/company/1234/strike-off-objections/5678/attachments/8888/download";

describe("document download attachment landing page tests", () => {

  beforeEach(() => {
    mockObjectionSessionMiddleware.mockClear();
  });

  it("should show landing page", async () => {
    const response: request.Response = await request(app).get(DOWNLOAD_LANDING_PAGE_URL)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toBe(200);
    expect(response.text).toContain("Your document download will start soon");
  });

  it("should not call objection session middleware upon render", async () => {
    const response: request.Response = await request(app).get(DOWNLOAD_LANDING_PAGE_URL)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toBe(200);
    expect(mockObjectionSessionMiddleware).not.toBeCalled();
  });

  it("should have an auto download set in the html", async () => {
    const response: request.Response = await request(app).get(DOWNLOAD_LANDING_PAGE_URL)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.text).toContain("<meta http-equiv=\"refresh\" content=\"5;URL='" + DOWNLOAD_FILE_URL + "'\"/>");
  });

  it("should have a download link on the page", async () => {
    const response: request.Response = await request(app).get(DOWNLOAD_LANDING_PAGE_URL)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.text).toContain("<a href=\"" + DOWNLOAD_FILE_URL + "\"");
    expect(response.text).not.toContain("download=\"");
  });
});
