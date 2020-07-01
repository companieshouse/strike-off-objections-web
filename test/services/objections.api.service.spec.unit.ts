jest.mock("../../src/sdk/objections");

import * as objectionsSdk from "../../src/sdk/objections";
import * as objectionsApiService from "../../src/services/objections.api.service";

const mockCreateNewObjection = objectionsSdk.createNewObjection as jest.Mock;

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";

describe("objections API service unit tests", () => {

  it("returns an id when a new objection is created", async () => {
    const NEW_OBJECTION_ID = "7687kjh-33kjkjkjh-hjgh435";
    mockCreateNewObjection.mockResolvedValueOnce(NEW_OBJECTION_ID);

    const objectionId: string = await objectionsApiService.createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN);

    expect(objectionId).toBeDefined();
    expect(typeof objectionId).toBe("string");
    expect(objectionId).toStrictEqual(NEW_OBJECTION_ID);
  });

  it("returns undefined when updating an objection reason", () => {
    const patchResult = objectionsApiService.updateObjectionReason(COMPANY_NUMBER, ACCESS_TOKEN, "reason");
    expect(patchResult).toBeUndefined();
  });

  it("returns undefined when updating an objection status to submitted", () => {
    const patchResult = objectionsApiService.updateObjectionStatusToSubmitted(COMPANY_NUMBER, ACCESS_TOKEN);
    expect(patchResult).toBeUndefined();
  });
});
