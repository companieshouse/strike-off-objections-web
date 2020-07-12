import { AjaxUploadResponderStrategy } from "../../../src/controllers/upload_strategy/ajax.upload.responder.strategy";
import { HtmlUploadResponderStrategy } from "../../../src/controllers/upload_strategy/html.upload.responder.strategy";
import { IUploadResponderStrategy } from "../../../src/controllers/upload_strategy/upload.responder.strategy";
import { createUploadResponderStrategy } from "../../../src/controllers/upload_strategy/upload.responder.strategy.factory";

describe("upload responder factory tests", () => {

  it("should return HtmlUploadResponderStrategy", () => {
    const uploadResponder: IUploadResponderStrategy = createUploadResponderStrategy(false);
    expect(uploadResponder instanceof HtmlUploadResponderStrategy).toBeTruthy();
    expect(uploadResponder instanceof AjaxUploadResponderStrategy).toBeFalsy();
  });

  it("should return AjaxUploadResponderStrategy", () => {
    const uploadResponder: IUploadResponderStrategy = createUploadResponderStrategy(true);
    expect(uploadResponder instanceof AjaxUploadResponderStrategy).toBeTruthy();
    expect(uploadResponder instanceof HtmlUploadResponderStrategy).toBeFalsy();
  });
});
