jest.mock("../../../src/services/objection.service");
jest.mock("../../../src/utils/logger");

import { Request, Response } from "express";
import { AjaxUploadResponderStrategy } from "../../../src/controllers/document_upload/ajax.upload.responder.strategy";
import { UploadResponderStrategy } from "../../../src/controllers/document_upload/upload.responder.strategy";
import { ErrorMessages } from "../../../src/model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../../../src/model/govuk.error.data";
import { OBJECTIONS_ERROR } from "../../../src/model/page.urls";
import { Templates } from "../../../src/model/template.paths";
import { Attachment } from "../../../src/modules/sdk/objections";
import { getAttachments } from "../../../src/services/objection.service";
import logger from "../../../src/utils/logger";

// mock getAttachments
const mockGetAttachments = getAttachments as jest.Mock;

// mock logger.error
const mockLoggerError = logger.error as jest.Mock;

// mock the request
const req: Request = {} as Request;

// mock the response
const res: Response = {} as Response;

// mock res.render
const mockRenderFunc = jest.fn().mockImplementation((view,  options?,  callback?: ((err, html) => void)) => {
  if (callback) {
    callback( null, "DUMMY HTML");
  }
});

// mock res.send
const mockSendFunc = jest.fn().mockImplementation((_body?: any) => {
  return res;
});

// mock res.status
const mockStatusFunc = jest.fn().mockImplementation((_code: number) => {
  return res;
});

beforeEach(() => {
  res.render = mockRenderFunc;
  res.send = mockSendFunc;
  res.status = mockStatusFunc;

  mockRenderFunc.mockClear();
  mockLoggerError.mockClear();
  mockSendFunc.mockClear();
  mockStatusFunc.mockClear();

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
});

describe("ajax upload responder tests", () => {

  it("should return html fragments on success", async () => {
    const ajaxResponder: UploadResponderStrategy = new AjaxUploadResponderStrategy();

    await ajaxResponder.handleSuccess(req, res);

    expect(mockRenderFunc.mock.calls[0][0]).toContain(Templates.DOCUMENT_UPLOAD_FILE_LIST);
    expect(mockRenderFunc.mock.calls[1][0]).toContain(Templates.DOCUMENT_UPLOAD_FILE_PICKER);
    expect(mockSendFunc).toBeCalledWith({
      divs: [
        { divHtml: "DUMMY HTML", divId: "fileListDiv" },
        { divHtml: "DUMMY HTML", divId: "fileUploadDiv" },
      ],
    });
  });

  it("should return error page redirect if exception occurs in success", async () => {
    const err = new Error("Whoops");
    res.render = jest.fn().mockImplementationOnce((_view,  _options?,  _callback?: ((err, html) => void)) => {
      throw err;
    });

    const ajaxResponder: UploadResponderStrategy = new AjaxUploadResponderStrategy();

    await ajaxResponder.handleSuccess(req, res);

    expect(mockLoggerError).toBeCalledWith(ErrorMessages.ERROR_500 + ": " + err);
    expect(mockStatusFunc).toBeCalledWith(500);
    expect(mockSendFunc).toBeCalledWith({ redirect: OBJECTIONS_ERROR });
  });

  it("should return error page and status 500 on generic error", () => {
    const ajaxResponder: UploadResponderStrategy = new AjaxUploadResponderStrategy();
    const err: Error = new Error("Oh Noes");

    ajaxResponder.handleGenericError(res, err);

    expect(mockLoggerError).toBeCalledWith(ErrorMessages.ERROR_500 + ": " + err);
    expect(mockStatusFunc).toBeCalledWith(500);
    expect(mockSendFunc).toBeCalledWith({ redirect: OBJECTIONS_ERROR });
  });

  it("should call render error divs on user error", async () => {
    const ajaxResponder: UploadResponderStrategy = new AjaxUploadResponderStrategy();
    const errorData: GovUkErrorData = createGovUkErrorData("Oh Noes", "#upload",
                                                           true, "user");
    const attachments: Attachment[] = [];

    await ajaxResponder.handleGovUKError(res, errorData, attachments);

    expect(mockRenderFunc.mock.calls[0][0]).toContain(Templates.DOCUMENT_UPLOAD_ERROR_SUMMARY);
    expect(mockRenderFunc.mock.calls[0][1].errorList).toEqual([errorData]);
    expect(mockRenderFunc.mock.calls[1][0]).toContain(Templates.DOCUMENT_UPLOAD_FILE_PICKER);
    expect(mockRenderFunc.mock.calls[1][1].documentUploadErr).toEqual(errorData);
    expect(mockSendFunc).toBeCalledWith({
      divs: [
        { divHtml: "DUMMY HTML", divId: "errorSummaryDiv" },
        { divHtml: "DUMMY HTML", divId: "fileUploadDiv" },
      ],
    });
  });

  it("should return error page redirect if exception occurs in handleGovUKError", async () => {
    const err = new Error("Whoops");
    res.render = jest.fn().mockImplementationOnce((_view,  _options?,  _callback?: ((err, html) => void)) => {
      throw err;
    });

    const ajaxResponder: UploadResponderStrategy = new AjaxUploadResponderStrategy();
    const errorData: GovUkErrorData = createGovUkErrorData("Oh Noes", "#upload",
                                                           true, "user");
    const attachments: Attachment[] = [];

    await ajaxResponder.handleGovUKError(res, errorData, attachments);

    expect(mockLoggerError).toBeCalledWith(ErrorMessages.ERROR_500 + ": " + err);
    expect(mockStatusFunc).toBeCalledWith(500);
    expect(mockSendFunc).toBeCalledWith({ redirect: OBJECTIONS_ERROR });
  });
});
