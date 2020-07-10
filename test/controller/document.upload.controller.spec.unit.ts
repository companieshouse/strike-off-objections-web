jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");
jest.mock("../../src/controllers/upload/upload.responder.strategy.factory");
jest.mock("../../src/controllers/upload/http.request.file.uploader");
jest.mock("../../src/model/govuk.error.data");

import { Session } from "ch-node-session-handler";
import { NextFunction, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import { uploadFile, UploadFileCallbacks } from "../../src/controllers/upload/http.request.file.uploader";
import {
  createUploadResponderStrategy,
  IUploadResponderStrategy,
} from "../../src/controllers/upload/upload.responder.strategy.factory";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import objectionSessionMiddleware from "../../src/middleware/objection.session.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import { UploadErrorMessages } from "../../src/model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../../src/model/govuk.error.data";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import {
  DOCUMENT_UPLOAD_FILE,
  OBJECTIONS_DOCUMENT_UPLOAD, OBJECTIONS_DOCUMENT_UPLOAD_CONTINUE,
  OBJECTIONS_DOCUMENT_UPLOAD_FILE,
} from "../../src/model/page.urls";
import { addAttachment, getAttachments } from "../../src/services/objection.service";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession, retrieveFromObjectionSession,
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const COMPANY_NUMBER = "00006400";
const EXPECTED_MAX_FILE_SIZE_MESSAGE = "File size must be smaller than 0 MB";

const SESSION: Session = {
  data: {},
} as Session;

const mockAddAttachment = addAttachment as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = SESSION;
  return next();
});

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    req.session.data[OBJECTIONS_SESSION_NAME] = { };
    return next();
  }

  return next(new Error("No session on request"));
});

const mockRetrieveCompanyProfileFromObjectionSession = retrieveCompanyProfileFromObjectionSession as jest.Mock;
mockRetrieveCompanyProfileFromObjectionSession.mockImplementation( () => dummyCompanyProfile );

const mockRetrieveAccessTokenFromSession = retrieveAccessTokenFromSession as jest.Mock;
mockRetrieveAccessTokenFromSession.mockImplementation(() => "token");

const mockRetrieveFromObjectionSession = retrieveFromObjectionSession as jest.Mock;
mockRetrieveFromObjectionSession.mockImplementation(() => "objectionId");

const mockCreateUploadResponderStrategy = createUploadResponderStrategy as jest.Mock;
mockCreateUploadResponderStrategy.mockImplementation(() => mockUploadResponderStrategy);

const expectedBuffer = fs.readFileSync(path.join(__dirname + "/../resources/files/text.txt"));

const mockUploadFile = uploadFile as jest.Mock;

const setUploadFileToReturnSuccess = () => {
  mockUploadFile.mockImplementation((req: Request, maxSizeBytes: number, callbacks: UploadFileCallbacks) => {
    return callbacks.uploadFinishedCallback("text.txt", expectedBuffer, "application/text");
  });
};

const setUploadFileToTriggerFileLimitExceeded = () => {
  mockUploadFile.mockImplementation((req: Request, maxSizeBytes: number, callbacks: UploadFileCallbacks) => {
    return callbacks.fileSizeLimitExceededCallback("text_large.txt",
                                                   parseInt(process.env.MAX_FILE_SIZE_BYTES as string, 10));
  });
};

const setUploadFileToTriggerNoFileDataReceived = () => {
  mockUploadFile.mockImplementation((req: Request, maxSizeBytes: number, callbacks: UploadFileCallbacks) => {
    return callbacks.noFileDataReceivedCallback("text.txt");
  });
};

const mockGetAttachments = getAttachments as jest.Mock;
const mockAttachments = [
  {
    id: "sghsaghj-3623-khh",
    name: "document1.jpg",
  },
  {
    id: "dshkj-5456-fdhfddf",
    name: "document2.jpg",
  },
];
mockGetAttachments.mockImplementation(() => mockAttachments);

const mockCreateGovUkErrorData = createGovUkErrorData as jest.Mock;
const mockGovUkErrorData = {} as GovUkErrorData;
mockCreateGovUkErrorData.mockImplementation(() => mockGovUkErrorData);

const mockUploadResponderStrategy: IUploadResponderStrategy = {
  handleGenericError: jest.fn((res: Response, e: Error, next?: NextFunction) => {
    res.send(); // calling res.send() sends a response back to the test and prevents tests from hanging
  }),
  handleGovUKError: jest.fn((res: Response, errorData: GovUkErrorData, attachments: any[]) => {
    res.send();
  }),
  handleSuccess: jest.fn((req: Request, res: Response) => {
    res.send();
  }),
};

