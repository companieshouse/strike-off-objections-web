import { AjaxUploadResponderStrategy } from "../../../src/controllers/upload/ajax.upload.responder.strategy";
import { HtmlUploadResponderStrategy } from "../../../src/controllers/upload/html.upload.responder.strategy";
import {
  createUploadResponderStrategy,
  IUploadResponderStrategy,
} from "../../../src/controllers/upload/upload.responder.strategy.factory";

describe("upload responder factory tests", () => {

  it("should return HtmlUploadResponderStrategy", () => {
    const isXhrRequest: boolean = false;
    const uploadResponder: IUploadResponderStrategy = createUploadResponderStrategy(isXhrRequest);
    expect(uploadResponder instanceof HtmlUploadResponderStrategy).toBeTruthy();
    expect(uploadResponder instanceof AjaxUploadResponderStrategy).toBeFalsy();
  });

  it("should return AjaxUploadResponderStrategy", () => {
    const isXhrRequest: boolean = true;
    const uploadResponder: IUploadResponderStrategy = createUploadResponderStrategy(isXhrRequest);
    expect(uploadResponder instanceof AjaxUploadResponderStrategy).toBeTruthy();
    expect(uploadResponder instanceof HtmlUploadResponderStrategy).toBeFalsy();
  });
});
