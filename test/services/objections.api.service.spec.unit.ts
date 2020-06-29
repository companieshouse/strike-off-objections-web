import * as objectionsApi from "../../src/services/objections.api.service";

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";

describe("objections API service unit tests", () => {

  it("returns an id when a new objection is created", () => {
    const objectionId = objectionsApi.createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN);

    expect(objectionId).toBeDefined();
    expect(typeof objectionId).toBe("string");
  });

  it("returns undefined when patching an objection", () => {
    const patch: objectionsApi.ObjectionPatch = {
      reason: "some reason or other",
      status: objectionsApi.ObjectionStatus.SUBMITTED,
    };
    const patchResult = objectionsApi.patchObjection(COMPANY_NUMBER, ACCESS_TOKEN, patch);
    expect(patchResult).toBeUndefined();
  });
});
