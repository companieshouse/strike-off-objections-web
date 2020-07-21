jest.mock("axios");

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import * as objectionsSdk from "../../../../src/modules/sdk/objections";

const mockAxiosRequest = axios.request as jest.Mock;

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";
const OBJECTION_ID = "444222";
const ATTACHMENT_ID = "file123";

describe("objections SDK service unit tests", () => {

  beforeEach(() => {
    mockAxiosRequest.mockReset();
  });

  it("returns an id when a new objection is created", async () => {
    const NEW_OBJECTION_ID = "7687kjh-33kjkjkjh-hjgh435";
    mockAxiosRequest.mockResolvedValueOnce({
      data: {
        id: NEW_OBJECTION_ID,
      },
    });
    const objectionId: string = await objectionsSdk.createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN);

    expect(objectionId).toBeDefined();
    expect(typeof objectionId).toBe("string");
    expect(objectionId).toStrictEqual(NEW_OBJECTION_ID);
  });

  it("throws an ApiError from createNewObjection when an error occurs calling the api", async () => {
    const axiosError: AxiosError = {
      message: "Not Found",
      response: {
        data: {
          errors: ["missing company"],
        },
        status: 404,
      } as AxiosResponse,
    } as AxiosError;

    mockAxiosRequest.mockRejectedValueOnce(axiosError);

    const expectedApiError: objectionsSdk.ApiError = {
      data: ["missing company"],
      message: "Not Found",
      status: 404,
    };

    await expect(objectionsSdk.createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN))
      .rejects.toStrictEqual(expectedApiError);
  });

  it("objections API is called when patching an objection", () => {
    const patch: objectionsSdk.ObjectionPatch = {
      reason: "some reason or other",
      status: objectionsSdk.ObjectionStatus.SUBMITTED,
    };

    objectionsSdk.patchObjection(COMPANY_NUMBER, OBJECTION_ID, ACCESS_TOKEN, patch);

    expect(mockAxiosRequest).toBeCalled();
  });

  it("objections API is called when posting an attachment", () => {
    const fileName: string = "fileName";
    const BUFFER = Buffer.from("Buffer");
    const STREAMS_DATA_PARAMATER = "_streams";
    objectionsSdk.addAttachment(COMPANY_NUMBER,
        ACCESS_TOKEN,
        OBJECTION_ID,
      BUFFER,
      fileName,
    );
    const usedAxiosConfig: AxiosRequestConfig = mockAxiosRequest.mock.calls[0][0];
    const streamZero = usedAxiosConfig.data[STREAMS_DATA_PARAMATER][0];
    expect(streamZero).toContain(fileName);

    const streamOne = usedAxiosConfig.data[STREAMS_DATA_PARAMATER][1];
    expect(streamOne).toEqual(BUFFER);
  });

  it("should call objections API getting attachments list", () => {
    objectionsSdk.getAttachments(COMPANY_NUMBER,
        ACCESS_TOKEN,
        OBJECTION_ID);

    expect(mockAxiosRequest).toBeCalled();
  });

  it("should call objections API getting single attachment", () => {
    objectionsSdk.getAttachment(COMPANY_NUMBER,
        ACCESS_TOKEN,
        OBJECTION_ID,
        ATTACHMENT_ID);

    expect(mockAxiosRequest).toBeCalled();
  });

  // TODO Uncomment this test when end-point to retrieve an objection is available (OBJ-125)

  // it("should call objections API getting an objection", () => {
  //   objectionsSdk.getObjection(COMPANY_NUMBER,
  //       ACCESS_TOKEN,
  //       OBJECTION_ID);

  //   expect(mockAxiosRequest).toBeCalled();
  // });
});
