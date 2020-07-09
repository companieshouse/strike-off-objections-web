jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/services/objection.service");
jest.mock("../../src/controllers/upload/upload.responder.strategy.factory");
jest.mock("../../src/controllers/upload/http.request.file.uploader");

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
import { GovUkErrorData } from "../../src/model/govuk.error.data";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import {
  DOCUMENT_UPLOAD_FILE,
  OBJECTIONS_DOCUMENT_UPLOAD,
  OBJECTIONS_DOCUMENT_UPLOAD_FILE,
} from "../../src/model/page.urls";
import { addAttachment, getAttachments } from "../../src/services/objection.service";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession, retrieveFromObjectionSession,
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const COMPANY_NUMBER = "00006400";

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

const mockUploadFileSuccess = uploadFile as jest.Mock;
mockUploadFileSuccess.mockImplementation((req: Request,
                                          maxSizeBytes: number,
                                          callbacks: UploadFileCallbacks) => {
  return callbacks.uploadFinishedCallback("text.txt", expectedBuffer, "application/text");
});

const mockGetAttachments = getAttachments as jest.Mock;
mockGetAttachments.mockImplementation(() => {
  return [
    {
      id: "sghsaghj-3623-khh",
      name: "document1.jpg",
    },
    {
      id: "dshkj-5456-fdhfddf",
      name: "document2.jpg",
    },
  ];
});

describe ("document.upload.controller tests", () => {

  it ("should redirect when file uploaded - NOT AJAX REQUEST", async (done) => {

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
    done();
  });

  // it ("should render error message when file is too big", async (done) => {
  //   // See global.setup.ts for unit test file size limit
  //   const response = await request(app)
  //     .post(pageURLs.EXTENSIONS_DOCUMENT_UPLOAD)
  //     .set("Referer", "/")
  //     .set("Cookie", [`${COOKIE_NAME}=123`])
  //     .attach('file-upload', path.join(__dirname + "/../client/files/text_large.txt"));
  //   expect(response.text).toContain(EXPECTED_MAX_FILE_SIZE_MESSAGE);
  //   done();
  // });

});

const dummyCompanyProfile: ObjectionCompanyProfile = {
  companyNumber: COMPANY_NUMBER,
} as ObjectionCompanyProfile;

const mockUploadResponderStrategy: IUploadResponderStrategy = {
  handleGenericError: jest.fn((res: Response, e: Error, next?: NextFunction) => {
    return;
  }),
  handleGovUKError: jest.fn((res: Response, errorData: GovUkErrorData, attachments: any[]) => {
    return;
  }),
  handleSuccess: jest.fn((req: Request, res: Response) => {
    res.send();
  }),
};
