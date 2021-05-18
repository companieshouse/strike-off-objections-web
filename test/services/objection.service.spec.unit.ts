jest.mock("../../src/modules/sdk/objections");
jest.mock("../../src/services/objection.session.service");

import { Session } from "@companieshouse/node-session-handler";
import {
  OBJECTIONS_SESSION_NAME,
  SESSION_COMPANY_PROFILE,
  SESSION_OBJECTION_CREATE,
  SESSION_OBJECTION_ID
} from "../../src/constants";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import * as objectionsSdk from "../../src/modules/sdk/objections";
import { Attachment, Objection, ObjectionCreate } from "../../src/modules/sdk/objections";
import { ObjectionStatus } from "../../src/modules/sdk/objections";
import * as objectionsService from "../../src/services/objection.service";
import {
  retrieveAccessTokenFromSession,
  retrieveCompanyProfileFromObjectionSession,
  retrieveFromObjectionSession, retrieveObjectionCreateFromObjectionSession,
} from "../../src/services/objection.session.service";

const mockGetEligibility = objectionsSdk.getCompanyEligibility as jest.Mock;
const mockCreateNewObjection = objectionsSdk.createNewObjection as jest.Mock;
const mockPatchObjection = objectionsSdk.patchObjection as jest.Mock;
const mockAddAttachment = objectionsSdk.addAttachment as jest.Mock;
const mockRetrieveProfileFromSession = retrieveCompanyProfileFromObjectionSession as jest.Mock;
const mockRetrieveObjectionCreateFromSession = retrieveObjectionCreateFromObjectionSession as jest.Mock;
const mockRetrieveFromObjectionSession = retrieveFromObjectionSession as jest.Mock;
const mockRetrieveAccessToken = retrieveAccessTokenFromSession as jest.Mock;
const mockSdkDownloadAttachment = objectionsSdk.downloadAttachment as jest.Mock;

const mockGetAttachments = objectionsSdk.getAttachments as jest.Mock;
const mockGetAttachment = objectionsSdk.getAttachment as jest.Mock;
const mockDeleteAttachment = objectionsSdk.deleteAttachment as jest.Mock;
const mockGetObjection = objectionsSdk.getObjection as jest.Mock;

const mockAttachments = [
  {
    id: "abc123",
    name: "test.doc",
  },
  {
    id: "xyz789",
    name: "mock.doc",
  },
];

const mockAttachment = {
  id: "abc123",
  name: "test.doc",
};

const mockObjection = {
  attachments: [
    { id: "ATT001",
      name: "attachment.jpg",
    },
    {
      id: "ATT002",
      name: "document.pdf",
    }],
  id: "OBJ123",
  reason: "Owed some money",
};

mockGetAttachments.mockResolvedValue(mockAttachments);

mockGetAttachment.mockResolvedValue(mockAttachment);

mockGetObjection.mockResolvedValue(mockObjection);

const session = {
  data: {
  },
} as Session;
const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";
const NEW_OBJECTION_ID = "7687kjh-33kjkjkjh-hjgh435";
const REASON = "Owed Money";
const ATTACHMENT_ID = "file123";
const NEW_ATTACHMENT_ID = "f89bc843-bfc2-4121-b00b-0d667947fe5f";

