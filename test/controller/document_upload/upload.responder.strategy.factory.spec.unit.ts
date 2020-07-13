import { AjaxUploadResponderStrategy } from "../../../src/controllers/document_upload/ajax.upload.responder.strategy";
import { HtmlUploadResponderStrategy } from "../../../src/controllers/document_upload/html.upload.responder.strategy";
import { UploadResponderStrategy } from "../../../src/controllers/document_upload/upload.responder.strategy";
import { createUploadResponderStrategy } from "../../../src/controllers/document_upload/upload.responder.strategy.factory";

describe("upload responder factory tests", () => {

  it("should return HtmlUploadResponderStrategy", () => {
    const uploadResponder: UploadResponderStrategy = createUploadResponderStrategy(false);
    expect(uploadResponder instanceof HtmlUploadResponderStrategy).toBeTruthy();
    expect(uploadResponder instanceof AjaxUploadResponderStrategy).toBeFalsy();
  });

  it("should return AjaxUploadResponderStrategy", () => {
    const uploadResponder: UploadResponderStrategy = createUploadResponderStrategy(true);
    expect(uploadResponder instanceof AjaxUploadResponderStrategy).toBeTruthy();
    expect(uploadResponder instanceof HtmlUploadResponderStrategy).toBeFalsy();
  });
});
