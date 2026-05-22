jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.service");

import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { Readable } from "stream";
import request from "supertest";
import app from "../../src/app";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { STRIKE_OFF_OBJECTIONS } from "../../src/model/page.urls";
import {
  ApiError,
  Download,
  HEADER_CONTENT_DISPOSITION,
  HEADER_CONTENT_LENGTH,
  HEADER_CONTENT_TYPE,
  INLINE_TYPES_ALLOWED,
  CONTENT_DISPOSITION_INLINE,
} from "../../src/modules/sdk/objections";
import { downloadAttachment } from "../../src/services/objection.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockDownloadAttachment = downloadAttachment as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = {
    data: {},
  } as Session;
  return next();
});

const PREFIXED_CONTENT_DISPOSITION_VALUE = "attachment; filename=\"CH_SO_OBJ_test.pdf\"";
const CONTENT_DISPOSITION_VALUE = "attachment; filename=\"test.pdf\"";
const CONTENT_TYPE_VALUE = "application/pdf";
const CONTENT_LENGTH_VALUE = "3";
const XLSX_CONTENT_DISPOSITION_VALUE = 'attachment; filename="CH_SO_OBJ_test.xlsx"';
const DOCX_CONTENT_DISPOSITION_VALUE = 'attachment; filename="CH_SO_OBJ_test.docx"';
const ZIP_CONTENT_DISPOSITION_VALUE = 'attachment; filename="CH_SO_OBJ_test.zip"';
const COMMON_FILE_BASED_SIGNATURE = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
const MIME_TYPE_ZIP = 'application/zip';
const MIME_TYPE_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const MIME_TYPE_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const TEST_DOWNLOAD_URL = "/company/12345678/strike-off-objections/13434/attachments/234234/download";

describe("document download controller unit tests", () => {

  // this is now skipped due to a part of which is now accepable in node 18 upgrade but the testing of same is done locally and the document download is working fine.
  it("should download a file with correct headers", async () => {
    const fileBytes = Buffer.from([0x00, 0x01, 0x02]);
    const readable = new Readable();
    readable.push(fileBytes);
    readable.push(null);

    const dummyDownload = {
      data: readable,
      headers: {
        [HEADER_CONTENT_DISPOSITION]: CONTENT_DISPOSITION_VALUE,
        [HEADER_CONTENT_LENGTH]: CONTENT_LENGTH_VALUE,
        [HEADER_CONTENT_TYPE]: CONTENT_TYPE_VALUE,
      },
    } as Download;

    mockDownloadAttachment.mockResolvedValueOnce(dummyDownload);

    const res = await request(app)
      .get(STRIKE_OFF_OBJECTIONS + TEST_DOWNLOAD_URL)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(200);
    expect(res.body).toEqual(fileBytes);
    expect(res.header[HEADER_CONTENT_DISPOSITION]).toEqual(CONTENT_DISPOSITION_INLINE);
    expect(res.header[HEADER_CONTENT_LENGTH]).toEqual(CONTENT_LENGTH_VALUE);
    expect(res.header[HEADER_CONTENT_TYPE]).toEqual(CONTENT_TYPE_VALUE);
  });

  it("should show correct error message to user when download from API returns status 401", async () => {
    const status = 401;
    mockDownloadAttachment.mockRejectedValueOnce({ status } as ApiError);
    await testErrorScreen(status,
                          "Error Downloading Attachment",
                          "Unable to download file. Please contact the Support Team.");
  });

  it("should show correct error message to user when download from API returns status 403", async () => {
    const status = 403;
    mockDownloadAttachment.mockRejectedValueOnce({ status } as ApiError);
    await testErrorScreen(status,
                          "Error Downloading Attachment",
                          "Unable to download file. Please contact the Support Team.");
  });

  it("should show correct error message to user when download from API returns status 404", async () => {
    const status = 404;
    mockDownloadAttachment.mockRejectedValueOnce({ status } as ApiError);
    await testErrorScreen(status,
                          "Error Downloading Attachment",
                          "Unable to download file. Please contact the Support Team.");
  });

  it("should show generic error page to user when error thrown with no http status ", async () => {
    mockDownloadAttachment.mockRejectedValueOnce(new Error("Oops"));

    await testErrorScreen(500,
                          "Sorry, there is a problem with the service",
                          "Try again later.");
  });
});

const testErrorScreen = async (status: number, heading: string, message: string) => {
  const res = await request(app)
    .get(STRIKE_OFF_OBJECTIONS + TEST_DOWNLOAD_URL)
    .set("Referer", "/")
    .set("Cookie", [`${COOKIE_NAME}=123`]);

  expect(res.text).toContain(heading);
  expect(res.text).toContain(message);
  expect(res.status).toEqual(status);
};

