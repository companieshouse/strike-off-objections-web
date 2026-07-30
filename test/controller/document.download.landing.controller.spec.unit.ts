jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/middleware/objection.session.middleware");

import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
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

const VALID_COMPANY_ID = "12345678";
const VALID_REQUEST_ID = "OBJ-1F3C-A2E4-5D6B";
const VALID_ATTACHMENT_ID = "550e8400-e29b-41d4-a716-446655440000";

const DOWNLOAD_LANDING_PAGE_URL = `/strike-off-objections/download/company/${VALID_COMPANY_ID}/strike-off-objections/${VALID_REQUEST_ID}/attachments/${VALID_ATTACHMENT_ID}/download`;
const DOWNLOAD_FILE_URL = `/strike-off-objections/company/${VALID_COMPANY_ID}/strike-off-objections/${VALID_REQUEST_ID}/attachments/${VALID_ATTACHMENT_ID}/download`;

const landingUrl = (companyId: string, requestId: string, attachmentId: string) =>
  `/strike-off-objections/download/company/${companyId}/strike-off-objections/${requestId}/attachments/${attachmentId}/download`;

describe("document download landing page tests", () => {

  beforeEach(() => {
    mockObjectionSessionMiddleware.mockClear();
  });

  it("should show landing page", async () => {
    const response: request.Response = await request(app).get(DOWNLOAD_LANDING_PAGE_URL)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toBe(200);
    expect(response.text).toContain("Document download");
  });

  it("should not call objection session middleware upon render", async () => {
    const response: request.Response = await request(app).get(DOWNLOAD_LANDING_PAGE_URL)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toBe(200);
    expect(mockObjectionSessionMiddleware).not.toBeCalled();
  });

  it("should have a download link on the page", async () => {
    const response: request.Response = await request(app).get(DOWNLOAD_LANDING_PAGE_URL)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.text).toContain("<a href=\"" + DOWNLOAD_FILE_URL + "\"");
    expect(response.text).not.toContain("download=\"");
  });

  it("should reject unsafe path segments", async () => {
    const maliciousUrl = "/strike-off-objections/download/company/CO/strike-off-objections/TESTREQ';confirm(1);a='/attachments/TESTATT/download";
    const response: request.Response = await request(app).get(maliciousUrl)
      .set("Referer", "/")
      .set("Cookie", [COOKIE_NAME + "=123"]);

    expect(response.status).toBe(400);
    expect(response.text).toContain("Sorry, there is a problem with the service");
  });
});

describe("document download landing page — path parameter length validation", () => {

  const cookie = [`${COOKIE_NAME}=123`];

  it.each([
    ["companyId too short",    "1234567",                           VALID_REQUEST_ID,    VALID_ATTACHMENT_ID],
    ["companyId too long",     "123456789",                         VALID_REQUEST_ID,    VALID_ATTACHMENT_ID],
    ["requestId too short",    VALID_COMPANY_ID, "ABC12345678",                          VALID_ATTACHMENT_ID],
    ["requestId too long",     VALID_COMPANY_ID, "ABC1234567890",                        VALID_ATTACHMENT_ID],
    ["attachmentId too short", VALID_COMPANY_ID, VALID_REQUEST_ID, "550e8400-e29b-41d4-a716-44665544000"],
    ["attachmentId too long",  VALID_COMPANY_ID, VALID_REQUEST_ID, "550e8400-e29b-41d4-a716-4466554400000"],
  ])("should return 400 when %s", async (_label: string, companyId: string, requestId: string, attachmentId: string) => {
    const response = await request(app)
      .get(landingUrl(companyId, requestId, attachmentId))
      .set("Referer", "/")
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
  });

  it("should return 200 for all params at exact valid lengths", async () => {
    const response = await request(app)
      .get(DOWNLOAD_LANDING_PAGE_URL)
      .set("Referer", "/")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
  });
});
