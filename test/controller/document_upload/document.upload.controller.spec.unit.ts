jest.mock("ioredis");
jest.mock("../../../src/middleware/authentication.middleware");
jest.mock("../../../src/middleware/session.middleware");
jest.mock("../../../src/middleware/objection.session.middleware");
jest.mock("../../../src/services/objection.session.service");
jest.mock("../../../src/services/objection.service");

import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../../src/constants";
import { authenticationMiddleware } from "../../../src/middleware/authentication.middleware";
import { objectionSessionMiddleware } from "../../../src/middleware/objection.session.middleware";
import { sessionMiddleware } from "../../../src/middleware/session.middleware";
import { UploadErrorMessages } from "../../../src/model/error.messages";
import * as pageURLs from "../../../src/model/page.urls";
import {
  OBJECTIONS_CHECK_YOUR_ANSWERS,
  OBJECTIONS_DOCUMENT_UPLOAD,
  OBJECTIONS_DOCUMENT_UPLOAD_CONTINUE,
} from "../../../src/model/page.urls";
import { addAttachment, getAttachments } from "../../../src/services/objection.service";
import { COOKIE_NAME } from "../../../src/utils/properties";

/* Constants */

const EXPECTED_MAX_FILE_SIZE_MESSAGE = "File size must be smaller than 0 MB";
const SORRY_ERROR_MESSAGE = "Sorry, there is a problem with the service";
const ATTACHMENT_ID = "sghsaghj-3623-khh";
const TEXT_FILE_NAME = "text.txt";
const TEXT_FILE_LARGE_NAME = "text_large.txt";
const DIV_ID_FILE_LIST = "fileListDiv";
const DIV_ID_FILE_UPLOAD = "fileUploadDiv";
const DIV_ID_ERROR_SUMMARY = "errorSummaryDiv";
const CLASS_UPLOAD_LIST = "govuk-upload-list";
const CLASS_FILE_UPLOAD = "govuk-file-upload";
const CLASS_ERROR_SUMMARY = "govuk-error-summary";
const CLASS_ERROR_MESSAGE = "govuk-error-message";
const INVALID_MIME_TYPE = "The selected file must be a JPG, JPEG, ZIP, GIF, PNG, PDF, DOCX or XLSX";

/* Dummy Objects */

const dummySession: Session = {
  data: {},
} as Session;

const fileData = {"encoding": "7bit", "filename": "text.txt", "mimeType": "text/plain"};

const dummyAttachments = [
  {
    id: ATTACHMENT_ID,
    name: TEXT_FILE_NAME,
  },
];

/* Mocks */

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

const mockAddAttachment = addAttachment as jest.Mock;

const mockGetAttachments = getAttachments as jest.Mock;

/* Tests */

