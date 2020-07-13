jest.mock("../../src/modules/sdk/objections");
jest.mock("../../src/services/objection.session.service");

import { Session } from "ch-node-session-handler";
import { OBJECTIONS_SESSION_NAME, SESSION_COMPANY_PROFILE, SESSION_OBJECTION_ID } from "../../src/constants";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import { Attachment } from "../../src/modules/sdk/objections";
import * as objectionsSdk from "../../src/modules/sdk/objections";
import * as objectionsService from "../../src/services/objection.service";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveFromObjectionSession,
} from "../../src/services/objection.session.service";

const mockCreateNewObjection = objectionsSdk.createNewObjection as jest.Mock;
const mockPatchObjection = objectionsSdk.patchObjection as jest.Mock;
const mockAddAttachment = objectionsSdk.addAttachment as jest.Mock;
const mockRetrieveProfileFromSession = retrieveCompanyProfileFromObjectionSession as jest.Mock;
const mockRetrieveFromObjectionSession = retrieveFromObjectionSession as jest.Mock;
const mockRetrieveAccessToken = retrieveAccessTokenFromSession as jest.Mock;

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
    mockRetrieveProfileFromSession.mockImplementationOnce(() => {
      return dummyCompanyProfile as ObjectionCompanyProfile;
    });
    mockRetrieveFromObjectionSession.mockImplementationOnce(() => {
      return NEW_OBJECTION_ID as string;
    });
    mockRetrieveAccessToken.mockImplementationOnce(() => {
      return ACCESS_TOKEN as string;
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
    const BUFFER = Buffer.from("Test buffer");
    const attachmentResult = objectionsService.addAttachment(session,
        BUFFER,
        FILE_NAME );

    expect(attachmentResult).toEqual(Promise.resolve());
    expect(mockAddAttachment).toBeCalledWith(dummyCompanyProfile.companyNumber,
      ACCESS_TOKEN,
      NEW_OBJECTION_ID,
      BUFFER,
      FILE_NAME);
  });

  it("should return list of attachment objects when getting attachments for an object", async () => {
    const session: Session = new Session();
    session.data = {
      extra_data: {
        companyProfileInSession: {
          companyNumber: "00006400",
        },
        objectionId: "obj123",
      },
      signin_info: {
        access_token: {
          access_token: ACCESS_TOKEN,
        },
      },
    };
    const attachmentsList: Attachment[] = await objectionsService.getAttachments(session);

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
