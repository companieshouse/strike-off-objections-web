import { AjaxUploadResponderStrategy } from "./ajax.upload.responder.strategy";
import { HtmlUploadResponderStrategy } from "./html.upload.responder.strategy";
import { UploadResponderStrategy } from "./upload.responder.strategy";

/**
 * Factory method for creating an uploadResponderStrategy
 * @param {boolean} isAjaxRequest do we need an ajax responder or not
 */
export const createUploadResponderStrategy = (isAjaxRequest: boolean): UploadResponderStrategy => {
  return isAjaxRequest ? new AjaxUploadResponderStrategy() : new HtmlUploadResponderStrategy();
};