describe ("document.document_upload.controller tests", () => {
  beforeEach(() => {
    mockAddAttachment.mockClear();
    mockGetAttachments.mockReset().mockImplementation(() => dummyAttachments);
  });

  it ("should redirect to error page when error is thrown getting attachments on page load", async () => {
    mockGetAttachments.mockImplementationOnce(() => { throw new Error(); });

    const res = await request(app)
      .get(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetAttachments).toHaveBeenCalledTimes(1);
    expect(res.status).toEqual(500);
    expect(res.text).toContain(SORRY_ERROR_MESSAGE);
  });

  it ("should redirect to next page when continue is clicked and files have been added", async () => {
    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_CONTINUE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetAttachments).toHaveBeenCalledTimes(1);
    expect(res.status).toEqual(302);
    expect(res.header.location).toEqual(OBJECTIONS_CHECK_YOUR_ANSWERS);
  });

  it ("should show error message if continue pressed with no docs added - NOT AJAX", async () => {
    mockGetAttachments.mockImplementationOnce(() => []);
    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_CONTINUE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(res.status).toEqual(200);
    expect(res.text).toContain("govuk-error-summary");
    expect(res.text).toContain(UploadErrorMessages.NO_DOCUMENTS_ADDED);
  });

  it ("should show error message if continue pressed with no docs added - AJAX", async () => {
    mockGetAttachments.mockImplementationOnce(() => []);
    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_CONTINUE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .set("X-Requested-With", "XMLHttpRequest");

    expect(res.status).toEqual(200);
    expect(res.text).toContain("govuk-error-summary");
    expect(res.text).toContain(UploadErrorMessages.NO_DOCUMENTS_ADDED);
  });

  it ("should render error message when file is too big - NOT AJAX", async () => {
    // See global.setup.ts for unit test file size limit
    const largeBuffer = Buffer.alloc(50000);

    const response = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", largeBuffer, TEXT_FILE_LARGE_NAME);

    expect(response.text).toContain(EXPECTED_MAX_FILE_SIZE_MESSAGE);
  });

  it ("should render error message when file is too big - AJAX", async () => {
    // See global.setup.ts for unit test file size limit
    const largeBuffer = Buffer.alloc(50000);

    const response = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .set("X-Requested-With", "XMLHttpRequest")
      .attach("file-upload", largeBuffer, TEXT_FILE_LARGE_NAME);

    const responseObj = JSON.parse(response.text);
    expect(responseObj.divs.length).toEqual(2);
    expect(responseObj.divs[0].divId).toContain(DIV_ID_ERROR_SUMMARY);
    expect(responseObj.divs[1].divId).toContain(DIV_ID_FILE_UPLOAD);

    expect(responseObj.divs[0].divHtml).toContain(CLASS_ERROR_SUMMARY);
    expect(responseObj.divs[0].divHtml).toContain(EXPECTED_MAX_FILE_SIZE_MESSAGE);

    expect(responseObj.divs[1].divHtml).toContain(CLASS_FILE_UPLOAD);
    expect(responseObj.divs[1].divHtml).toContain(EXPECTED_MAX_FILE_SIZE_MESSAGE);
    expect(responseObj.divs[1].divHtml).toContain(CLASS_ERROR_MESSAGE);
  });

  it ("should render error message when file is empty - NOT AJAX", async () => {
    // See global.setup.ts for unit test file size limit
    const emptyBuffer = Buffer.alloc(0);

    const response = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", emptyBuffer, TEXT_FILE_NAME);

    expect(response.text).toContain(UploadErrorMessages.NO_FILE_CHOSEN);
  });

  it ("should render error message when file is empty - AJAX", async () => {
    // See global.setup.ts for unit test file size limit
    const emptyBuffer = Buffer.alloc(0);

    const response = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .set("X-Requested-With", "XMLHttpRequest")
      .attach("file-upload", emptyBuffer, TEXT_FILE_NAME);

    const responseObj = JSON.parse(response.text);
    expect(responseObj.divs.length).toEqual(2);
    expect(responseObj.divs[0].divId).toContain(DIV_ID_ERROR_SUMMARY);
    expect(responseObj.divs[1].divId).toContain(DIV_ID_FILE_UPLOAD);

    expect(responseObj.divs[0].divHtml).toContain(CLASS_ERROR_SUMMARY);
    expect(responseObj.divs[0].divHtml).toContain(UploadErrorMessages.NO_FILE_CHOSEN);

    expect(responseObj.divs[1].divHtml).toContain(CLASS_FILE_UPLOAD);
    expect(responseObj.divs[1].divHtml).toContain(UploadErrorMessages.NO_FILE_CHOSEN);
    expect(responseObj.divs[1].divHtml).toContain(CLASS_ERROR_MESSAGE);
  });

  it ("should return error screen if something goes wrong sending file to api - NOT AJAX", async () => {
    mockAddAttachment.mockImplementationOnce(() => { throw new Error(); });
    const buffer = Buffer.alloc(5);

    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", buffer, TEXT_FILE_NAME);

    expect(res.status).toEqual(500);
    expect(res.text).toContain(SORRY_ERROR_MESSAGE);
    expect(mockGetAttachments).toHaveBeenCalled();
    expect(mockAddAttachment).toHaveBeenCalled();
  });

  it ("should return redirect to error screen if something goes wrong sending file to api - AJAX", async () => {
    mockAddAttachment.mockImplementationOnce(() => { throw new Error(); });
    const buffer = Buffer.alloc(5);

    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .set("X-Requested-With", "XMLHttpRequest")
      .attach("file-upload", buffer, TEXT_FILE_NAME);

    expect(res.status).toEqual(500);
    // this is sent back to the AJAX call
    expect(res.text).toEqual("{\"redirect\":\"" + pageURLs.OBJECTIONS_ERROR + "\"}");
    expect(mockGetAttachments).toHaveBeenCalled();
    expect(mockAddAttachment).toHaveBeenCalled();
  });

  it ("should show error screen if getting attachments from api " +
        "on submitting file throws error - NOT AJAX", async () => {
    mockGetAttachments.mockImplementationOnce(() => { throw new Error(); });
    const buffer = Buffer.alloc(5);

    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", buffer, TEXT_FILE_NAME);

    expect(res.status).toEqual(500);
    expect(res.text).toContain(SORRY_ERROR_MESSAGE);
    expect(mockGetAttachments).toHaveBeenCalled();
    expect(mockAddAttachment).not.toHaveBeenCalled();
  });

  it ("should return redirect to error screen if getting attachments from api " +
  "on submitting file throws error - AJAX", async () => {
    mockGetAttachments.mockImplementationOnce(() => { throw new Error(); });
    const buffer = Buffer.alloc(5);

    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .set("X-Requested-With", "XMLHttpRequest")
      .attach("file-upload", buffer, TEXT_FILE_NAME);

    expect(res.status).toEqual(500);
    // this is sent back to the AJAX call
    expect(res.text).toEqual("{\"redirect\":\"" + pageURLs.OBJECTIONS_ERROR + "\"}");
    expect(mockGetAttachments).toHaveBeenCalled();
    expect(mockAddAttachment).not.toHaveBeenCalled();
  });

  it ("should show error screen if getting attachments from api " +
        "on continue button throws error - NOT AJAX", async () => {
    mockGetAttachments.mockImplementationOnce(() => { throw new Error(); });
    const buffer = Buffer.alloc(5);

    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_CONTINUE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", buffer, TEXT_FILE_NAME);

    expect(res.status).toEqual(500);
    expect(res.text).toContain(SORRY_ERROR_MESSAGE);
    expect(mockGetAttachments).toHaveBeenCalled();
    expect(mockAddAttachment).not.toHaveBeenCalled();
  });

  it ("should return redirect to error screen if getting attachments from api " +
  "on continue button throws error - AJAX", async () => {
    mockGetAttachments.mockImplementationOnce(() => { throw new Error(); });
    const buffer = Buffer.alloc(5);

    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_CONTINUE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .set("X-Requested-With", "XMLHttpRequest")
      .attach("file-upload", buffer, TEXT_FILE_NAME);

    expect(res.status).toEqual(500);
    // this is sent back to the AJAX call
    expect(res.text).toEqual("{\"redirect\":\"" + pageURLs.OBJECTIONS_ERROR + "\"}");
    expect(mockGetAttachments).toHaveBeenCalled();
    expect(mockAddAttachment).not.toHaveBeenCalled();
  });

  it ("should redirect back to itself when file uploaded successfully - NOT AJAX", async () => {
    const buffer = Buffer.alloc(5);
    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", buffer, TEXT_FILE_NAME);

    expect(res.status).toEqual(302);
    expect(res.header.location).toEqual(OBJECTIONS_DOCUMENT_UPLOAD);
    expect(mockAddAttachment).toBeCalledWith(dummySession,
                                             buffer,
                                             fileData);
  });

  it ("should return divs html when file uploaded successfully - AJAX", async () => {
    const buffer = Buffer.alloc(5);
    mockGetAttachments.mockImplementationOnce(() => dummyAttachments);

    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .set("X-Requested-With", "XMLHttpRequest")
      .attach("file-upload", buffer, TEXT_FILE_NAME);

    expect(res.status).toEqual(200);
    const responseObj = JSON.parse(res.text);
    expect(responseObj.divs.length).toEqual(2);

    expect(responseObj.divs[0].divId).toContain(DIV_ID_FILE_LIST);
    expect(responseObj.divs[1].divId).toContain(DIV_ID_FILE_UPLOAD);

    expect(responseObj.divs[0].divHtml).toContain(CLASS_UPLOAD_LIST);
    expect(responseObj.divs[0].divHtml).toContain(TEXT_FILE_NAME);
    expect(responseObj.divs[0].divHtml).toContain("/remove-document/" + ATTACHMENT_ID);

    expect(responseObj.divs[1].divHtml).toContain(CLASS_FILE_UPLOAD);
    expect(responseObj.divs[1].divHtml).toContain("Upload another document");

    expect(mockAddAttachment).toBeCalledWith(dummySession,
                                             buffer,
                                             fileData);
  });

  it ("should render error message on 415 error", async (done) => {
    const buffer = Buffer.alloc(5);
    mockAddAttachment.prototype.constructor.mockImplementationOnce(() => {
      throw {
        data: ["error"],
        message: "error",
        status: 415,
      };
    });

    const response = await request(app)
      .post(pageURLs.OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", buffer, TEXT_FILE_NAME);
    expect(response.status).toEqual(200);
    expect(response).not.toBeUndefined();
    expect(response.text).toContain(INVALID_MIME_TYPE);
    expect(mockAddAttachment).toHaveBeenCalled();
    done();
  });

  it ("AJAX - should render error message on 415 error", async (done) => {
    const buffer = Buffer.alloc(5);
    mockAddAttachment.prototype.constructor.mockImplementationOnce(() => {
      throw {
        data: ["error"],
        message: "error",
        status: 415,
      };
    });

    const response = await request(app)
      .post(pageURLs.OBJECTIONS_DOCUMENT_UPLOAD)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .set("X-Requested-With", "XMLHttpRequest")
      .attach("file-upload", buffer, TEXT_FILE_NAME);
    expect(response.status).toEqual(200);
    expect(response).not.toBeUndefined();

    const responseObj = JSON.parse(response.text);
    expect(responseObj.divs.length).toEqual(2);

    expect(responseObj.divs[0].divId).toContain("errorSummaryDiv");
    expect(responseObj.divs[1].divId).toContain("fileUploadDiv");

    expect(responseObj.divs[0].divHtml).toContain("govuk-error-summary");
    expect(responseObj.divs[0].divHtml).toContain(INVALID_MIME_TYPE);

    expect(responseObj.divs[1].divHtml).toContain("govuk-file-upload");
    expect(responseObj.divs[1].divHtml).toContain(INVALID_MIME_TYPE);

    expect(response.text).toContain(INVALID_MIME_TYPE);
    expect(mockAddAttachment).toHaveBeenCalled();
    done();
  });

  it("should have correct form action fields on document upload page", async () => {
    const response = await request(app)
      .get("/strike-off-objections/document-upload");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Upload documents to support your objection/);
    expect(response.text).toContain("<form method=\"post\" action=\"document-upload\" enctype=\"multipart/form-data\" id=\"file-upload-form\">");
    expect(response.text).toContain("<form method=\"post\" action=\"document-upload-continue\" id=\"continue\">");
  });
});
