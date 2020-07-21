jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/services/objection.session.service");
jest.mock("../../src/middleware/objection.session.middleware");
jest.mock("../../src/services/objection.service");

import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { OBJECTIONS_SESSION_NAME } from "../../src/constants";
import authenticationMiddleware from "../../src/middleware/authentication.middleware";
import objectionSessionMiddleware from "../../src/middleware/objection.session.middleware";
import sessionMiddleware from "../../src/middleware/session.middleware";
import ObjectionCompanyProfile from "../../src/model/objection.company.profile";
import { OBJECTIONS_CHECK_YOUR_ANSWERS } from "../../src/model/page.urls";
import { Objection } from "../../src/modules/sdk/objections";
import { getObjection } from "../../src/services/objection.service";
import {
  retrieveCompanyProfileFromObjectionSession,
} from "../../src/services/objection.session.service";
import { COOKIE_NAME } from "../../src/utils/properties";

const mockGetObjectionSessionValue = retrieveCompanyProfileFromObjectionSession as jest.Mock;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = {
    data: {},
  } as Session;
  return next();
});

const mockObjectionSessionMiddleware = objectionSessionMiddleware as jest.Mock;
mockObjectionSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    req.session.data[OBJECTIONS_SESSION_NAME] = {};
    return next();
  }

  return next(new Error("No session on request"));
});

const mockGetObjection = getObjection as jest.Mock;

describe("check company tests", () => {

  it("should render the page with company data from the session", async () => {

    mockGetObjectionSessionValue.mockReset().mockImplementation(() => dummyCompanyProfile);

    mockGetObjection.mockReset().mockImplementation(() => dummyObjection);

    const response = await request(app).get(OBJECTIONS_CHECK_YOUR_ANSWERS)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetObjectionSessionValue).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.text).toContain("Girls school trust");
    expect(response.text).toContain("00006400");
    expect(response.text).toContain("Owed some money");
    expect(response.text).toContain("attachment.jpg");
    expect(response.text).toContain("document.pdf");
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

const dummyObjection: Objection = {
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
