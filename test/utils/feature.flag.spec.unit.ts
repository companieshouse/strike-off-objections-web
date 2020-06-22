import { isActiveFeature } from "../../src/utils/feature.flag";

describe("feature flag tests", () => {

  it("should return false if variable is 'false'", () => {
    const active = isActiveFeature("false");
    expect(active).toBeFalsy();
  });

  it("should return false if variable is '0'", () => {
    const active = isActiveFeature("0");
    expect(active).toBeFalsy();
  });

  it("should return false if variable is ''", () => {
    const active = isActiveFeature("");
    expect(active).toBeFalsy();
  });

  it("should return false if variable is undefined", () => {
    const active = isActiveFeature(undefined);
    expect(active).toBeFalsy();
  });

  it("should return false if variable is 'off'", () => {
    const active = isActiveFeature("off");
    expect(active).toBeFalsy();
  });

  it("should return false if variable is 'OFF'", () => {
    const active = isActiveFeature("OFF");
    expect(active).toBeFalsy();
  });

  it("should return true if variable is 'on'", () => {
    const active = isActiveFeature("on");
    expect(active).toBeTruthy();
  });

  it("should return true if variable is 'true'", () => {
    const active = isActiveFeature("true");
    expect(active).toBeTruthy();
  });

  it("should return true if variable is 'TRUE'", () => {
    const active = isActiveFeature("TRUE");
    expect(active).toBeTruthy();
  });

  it("should return true if variable is '1'", () => {
    const active = isActiveFeature("1");
    expect(active).toBeTruthy();
  });
});