describe ("document.upload.controller tests", () => {
  beforeEach(() => {
    (mockUploadResponderStrategy.handleGovUKError as jest.Mock).mockClear();
    mockCreateGovUkErrorData.mockClear();
    mockAddAttachment.mockReset();
    mockGetAttachments.mockClear();
  });

  it ("should call success handler when file uploaded successfully", async () => {

    setUploadFileToReturnSuccess();

    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_FILE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", path.join(__dirname + "/../resources/files/text.txt"));

    expect(mockAddAttachment).toBeCalledWith("00006400",
                                             "token",
                                             "objectionId",
                                             expectedBuffer,
                                             "text.txt");
    expect(mockUploadResponderStrategy.handleSuccess).toHaveBeenCalledTimes(1);
  });

  it ("should call displayError when file is too big", async () => {
    // See global.setup.ts for unit test file size limit

    setUploadFileToTriggerFileLimitExceeded();

    const response = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_FILE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", path.join(__dirname + "/../resources/files/text_large.txt"));

    expect(mockCreateGovUkErrorData).toHaveBeenCalledTimes(1);
    const createGovUkErrorParams = mockCreateGovUkErrorData.mock.calls[0];
    expect(createGovUkErrorParams[0]).toBe(EXPECTED_MAX_FILE_SIZE_MESSAGE);
    expect(createGovUkErrorParams[1]).toBe("#file-upload");
    expect(createGovUkErrorParams[2]).toBe(true);
    expect(createGovUkErrorParams[3]).toBe("");

    expect(mockUploadResponderStrategy.handleGovUKError).toHaveBeenCalledTimes(1);

    const params = (mockUploadResponderStrategy.handleGovUKError as jest.Mock).mock.calls[0];
    expect(params[1]).toBe(mockGovUkErrorData);
    expect(params[2]).toBe(mockAttachments);
  });

  it ("should call displayError when no file data received", async () => {
    // See global.setup.ts for unit test file size limit

    setUploadFileToTriggerNoFileDataReceived();

    const response = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_FILE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", path.join(__dirname + "/../resources/files/text.txt"));

    expect(mockCreateGovUkErrorData).toHaveBeenCalledTimes(1);
    const createGovUkErrorParams = mockCreateGovUkErrorData.mock.calls[0];
    expect(createGovUkErrorParams[0]).toBe(UploadErrorMessages.NO_FILE_CHOSEN);
    expect(createGovUkErrorParams[1]).toBe("#file-upload");
    expect(createGovUkErrorParams[2]).toBe(true);
    expect(createGovUkErrorParams[3]).toBe("");

    expect(mockUploadResponderStrategy.handleGovUKError).toHaveBeenCalledTimes(1);

    const strategyParams = (mockUploadResponderStrategy.handleGovUKError as jest.Mock).mock.calls[0];
    expect(strategyParams[1]).toBe(mockGovUkErrorData);
    expect(strategyParams[2]).toBe(mockAttachments);
  });

  it ("should call handleGenericError when add attachment throws error", async () => {
    // See global.setup.ts for unit test file size limit

    setUploadFileToReturnSuccess();

    const error = { status: 404 };
    mockAddAttachment.mockImplementationOnce(() => {
      throw error;
    });

    await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_FILE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .attach("file-upload", path.join(__dirname + "/../resources/files/text.txt"));

    expect(mockUploadResponderStrategy.handleGenericError).toHaveBeenCalledTimes(1);
    const handleGenericErrorParams = (mockUploadResponderStrategy.handleGenericError as jest.Mock).mock.calls[0];
    expect(handleGenericErrorParams[1]).toBe(error);
  });

  it ("should redirect to next page when POST /document-upload-continue is called", async () => {
    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_CONTINUE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetAttachments).toHaveBeenCalledTimes(1);
    expect(res.status).toEqual(302);
    expect(res.header.location).toEqual("TODO%20-%20PAGE%20AFTER%20UPLOAD");
  });

  it ("should call displayError when no attachments are present and trying to continue", async () => {
    mockGetAttachments.mockImplementationOnce(() => []);

    const res = await request(app)
      .post(OBJECTIONS_DOCUMENT_UPLOAD_CONTINUE)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockCreateGovUkErrorData).toHaveBeenCalledTimes(1);
    const createGovUkErrorParams = mockCreateGovUkErrorData.mock.calls[0];
    expect(createGovUkErrorParams[0]).toBe(UploadErrorMessages.NO_DOCUMENTS_ADDED);
    expect(createGovUkErrorParams[1]).toBe("#file-upload");
    expect(createGovUkErrorParams[2]).toBe(true);
    expect(createGovUkErrorParams[3]).toBe("");

    expect(mockUploadResponderStrategy.handleGovUKError).toHaveBeenCalledTimes(1);

    const strategyParams = (mockUploadResponderStrategy.handleGovUKError as jest.Mock).mock.calls[0];
    expect(strategyParams[1]).toBe(mockGovUkErrorData);
    expect(strategyParams[2]).toStrictEqual([]);
  });
});

const dummyCompanyProfile: ObjectionCompanyProfile = {
  companyNumber: COMPANY_NUMBER,
} as ObjectionCompanyProfile;
