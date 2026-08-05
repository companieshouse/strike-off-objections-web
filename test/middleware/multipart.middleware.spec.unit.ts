jest.mock("busboy");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/properties", () => ({
  MAX_FILE_SIZE_BYTES: "5242880",
}));

import { Response } from "express";
import { EventEmitter } from "events";
import { MultipartMiddleware } from "../../src/middleware/multipart.middleware";
import { FileUploadRequest } from "../../src/types";

const mockBusboyInstance = new EventEmitter() as any;
mockBusboyInstance.pipe = jest.fn();

const Busboy = require("busboy");
(Busboy as jest.Mock).mockReturnValue(mockBusboyInstance);

const buildRequest = (isMultipart: boolean = true): Partial<FileUploadRequest> => ({
  is: jest.fn().mockReturnValue(isMultipart ? "multipart/form-data" : false),
  headers: {},
  pipe: jest.fn(),
  body: {},
  files: [],
});

const buildResponse = (): Partial<Response> => ({});

describe("MultipartMiddleware", () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockNext = jest.fn();
    mockBusboyInstance.removeAllListeners();
    mockBusboyInstance.pipe = jest.fn();
    (Busboy as jest.Mock).mockReturnValue(mockBusboyInstance);
  });

  it("should call next() without processing if request is not multipart/form-data", async () => {
    const req = buildRequest(false) as FileUploadRequest;
    const res = buildResponse() as Response;

    await MultipartMiddleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it("should initialise req.body and req.files for multipart requests", async () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;

    MultipartMiddleware(req, res, mockNext);

    expect(req.body).toEqual({});
    expect(req.files).toEqual([]);
  });

  it("should pipe the request to busboy", () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;

    MultipartMiddleware(req, res, mockNext);

    expect(req.pipe).toHaveBeenCalledWith(mockBusboyInstance);
  });

  it("should call next() when busboy emits finish", () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;

    MultipartMiddleware(req, res, mockNext);
    mockBusboyInstance.emit("finish");

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it("should call next() with error when busboy emits an error", () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;
    const error = new Error("busboy error");

    MultipartMiddleware(req, res, mockNext);
    mockBusboyInstance.emit("error", error);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it("should extract _csrf field from form fields", () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;

    MultipartMiddleware(req, res, mockNext);
    mockBusboyInstance.emit("field", "_csrf", "test-csrf-token");

    expect(req.body["_csrf"]).toBe("test-csrf-token");
  });

  it("should not add non-_csrf fields to req.body", () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;

    MultipartMiddleware(req, res, mockNext);
    mockBusboyInstance.emit("field", "someOtherField", "someValue");

    expect(req.body["someOtherField"]).toBeUndefined();
  });

  it("should collect file chunks and push completed file to req.files", () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;

    MultipartMiddleware(req, res, mockNext);

    const fileStream = new EventEmitter() as any;
    fileStream.resume = jest.fn();

    mockBusboyInstance.emit("file", "file", fileStream, {
      filename: "test.pdf",
      mimeType: "application/pdf",
    });

    const chunk1 = Buffer.from("hello");
    const chunk2 = Buffer.from(" world");
    fileStream.emit("data", chunk1);
    fileStream.emit("data", chunk2);
    fileStream.emit("end");

    expect(req.files).toHaveLength(1);
    expect(req.files![0].filename).toBe("test.pdf");
    expect(req.files![0].mimeType).toBe("application/pdf");
    expect(req.files![0].data).toEqual(Buffer.concat([chunk1, chunk2]));
  });

  it("should not push file to req.files if file data is empty", () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;

    MultipartMiddleware(req, res, mockNext);

    const fileStream = new EventEmitter() as any;
    fileStream.resume = jest.fn();

    mockBusboyInstance.emit("file", "file", fileStream, {
      filename: "empty.pdf",
      mimeType: "application/pdf",
    });

    fileStream.emit("end");

    expect(req.files).toHaveLength(0);
  });

  it("should set fileSizeLimitExceeded on req.body when file limit is reached", () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;

    MultipartMiddleware(req, res, mockNext);

    const fileStream = new EventEmitter() as any;
    fileStream.resume = jest.fn();

    mockBusboyInstance.emit("file", "file", fileStream, {
      filename: "large.pdf",
      mimeType: "application/pdf",
    });

    fileStream.emit("limit");

    expect(req.body.fileSizeLimitExceeded).toBe(true);
    expect(req.body.filename).toBe("large.pdf");
  });

  it("should not push file to req.files when file size limit is exceeded", () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;

    MultipartMiddleware(req, res, mockNext);

    const fileStream = new EventEmitter() as any;
    fileStream.resume = jest.fn();

    mockBusboyInstance.emit("file", "file", fileStream, {
      filename: "large.pdf",
      mimeType: "application/pdf",
    });

    fileStream.emit("limit");
    fileStream.emit("data", Buffer.from("some data"));
    fileStream.emit("end");

    expect(req.files).toHaveLength(0);
  });

  it("should call next() with error when file stream emits an error", () => {
    const req = buildRequest() as FileUploadRequest;
    const res = buildResponse() as Response;
    const fileError = new Error("file stream error");

    MultipartMiddleware(req, res, mockNext);

    const fileStream = new EventEmitter() as any;
    fileStream.resume = jest.fn();

    mockBusboyInstance.emit("file", "file", fileStream, {
      filename: "test.pdf",
      mimeType: "application/pdf",
    });

    fileStream.emit("error", fileError);

    expect(mockNext).toHaveBeenCalledWith(fileError);
  });
});
