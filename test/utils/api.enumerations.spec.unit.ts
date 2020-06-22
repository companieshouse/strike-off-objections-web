import { lookupCompanyStatus, lookupCompanyType } from "../../src/utils/api.enumerations";

jest.mock("js-yaml", () => {
  return {
    safeLoad: jest.fn(() => {
      return {
        company_status: {
          receivership: "Receiver Action",
        },
        company_summary: {
          ltd: "Private limited company",
        },
      };
    }),
  };
});

describe("api enumeration tests", () => {
  it("should return a readable company type description when given a company type key", () => {
    const readableCompanyType: string = lookupCompanyType("ltd");
    expect(readableCompanyType).toEqual("Private limited company");
  });

  it("should return original key when there is no match for the company type key", () => {
    const key: string = "key";
    const readableCompanyType: string = lookupCompanyType(key);
    expect(readableCompanyType).toEqual(key);
  });

  it("should return a readable company status description when given a company status key", () => {
    const readableCompanyStatus: string = lookupCompanyStatus("receivership");
    expect(readableCompanyStatus).toEqual("Receiver Action");
  });

  it("should return original key when there is no match for the company status key", () => {
    const key: string = "key";
    const readableCompanyStatus: string = lookupCompanyStatus(key);
    expect(readableCompanyStatus).toEqual(key);
  });
});