describe("objections API service unit tests", () => {

  beforeEach(() => {
    mockRetrieveProfileFromSession.mockImplementationOnce(() => {
      return dummyCompanyProfile as ObjectionCompanyProfile;
    });
    mockRetrieveObjectionCreateFromSession.mockImplementationOnce(() => {
      return dummyObjectionCreate as ObjectionCreate;
    });
    mockRetrieveFromObjectionSession.mockImplementationOnce(() => {
      return NEW_OBJECTION_ID as string;
    });
    mockRetrieveAccessToken.mockImplementationOnce(() => {
      return ACCESS_TOKEN as string;
    });

    session.data[OBJECTIONS_SESSION_NAME] = {
      [SESSION_COMPANY_PROFILE]: dummyCompanyProfile,
      [SESSION_OBJECTION_CREATE]: dummyObjectionCreate,
      [SESSION_OBJECTION_ID]: NEW_OBJECTION_ID,
    };
  });

  it("should return boolean when getting company eligibility", async () => {
    mockGetEligibility.mockResolvedValueOnce(true);

    const returnedEligibility: boolean = await objectionsService.getCompanyEligibility(
      COMPANY_NUMBER, ACCESS_TOKEN);

    expect(returnedEligibility).toBeDefined();
    expect(typeof returnedEligibility).toBe("boolean");
    expect(returnedEligibility).toEqual(true);
  });

  it("returns an id when a new objection is created", async () => {
    mockCreateNewObjection.mockResolvedValueOnce(NEW_OBJECTION_ID);

    const objectionId: string = await objectionsService.createNewObjection(
      COMPANY_NUMBER, ACCESS_TOKEN, dummyObjectionCreate);

    expect(objectionId).toBeDefined();
    expect(typeof objectionId).toBe("string");
    expect(objectionId).toStrictEqual(NEW_OBJECTION_ID);
  });

  it("objections SDK is called with objection create when creating an objection reason", async () => {
    mockCreateNewObjection.mockResolvedValueOnce(NEW_OBJECTION_ID);

    await objectionsService.createNewObjection(
      COMPANY_NUMBER, ACCESS_TOKEN, dummyObjectionCreate);
    expect(mockCreateNewObjection).toBeCalledWith(COMPANY_NUMBER, ACCESS_TOKEN, dummyObjectionCreate);
  });

  it("objections SDK is called when updating user details", async () => {
    await objectionsService.updateObjectionUserDetails(COMPANY_NUMBER, NEW_OBJECTION_ID, ACCESS_TOKEN, dummyObjectionCreate);
    expect(mockPatchObjection).toBeCalledWith(COMPANY_NUMBER, NEW_OBJECTION_ID, ACCESS_TOKEN, {
      full_name: "Joe Bloggs",
      share_identity: false,
    });
  });

  it("objections SDK is called when updating an objection reason", async () => {
    await objectionsService.updateObjectionReason(COMPANY_NUMBER, NEW_OBJECTION_ID, ACCESS_TOKEN, REASON);

    expect(mockPatchObjection).toBeCalledWith(COMPANY_NUMBER, NEW_OBJECTION_ID, ACCESS_TOKEN, { reason: REASON });
  });

  it("objections SDK is called when submitting an objection", async () => {
    await objectionsService.submitObjection(session);

    expect(mockPatchObjection).toBeCalledWith(COMPANY_NUMBER, NEW_OBJECTION_ID, ACCESS_TOKEN,
                                              { status: ObjectionStatus.SUBMITTED });
  });

  it("returns an id when a new attachment is added", async () => {
    mockAddAttachment.mockResolvedValueOnce(NEW_ATTACHMENT_ID);

    const FILE_NAME = "test_file";
    const BUFFER = Buffer.from("Test buffer");
    const attachmentId: string = await objectionsService.addAttachment(session,
                                                                       BUFFER,
                                                                       FILE_NAME );

    expect(attachmentId).toBeDefined();
    expect(typeof attachmentId).toBe("string");
    expect(attachmentId).toStrictEqual(NEW_ATTACHMENT_ID);

    expect(mockAddAttachment).toBeCalledWith(dummyCompanyProfile.companyNumber,
                                             ACCESS_TOKEN,
                                             NEW_OBJECTION_ID,
                                             BUFFER,
                                             FILE_NAME);
  });

  it("should return list of attachment objects when getting attachments for an object", async () => {
    const attachmentsList: Attachment[] = await objectionsService.getAttachments(session);
    expect(mockGetAttachments).toBeCalledWith(dummyCompanyProfile.companyNumber,
                                              ACCESS_TOKEN,
                                              NEW_OBJECTION_ID);
    expect(attachmentsList).toEqual(mockAttachments);
  });

  it("should return single attachment object when getting an attachment for an object", async () => {
    const attachment: Attachment = await objectionsService.getAttachment(session, ATTACHMENT_ID);
    expect(mockGetAttachment).toBeCalledWith(dummyCompanyProfile.companyNumber,
                                             ACCESS_TOKEN,
                                             NEW_OBJECTION_ID,
                                             ATTACHMENT_ID);
    expect(attachment).toEqual(mockAttachment);
  });

  it("should call sdk when deleting attachment", async () => {
    await objectionsService.deleteAttachment(session, ATTACHMENT_ID);
    expect(mockDeleteAttachment).toBeCalledWith(COMPANY_NUMBER, ACCESS_TOKEN, NEW_OBJECTION_ID, ATTACHMENT_ID);
  });

  it("should call sdk with correct args when downloading attachment", async () => {
    const downloadUri = "/download";
    await objectionsService.downloadAttachment(downloadUri, session);

    expect(mockSdkDownloadAttachment).toBeCalledWith(downloadUri, ACCESS_TOKEN);
  });

  it("should throw ApiError if downloading file fails", async () => {
    const apiError: objectionsSdk.ApiError = {
      data: {
        errors: ["download failed"],
      },
      message: "Not Found",
      status: 404,
    };

    mockSdkDownloadAttachment.mockRejectedValueOnce(apiError);

    await expect(objectionsService.downloadAttachment("/download/something", session))
      .rejects.toStrictEqual(apiError);
  });

  it("should return an objection when requested", async () => {
    const objection: Objection = await objectionsService.getObjection(session);
    expect(mockGetObjection).toBeCalledWith(dummyCompanyProfile.companyNumber,
                                            ACCESS_TOKEN,
                                            NEW_OBJECTION_ID);
    expect(objection).toEqual(mockObjection);
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

const dummyObjectionCreate: ObjectionCreate = {
  full_name: "Joe Bloggs",
  share_identity: false,
  objector: "client"
};


