import { OBJECTIONS_CONFIRM_COMPANY, OBJECTIONS_DOCUMENT_UPLOAD } from "../../src/model/page.urls";

jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");

import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import objectionSessionMiddleware from "../../src/middleware/objection.session.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import * as pageURLs from "../../src/model/page.urls";
import { getAttachment } from "../../src/services/objection.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const REMOVE_DOCUMENT_FORM_FIELD: string = "removeDocument";
const QUERY_ID: string = "?documentID=attachment1";
const ATTACHMENT_ID = "sghsaghj-3623-khh";
const TEXT_FILE_NAME = "text.txt";
const dummySession: Session = {
  data: {},
} as Session;

const dummyAttachment = {
   id: ATTACHMENT_ID,
   name: TEXT_FILE_NAME,
 };

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = dummySession;
  return next();
});

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    req.session.data[OBJECTIONS_SESSION_NAME] = { };
    return next();
  }
});

const mockGetAttachment = getAttachment as jest.Mock;

describe("remove document url tests", () => {

  beforeEach(() => {
    mockGetAttachment.mockReset().mockImplementation(() => dummyAttachment);
  });

  it ("should return 404 if remove document page with put", async () => {
    const res = await request(app)
      .put(pageURLs.OBJECTIONS_REMOVE_DOCUMENT + QUERY_ID)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(res.status).toEqual(404);
  });

  it ("should find remove document page", async () => {
    const res = await request(app)
      .get(pageURLs.OBJECTIONS_REMOVE_DOCUMENT + QUERY_ID)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(res.status).toEqual(200);
  });

  it ("should return error page when no attachment is found", async () => {
    mockGetAttachment.mockImplementationOnce(() => null);
    const res = await request(app)
      .get(pageURLs.OBJECTIONS_REMOVE_DOCUMENT + QUERY_ID)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(res.status).toEqual(500);
    expect(res.text).toContain("Sorry, there is a problem with the service");
  });

  it ("should return error page when api call throws error", async () => {
    mockGetAttachment.mockRejectedValueOnce(new Error("oh no"));
    const res = await request(app)
      .get(pageURLs.OBJECTIONS_REMOVE_DOCUMENT + QUERY_ID)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(res.status).toEqual(500);
    expect(res.text).toContain("Sorry, there is a problem with the service");
  });

  it("should redirect to document upload page if No submitted", async () => {
    const res = await request(app)
      .post(pageURLs.OBJECTIONS_REMOVE_DOCUMENT)
      .set(REMOVE_DOCUMENT_FORM_FIELD, "no")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(302);
    expect(res.header.location).toEqual(OBJECTIONS_DOCUMENT_UPLOAD);
  });
});
