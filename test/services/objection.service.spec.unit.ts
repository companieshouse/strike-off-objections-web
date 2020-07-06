jest.mock("../../src/modules/sdk/objections");

import * as objectionsSdk from "../../src/modules/sdk/objections";
import * as objectionsService from "../../src/services/objection.service";

const mockCreateNewObjection = objectionsSdk.createNewObjection as jest.Mock;

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";
const NEW_OBJECTION_ID = "7687kjh-33kjkjkjh-hjgh435";

describe("objections API service unit tests", () => {

  it("returns an id when a new objection is created", async () => {
    mockCreateNewObjection.mockResolvedValueOnce(NEW_OBJECTION_ID);

    const objectionId: string = await objectionsService.createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN);

    expect(objectionId).toBeDefined();
    expect(typeof objectionId).toBe("string");
    expect(objectionId).toStrictEqual(NEW_OBJECTION_ID);
  });

  it("returns undefined when updating an objection reason", () => {
    const patchResult = objectionsService.updateObjectionReason(COMPANY_NUMBER, ACCESS_TOKEN, "reason");
    expect(patchResult).toBeUndefined();
  });

  it("returns undefined when updating an objection status to submitted", () => {
    const patchResult = objectionsService.submitObjection(COMPANY_NUMBER, ACCESS_TOKEN);
    expect(patchResult).toBeUndefined();
  });

  it("returns undefined when adding an attachment", () => {
    const FILE_NAME = "test_file";
    const attachmentResult = objectionsService.addAttachment(COMPANY_NUMBER,
        ACCESS_TOKEN,
        NEW_OBJECTION_ID,
        new Buffer(""),
        FILE_NAME );
    expect(attachmentResult).toBeUndefined();
  });
});
