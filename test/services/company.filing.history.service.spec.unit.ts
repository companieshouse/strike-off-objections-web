import Resource from "ch-sdk-node/dist/services/resource";
import CompanyFilingHistoryService from "ch-sdk-node/dist/services/company-filing-history/service";
import { getCompanyFilingHistory } from "../../src/services/company.filing.history.service";
import { CompanyFilingHistory, FilingHistoryItem } from "ch-sdk-node/dist/services/company-filing-history";

jest.mock("ch-sdk-node/dist/services/company-filing-history/service");

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";

describe("company filing history service unit tests", () => {
  const mockGetCompanyFilingHistory = (CompanyFilingHistoryService.prototype.getCompanyFilingHistory as jest.Mock);

  beforeEach(() => {
    mockGetCompanyFilingHistory.mockReset();
  });

  it("converts company number to uppercase", async () => {
    mockGetCompanyFilingHistory.mockResolvedValueOnce(dummySDKResponse);
    await getCompanyFilingHistory("sc100079", "category", ACCESS_TOKEN);
    expect(mockGetCompanyFilingHistory).toBeCalledWith("SC100079", "category");
  });

  it("returns a correct status code for error response", async () => {
    mockGetCompanyFilingHistory.mockResolvedValueOnce(errorSdkResponse);
    try {
      await getCompanyFilingHistory("", "category", ACCESS_TOKEN);
    } catch (e) {
      expect(e.status).toEqual(404);
    }
    expect.assertions(1);
  });

  it("returns a CompanyFilingHistory object", async () => {
    mockGetCompanyFilingHistory.mockResolvedValueOnce(dummySDKResponse);
    const companyFilingHistory = await getCompanyFilingHistory("12345678", "category", ACCESS_TOKEN);
    expect(companyFilingHistory).toEqual(dummySDKResponse.resource);
  });
});

const dummyFilingHistoryItem: FilingHistoryItem = {
  category: "category",
  date: "someDate",
  description: "A description",
  transactionId: "transactionId",
  type: "a type"
};

const dummyCompanyFilingHistory: CompanyFilingHistory = {
  etag: "etag",
  items: [dummyFilingHistoryItem],
  itemsPerPage: 0,
  kind: "kind",
  startIndex: 0,
  totalCount: 0
};

const dummySDKResponse: Resource<CompanyFilingHistory> = {
  httpStatusCode: 200,
  resource: dummyCompanyFilingHistory,
};

const errorSdkResponse: any = {
  httpStatusCode: 404,
};
