import { createNewObjection, ObjectionPatch, ObjectionStatus, patchObjection } from "../../src/services/objections.api.service";

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";

describe("objections API service unit tests", () => {

  it("returns an id when a new objection is created", () => {
    const objectionId = createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN);

    expect(objectionId).toBeDefined();
    expect(typeof objectionId).toBe("string");
  });

  it("returns undefined when patching an objection", () => {
    const patch: ObjectionPatch = {
      reason: "some reason or other",
      status: ObjectionStatus.SUBMITTED,
    };
    const patchResult = patchObjection(COMPANY_NUMBER, ACCESS_TOKEN, patch);
    expect(patchResult).toBeUndefined();
  });
});
