import { Request, Response } from "express";
import { HtmlUploadResponderStrategy } from "../../../src/controllers/document_upload/html.upload.responder.strategy";
import { createGovUkErrorData, GovUkErrorData } from "../../../src/model/govuk.error.data";
import { OBJECTIONS_DOCUMENT_UPLOAD } from "../../../src/model/page.urls";
import { Templates } from "../../../src/model/template.paths";
import { Attachment } from "../../../src/modules/sdk/objections";

// mock the request
const req: Request = {} as Request;

// mock the response
const res: Response = {} as Response;

// mock the render function
const mockRenderFunc = jest.fn().mockImplementation((_page: string) => {
  return null;
});
res.render = mockRenderFunc;

// mock the redirect function
const mockRedirectFunc = jest.fn().mockImplementation((_page: string) => {
  return null;
});
res.redirect = mockRedirectFunc;

// mock the next function
const mockNextFunc = jest.fn().mockImplementation((_e: Error) => {
  return null;
});
req.next = mockNextFunc;

describe("html upload responder tests", () => {
  it("should call redirect from success", () => {
    const htmlResponder: HtmlUploadResponderStrategy = new HtmlUploadResponderStrategy();

    htmlResponder.handleSuccess(req, res);

    expect(mockRedirectFunc).toBeCalledWith(OBJECTIONS_DOCUMENT_UPLOAD);
  });

  it("should forward to next() on generic error", () => {
    const htmlResponder: HtmlUploadResponderStrategy = new HtmlUploadResponderStrategy();
    const err: Error = new Error("Oh Noes");

    htmlResponder.handleGenericError(res, err, req.next);

    expect(mockNextFunc).toBeCalledWith(err);
  });

  it("should call render on user error", () => {
    const htmlResponder: HtmlUploadResponderStrategy = new HtmlUploadResponderStrategy();
    const errorData: GovUkErrorData = createGovUkErrorData("Oh Noes", "#upload",
                                                           true, "user");
    const attachments: Attachment[] = [];

    htmlResponder.handleGovUKError(res, errorData, attachments);

    expect(mockRenderFunc).toBeCalledWith(Templates.DOCUMENT_UPLOAD, {
      attachments,
      documentUploadErr: errorData,
      errorList: [errorData],
    });
  });
});
