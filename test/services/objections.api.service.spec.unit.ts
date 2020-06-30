jest.mock("axios");

import axios from "axios";
import { createNewObjection, ObjectionPatch, ObjectionStatus, patchObjection } from "../../src/services/objections.api.service";

const mockAxiosRequest = axios.request as jest.Mock;

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";

describe("objections API service unit tests", () => {

  it("returns an id when a new objection is created", async () => {
    const NEW_OBJECTION_ID = "7687kjh-33kjkjkjh-hjgh435";
    mockAxiosRequest.mockResolvedValue({
      data: {
        id: NEW_OBJECTION_ID,
      },
    });
    const objectionId: string = await createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN);

    expect(objectionId).toBeDefined();
    expect(typeof objectionId).toBe("string");
    expect(objectionId).toEqual(NEW_OBJECTION_ID);
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
