import { CompanyProfile } from "ch-sdk-node/dist/services/company-profile";
import CompanyProfileService from "ch-sdk-node/dist/services/company-profile/service";
import Resource from "ch-sdk-node/dist/services/resource";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import { getCompanyProfile } from "../../src/services/company.profile.service";

jest.mock("ch-sdk-node/dist/services/company-profile/service");

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";

describe("company profile service unit tests", () => {
  const mockGetCompanyProfile = (CompanyProfileService.prototype.getCompanyProfile as jest.Mock);

  beforeEach(() => {
    mockGetCompanyProfile.mockReset();
  });

  it("converts company number to uppercase", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dummySDKResponse);
    const company = await getCompanyProfile("sc100079", ACCESS_TOKEN);
    expect(company.incorporationDate).toEqual("26 June 1872");
    expect(mockGetCompanyProfile).toBeCalledWith("SC100079");
  });

  it("returns an ObjectionCompanyProfile object", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dummySDKResponse);
    const company = await getCompanyProfile("00006400", ACCESS_TOKEN);
    expect(company).toEqual(expectedProfile);
  });

  it("returns a 400 status code when company is not found", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(notFoundSDKResponse);
    try {
      await getCompanyProfile("", ACCESS_TOKEN);
    } catch (e) {
      expect(e.status).toEqual(400);
    }
    expect.assertions(1);
  });
});

const dummySDKResponse: Resource<CompanyProfile> = {
  httpStatusCode: 200,
  resource: {
    accounts: {
      nextAccounts: {
        periodEndOn: "2019-10-10",
        periodStartOn: "2019-01-01",
      },
      nextDue: "2020-05-31",
      overdue: false,
    },
    companyName: "Girl's school trust",
    companyNumber: "00006400",
    companyStatus: "active",
    companyStatusDetail: "company status detail",
    confirmationStatement: {
      nextDue: "2020-04-30",
      overdue: false,
    },
    dateOfCreation: "1872-06-26",
    hasBeenLiquidated: false,
    hasCharges: false,
    hasInsolvencyHistory: false,
    jurisdiction: "england-wales",
    registeredOfficeAddress: {
      addressLineOne: "line1",
      addressLineTwo: "line2",
      careOf: "careOf",
      country: "uk",
      locality: "locality",
      poBox: "123",
      postalCode: "post code",
      premises: "premises",
      region: "region",
    },
    sicCodes: ["123"],
    type: "limited",
  },
};

const notFoundSDKResponse: any = {
  httpStatusCode: 400,
};

const expectedProfile: ObjectionCompanyProfile = {
  address: {
    line_1: "line1",
    line_2: "line2",
    postCode: "post code",
  },
  companyName: "Girl's school trust",
  companyNumber: "00006400",
  companyStatus: "Active",
  companyType: "limited",
  incorporationDate: "26 June 1872",
};