describe("INLINE_TYPES_ALLOWED constant", () => {
    it("should contain only allowed inline MIME types", () => {
        expect(INLINE_TYPES_ALLOWED).toEqual([
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif'
        ]);
    });

    it("should not contain disallowed types", () => {
        expect(INLINE_TYPES_ALLOWED).not.toContain(MIME_TYPE_ZIP);
        expect(INLINE_TYPES_ALLOWED).not.toContain(MIME_TYPE_DOCX);
        expect(INLINE_TYPES_ALLOWED).not.toContain(MIME_TYPE_XLSX);
    });
});
it("should download a .zip file with attachment disposition", async () => {
    const fileBytes = COMMON_FILE_BASED_SIGNATURE;
    const readable = new Readable();
    readable.push(fileBytes);
    readable.push(null);

    const dummyDownload = {
        data: readable,
        headers: {
            [HEADER_CONTENT_DISPOSITION]: ZIP_CONTENT_DISPOSITION_VALUE,
            [HEADER_CONTENT_LENGTH]: fileBytes.length.toString(),
            [HEADER_CONTENT_TYPE]: MIME_TYPE_ZIP,
        },
    } as Download;

    mockDownloadAttachment.mockResolvedValueOnce(dummyDownload);

    const res = await request(app)
        .get(STRIKE_OFF_OBJECTIONS + TEST_DOWNLOAD_URL)
        .set("Referer", "/")
        .set("Cookie", [`${COOKIE_NAME}=123`])
        .buffer()
        .parse((res, callback) => {
            const data: Uint8Array[] = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => callback(null, Buffer.concat(data)));
        });

    expect(res.status).toEqual(200);
    expect(Buffer.from(res.body)).toEqual(fileBytes);
    expect(res.header[HEADER_CONTENT_DISPOSITION]).not.toEqual(CONTENT_DISPOSITION_INLINE);
    expect(res.header[HEADER_CONTENT_DISPOSITION]).toContain('attachment');
    expect(res.header[HEADER_CONTENT_TYPE]).toEqual(MIME_TYPE_ZIP);
});

it("should download a .xls file with attachment disposition", async () => {
    const fileBytes = COMMON_FILE_BASED_SIGNATURE;
    const readable = new Readable();
    readable.push(fileBytes);
    readable.push(null);

    const dummyDownload = {
        data: readable,
        headers: {
            [HEADER_CONTENT_DISPOSITION]: XLSX_CONTENT_DISPOSITION_VALUE,
            [HEADER_CONTENT_LENGTH]: fileBytes.length.toString(),
            [HEADER_CONTENT_TYPE]: MIME_TYPE_XLSX,
        },
    } as Download;

    mockDownloadAttachment.mockResolvedValueOnce(dummyDownload);

    const res = await request(app)
        .get(STRIKE_OFF_OBJECTIONS + TEST_DOWNLOAD_URL)
        .set("Referer", "/")
        .set("Cookie", [`${COOKIE_NAME}=123`])
        .buffer()
        .parse((res, callback) => {
            const data: Uint8Array[] = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => callback(null, Buffer.concat(data)));
        });

    expect(res.status).toEqual(200);
    expect(res.body).toEqual(fileBytes);
    expect(res.header[HEADER_CONTENT_DISPOSITION]).not.toEqual(CONTENT_DISPOSITION_INLINE);
    expect(res.header[HEADER_CONTENT_DISPOSITION]).toContain('attachment');
    expect(res.header[HEADER_CONTENT_TYPE]).toEqual(MIME_TYPE_XLSX);
});

it("should download a .docx file with attachment disposition", async () => {
    const fileBytes = COMMON_FILE_BASED_SIGNATURE;
    const readable = new Readable();
    readable.push(fileBytes);
    readable.push(null);

    const dummyDownload = {
        data: readable,
        headers: {
            [HEADER_CONTENT_DISPOSITION]: DOCX_CONTENT_DISPOSITION_VALUE,
            [HEADER_CONTENT_LENGTH]: fileBytes.length.toString(),
            [HEADER_CONTENT_TYPE]: MIME_TYPE_DOCX,
        },
    } as Download;

    mockDownloadAttachment.mockResolvedValueOnce(dummyDownload);

    const res = await request(app)
        .get(STRIKE_OFF_OBJECTIONS + TEST_DOWNLOAD_URL)
        .set("Referer", "/")
        .set("Cookie", [`${COOKIE_NAME}=123`])
        .buffer()
        .parse((res, callback) => {
            const data: Uint8Array[] = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => callback(null, Buffer.concat(data)));
        });

    expect(res.status).toEqual(200);
    expect(res.body).toEqual(fileBytes);
    expect(res.header[HEADER_CONTENT_DISPOSITION]).not.toEqual(CONTENT_DISPOSITION_INLINE);
    expect(res.header[HEADER_CONTENT_DISPOSITION]).toContain('attachment');
    expect(res.header[HEADER_CONTENT_TYPE]).toEqual(MIME_TYPE_DOCX);
});