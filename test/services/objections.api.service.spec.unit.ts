jest.mock("axios");

import axios, { AxiosError, AxiosResponse } from "axios";
import { ApiError, createNewObjection, ObjectionPatch, ObjectionStatus, patchObjection } from "../../src/services/objections.api.service";

const mockAxiosRequest = axios.request as jest.Mock;

const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";
const COMPANY_NUMBER = "00006400";

describe("objections API service unit tests", () => {

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
    const objectionId: string = await createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN);

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

    let thrownError: ApiError;
    try {
      await createNewObjection(COMPANY_NUMBER, ACCESS_TOKEN);
    } catch (e) {
      thrownError = e;
    }

    const expectedApiError: ApiError = {
      data: ["missing company"],
      message: "Not Found",
      status: 404,
    };

    expect(thrownError).toStrictEqual(expectedApiError);
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
