import { createNewObjection } from "../../src/services/objections.api.service";

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";

describe("objections API service unit tests", () => {

  it("returns an id when a new objection is created", () => {
    const objectionId = createNewObjection("00006400", ACCESS_TOKEN);

    expect(objectionId).toBeDefined();
    expect(typeof objectionId).toBe("string");
  });
});
