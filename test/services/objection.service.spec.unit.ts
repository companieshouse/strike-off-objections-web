import { Session } from "ch-node-session-handler";

jest.mock("../../src/modules/sdk/objections");

import * as objectionsSdk from "../../src/modules/sdk/objections";
import * as objectionsService from "../../src/services/objection.service";
import { OBJECTIONS_SESSION_NAME, SESSION_COMPANY_PROFILE, SESSION_OBJECTION_ID } from "../../src/constants";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";

const mockCreateNewObjection = objectionsSdk.createNewObjection as jest.Mock;
const mockPatchObjection = objectionsSdk.patchObjection as jest.Mock;
const mockAddAttachment = objectionsSdk.addAttachment as jest.Mock;

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";
const NEW_OBJECTION_ID = "7687kjh-33kjkjkjh-hjgh435";
const REASON = "Owed Money";

describe("objections API service unit tests", () => {

  it("returns an id when a new objection is created", async () => {
    mockCreateNewObjection.mockResolvedValueOnce(NEW_OBJECTION_ID);

    const objectionId: string = await objectionsService.createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN);

    expect(objectionId).toBeDefined();
    expect(typeof objectionId).toBe("string");
    expect(objectionId).toStrictEqual(NEW_OBJECTION_ID);
  });

  it("objections SDK is called when updating an objection reason", async () => {
    await objectionsService.updateObjectionReason(COMPANY_NUMBER, NEW_OBJECTION_ID, ACCESS_TOKEN, REASON);

    expect(mockPatchObjection).toBeCalledWith(COMPANY_NUMBER, NEW_OBJECTION_ID, ACCESS_TOKEN, { reason: REASON });
  });

  it("returns undefined when updating an objection status to submitted", () => {
    const patchResult = objectionsService.submitObjection(COMPANY_NUMBER, ACCESS_TOKEN);
    expect(patchResult).toBeUndefined();
  });

  it("returns undefined when adding an attachment", () => {
    mockAddAttachment.mockImplementationOnce(() => {
      return;
    });
    const session = {
      data: {
      },
      } as Session;
    session.data[OBJECTIONS_SESSION_NAME] = {
      [SESSION_COMPANY_PROFILE] : dummyCompanyProfile,
      [SESSION_OBJECTION_ID] : NEW_OBJECTION_ID,
    };
    const FILE_NAME = "test_file";
    const attachmentResult = objectionsService.addAttachment(session,
        new Buffer(""),
        FILE_NAME );

    expect(attachmentResult).toEqual(Promise.resolve());
  });
});

const dummyCompanyProfile: ObjectionCompanyProfile = {
  address: {
    line_1: "line1",
    line_2: "line2",
    postCode: "post code",
  },
  companyName: "Girls school trust",
  companyNumber: "00006400",
  companyStatus: "Active",
  companyType: "limited",
  incorporationDate: "26 June 1872",
};