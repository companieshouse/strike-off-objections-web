jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");

import "../mocks/multipart.middleware";
import { sessionMock } from "../mocks/session.middleware";
import "../mocks/csrf.middleware";

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../src/middleware/objection.session.middleware";
import { OBJECTIONS_DOCUMENT_UPLOAD, OBJECTIONS_REMOVE_DOCUMENT } from "../../src/model/page.urls";
import { deleteAttachment, getAttachment } from "../../src/services/objection.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const REMOVE_DOCUMENT_FORM_FIELD = "removeDocument";
const ATTACHMENT_ID_FORM_FIELD = "attachmentId";
const QUERY_ID = "?documentID=attachment1";
const ATTACHMENT_ID = "sghsaghj-3623-khh";
const TEXT_FILE_NAME = "text.txt";
const SELECT_TO_REMOVE = "You must tell us if you want to remove the document";

const dummyAttachment = {
  id: ATTACHMENT_ID,
  name: TEXT_FILE_NAME,
};

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
const mockDeleteAttachment = deleteAttachment as jest.Mock;

describe("remove document url tests", () => {

  beforeEach(() => {
    mockGetAttachment.mockReset().mockImplementation(() => dummyAttachment);
    mockDeleteAttachment.mockReset();
  });

  it ("should find remove document page", async () => {
    const res = await request(app)
      .get(OBJECTIONS_REMOVE_DOCUMENT + QUERY_ID)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(res.status).toEqual(200);
  });

  it ("should return 404 if remove document page with put", async () => {
    const res = await request(app)
      .put(OBJECTIONS_REMOVE_DOCUMENT + QUERY_ID)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(res.status).toEqual(404);
  });

  it ("should return error page when no attachment is found", async () => {
    mockGetAttachment.mockResolvedValueOnce(null);
    const res = await request(app)
      .get(OBJECTIONS_REMOVE_DOCUMENT + QUERY_ID)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(res.status).toEqual(500);
    expect(res.text).toContain("Sorry, there is a problem with the service");
  });

  it ("should return error page when api call throws error", async () => {
    mockGetAttachment.mockRejectedValueOnce(new Error("oh no"));
    const res = await request(app)
      .get(OBJECTIONS_REMOVE_DOCUMENT + QUERY_ID)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(res.status).toEqual(500);
    expect(res.text).toContain("Sorry, there is a problem with the service");
  });

  it ("should return error page when api call throws error without rejecting promise", async () => {
    mockGetAttachment.mockImplementationOnce(() => {
      throw new Error("Test error");
    });
    const res = await request(app)
      .get(OBJECTIONS_REMOVE_DOCUMENT + QUERY_ID)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(res.status).toEqual(500);
    expect(res.text).toContain("Sorry, there is a problem with the service");
  });

  it("should redirect to document upload page if No submitted", async () => {
    const res = await request(app)
      .post(OBJECTIONS_REMOVE_DOCUMENT)
      .send({ [REMOVE_DOCUMENT_FORM_FIELD]: "no" })
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockDeleteAttachment).toBeCalledTimes(0);
    expect(res.status).toEqual(302);
    expect(res.header.location).toEqual(OBJECTIONS_DOCUMENT_UPLOAD);
  });

  it("should redirect to document upload page and call objections service if Yes submitted", async () => {
    const res = await  request(app)
      .post(OBJECTIONS_REMOVE_DOCUMENT)
      .send({
        [REMOVE_DOCUMENT_FORM_FIELD]: "yes",
        [ATTACHMENT_ID_FORM_FIELD]: ATTACHMENT_ID,
      },
      )
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockDeleteAttachment).toBeCalledWith(sessionMock.session, ATTACHMENT_ID);
    expect(res.status).toEqual(302);
    expect(res.header.location).toEqual(OBJECTIONS_DOCUMENT_UPLOAD);
  });

  it("should cause error when no option is submitted", async () => {
    const res = await  request(app)
      .post(OBJECTIONS_REMOVE_DOCUMENT)
      .send({
        [REMOVE_DOCUMENT_FORM_FIELD]: null,
        [ATTACHMENT_ID_FORM_FIELD]: ATTACHMENT_ID })
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockDeleteAttachment).not.toBeCalled();
    expect(res.status).toEqual(200);
    expect(res.text).toContain("There is a problem");
    expect(res.text).toContain(SELECT_TO_REMOVE);
    expect(res.text).toContain("Error:");
  });
});
