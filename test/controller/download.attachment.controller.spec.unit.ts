jest.mock("../../services/redis.service");

let mockAuthenticateForDownload: jest.Mock = jest.fn((req: Request, res: Response, next: NextFunction) => next());
jest.mock("../../authentication/middleware/download", () => {
  return {
    authenticateForDownload: mockAuthenticateForDownload
  }
});

let mockApiClientDownload: jest.Mock = jest.fn();
jest.mock("../../client/apiclient", () => {
  return {
    download: mockApiClientDownload
  }
});

import {NextFunction, Request, Response} from "express";
import {loadSession} from "../../services/redis.service";
import * as request from "supertest";
import app from "../../app";
import {COOKIE_NAME} from "../../session/config";
import {loadMockSession} from "../mock.utils";
import activeFeature from "../../feature.flag";

const mockCacheService = (<unknown>loadSession as jest.Mock<typeof loadSession>);

beforeEach(() => {
  mockCacheService.mockRestore();
  loadMockSession(mockCacheService);
  mockAuthenticateForDownload.mockClear();
});

const appHome: string = "/extensions";
const downloadUri: string = "/company/01777777/extensions/requests/12345/reasons/123456/attachments/e9477054-141b-4c7e-bd7e-ad1aded3df43/download";

describe("download attachment controller unit tests", () => {

  it("should download a file", async () => {
    mockApiClientDownload.mockReset();
    mockApiClientDownload.mockImplementation(jest.fn( async (downUri: string, token: string, res: Response): Promise<void> => {
      res.sendStatus(200);
    }));

    const resp = await request(app)
      .get(appHome + downloadUri)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    const argsDownloadUri = mockApiClientDownload.mock.calls[0][0];

    expect(mockAuthenticateForDownload).toHaveBeenCalled();
    expect(argsDownloadUri).toBe(downloadUri);
    expect(mockApiClientDownload).toHaveBeenCalledTimes(1);
    expect(resp.status).toBe(200);
  });

  it("should return status 500 on an unspecified error", async () => {
    mockApiClientDownload.mockReset();
    mockApiClientDownload.mockImplementation(jest.fn( async (downUri: string, token: string, res: Response): Promise<void> => {
      return Promise.reject("BAD THINGS")
    }));

    const resp = await request(app)
      .get(appHome + downloadUri)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    const argsDownloadUri = mockApiClientDownload.mock.calls[0][0];

    expect(mockAuthenticateForDownload).toHaveBeenCalled();
    expect(argsDownloadUri).toBe(downloadUri);
    expect(mockApiClientDownload).toHaveBeenCalledTimes(1);
    expect(resp.status).toBe(500);
  });

  it("should return status 401 on an unauthorized error", async () => {
    mockApiClientDownload.mockReset();
    mockApiClientDownload.mockImplementation(jest.fn( async (downUri: string, token: string, res: Response): Promise<void> => {
      return Promise.reject({
        status: 401
      })
    }));

    const resp = await request(app)
      .get(appHome + downloadUri)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    const argsDownloadUri = mockApiClientDownload.mock.calls[0][0];

    expect(mockAuthenticateForDownload).toHaveBeenCalled();
    expect(argsDownloadUri).toBe(downloadUri);
    expect(mockApiClientDownload).toHaveBeenCalledTimes(1);
    const stringBody = JSON.stringify(resp);
    expect(stringBody).toContain("Unauthorized");
    expect(stringBody).toContain("You are not authorized to download this file.");
    expect(resp.status).toBe(401);
  });

  it("should return status 403 on a forbidden error", async () => {
    mockApiClientDownload.mockReset();
    mockApiClientDownload.mockImplementation(jest.fn( async (downUri: string, token: string, res: Response): Promise<void> => {
      return Promise.reject({
        status: 403
      })
    }));

    const resp = await request(app)
      .get(appHome + downloadUri)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    const argsDownloadUri = mockApiClientDownload.mock.calls[0][0];

    expect(mockAuthenticateForDownload).toHaveBeenCalled();
    expect(argsDownloadUri).toBe(downloadUri);
    expect(mockApiClientDownload).toHaveBeenCalledTimes(1);
    const stringBody = JSON.stringify(resp);
    expect(stringBody).toContain("Forbidden");
    expect(stringBody).toContain("This file cannot be downloaded.");
    expect(resp.status).toBe(403);
  });

  it("should return status 404 on a not found error", async () => {
    mockApiClientDownload.mockReset();
    mockApiClientDownload.mockImplementation(jest.fn( async (downUri: string, token: string, res: Response): Promise<void> => {
      return Promise.reject({
        status: 404
      })
    }));

    const resp = await request(app)
      .get(appHome + downloadUri)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    const argsDownloadUri = mockApiClientDownload.mock.calls[0][0];

    expect(mockAuthenticateForDownload).toHaveBeenCalled();
    expect(argsDownloadUri).toBe(downloadUri);
    expect(mockApiClientDownload).toHaveBeenCalledTimes(1);
    const stringBody = JSON.stringify(resp);
    expect(stringBody).toContain("Not Found");
    expect(stringBody).toContain("The file path could not be found.");
    expect(resp.status).toBe(404);
  });

  it("should return the error status if error contains one", async () => {
    mockApiClientDownload.mockReset();
    mockApiClientDownload.mockImplementation(jest.fn( async (downUri: string, token: string, res: Response): Promise<void> => {
      return Promise.reject({
        status: 502
      })
    }));

    const resp = await request(app)
      .get(appHome + downloadUri)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    const argsDownloadUri = mockApiClientDownload.mock.calls[0][0];

    expect(mockAuthenticateForDownload).toHaveBeenCalled();
    expect(argsDownloadUri).toBe(downloadUri);
    expect(mockApiClientDownload).toHaveBeenCalledTimes(1);
    expect(resp.status).toBe(502);
  });
});
