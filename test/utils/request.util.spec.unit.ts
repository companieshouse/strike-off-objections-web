import {
  STRIKE_OFF_OBJECTIONS_OBJECTING_ENTITY_NAME,
  STRIKE_OFF_OBJECTIONS_ENTER_INFORMATION,
  STRIKE_OFF_OBJECTIONS_DOCUMENT_UPLOAD,
  extractValueIfPresentFromRequestField,
  getWhitelistedReturnToURL,
} from "../../src/utils/request.util";


import { Templates } from "../../src/model/template.paths";
import { OBJECTIONS_OBJECTING_ENTITY_NAME, OBJECTIONS_ENTER_INFORMATION, OBJECTIONS_DOCUMENT_UPLOAD } from "../../src/model/page.urls";

const UNKNOWN_URL = "/unknown";

describe("request.util.unit",
         () => {
           describe("extractValueIfPresentFromRequestField", () => {
             it("gets correct return to URL for Objecting Entity page", () => {
               const returnToUrl = extractValueIfPresentFromRequestField(OBJECTIONS_OBJECTING_ENTITY_NAME,
                                                                         STRIKE_OFF_OBJECTIONS_OBJECTING_ENTITY_NAME);
               expect(returnToUrl).toEqual(OBJECTIONS_OBJECTING_ENTITY_NAME);
             });
             it("gets correct return to URL for Enter Information page", () => {
               const returnToUrl = extractValueIfPresentFromRequestField(OBJECTIONS_ENTER_INFORMATION,
                                                                         STRIKE_OFF_OBJECTIONS_ENTER_INFORMATION);
               expect(returnToUrl).toEqual(OBJECTIONS_ENTER_INFORMATION);
             });
             it("gets correct return to URL for Document Upload page", () => {
               const returnToUrl = extractValueIfPresentFromRequestField(OBJECTIONS_DOCUMENT_UPLOAD, STRIKE_OFF_OBJECTIONS_DOCUMENT_UPLOAD);
               expect(returnToUrl).toEqual(OBJECTIONS_DOCUMENT_UPLOAD);
             });
             it("returns null if asked to look up an unknown page URL", () => {
               const returnToUrl = extractValueIfPresentFromRequestField(UNKNOWN_URL, STRIKE_OFF_OBJECTIONS_DOCUMENT_UPLOAD);
               expect(returnToUrl).toEqual(null);
             });
           });
         });


describe("getWhitelistedReturnToURL", () => {
  it("gets correct return to URL for Objecting Entity page", () => {
    const returnToUrl = getWhitelistedReturnToURL(OBJECTIONS_OBJECTING_ENTITY_NAME);
    expect(returnToUrl).toEqual(OBJECTIONS_OBJECTING_ENTITY_NAME);
  });

  it("gets correct return to URL for Enter Information page", () => {
    const returnToUrl = getWhitelistedReturnToURL(OBJECTIONS_ENTER_INFORMATION);
    expect(returnToUrl).toEqual(OBJECTIONS_ENTER_INFORMATION);
  });

  it("gets correct return to URL for Document Upload page", () => {
    const returnToUrl = getWhitelistedReturnToURL(OBJECTIONS_DOCUMENT_UPLOAD);
    expect(returnToUrl).toEqual(OBJECTIONS_DOCUMENT_UPLOAD);
  });
  it("errors if asked to look up an unknown page URL", () => {
    const execution = () => getWhitelistedReturnToURL(UNKNOWN_URL);
    expect(execution).toThrow("Return to URL /unknown not found in trusted URLs whitelist " +
    "/\\/strike-off-objections\\/objecting-entity-name/," + "/\\/strike-off-objections\\/document-upload/," + "/\\/strike-off-objections\\/enter-information/.");
  });
});

