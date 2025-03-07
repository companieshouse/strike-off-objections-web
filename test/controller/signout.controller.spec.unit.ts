jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");

import { sessionMock } from "../mocks/session.middleware";
import "../mocks/csrf.middleware";

import request from "supertest";
import app from "../../src/app";
import { ACCOUNTS_SIGNOUT_PATH, STRIKE_OFF_OBJECTIONS, SIGNOUT_PATH } from "../../src/model/page.urls";
import { SIGNOUT_RETURN_URL_SESSION_KEY } from '../../src/constants';
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

const SIGNOUT_LOCATION = `${STRIKE_OFF_OBJECTIONS}${SIGNOUT_PATH}`;

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Signout controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    sessionMock.session = new Session();
  });

  describe('get tests', () => {
    it("should render the signout template", async () => {
        const response = await request(app)
          .get(SIGNOUT_LOCATION);

        expect(response.status).toBe(200);
        expect(response.text).toContain('Are you sure you want to sign out?');
    });

    it('should store the previous page in the session from the referer header', async () => {
        const referer = 'return url'
        const response = await request(app)
          .get(SIGNOUT_LOCATION)
          .set('Referer', 'return url');

        expect(response.status).toBe(200);
        expect(sessionMock.session.getExtraData(SIGNOUT_RETURN_URL_SESSION_KEY)).toBe(referer);
    })

    it('should populate the back link url from the referer header', async () => {
        const referer = 'return url'
        const response = await request(app)
          .get(SIGNOUT_LOCATION)
          .set('Referer', referer);

        expect(response.status).toBe(200);
        expect(response.text).toContain(`href="${referer}"`)
    })
  })

  describe('post tests', () => {
    it('should show an error if no radio buttons are selected', async () => {
        const previousLocation = 'http://example.com'
        sessionMock.session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, previousLocation)
        const response = await request(app)
          .post(SIGNOUT_LOCATION)

        expect(response.status).toBe(400)
        expect(response.text).toContain('Select yes if you want to sign out')
    })

    it('should show the error page if there is no return page in session', async () => {
        const previousLocation = undefined
        sessionMock.session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, previousLocation)

        const response = await request(app)
          .post(SIGNOUT_LOCATION)

        expect(response.status).toBe(500)
    })

    it('should return the user to their previous location if they select "no"', async () => {
        const previousLocation = 'http://example.com'
        sessionMock.session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, previousLocation)


        const response = await request(app)
          .post(SIGNOUT_LOCATION)
          .send({signout: 'no'})

          expect(response.status).toBe(302)
          expect(response.get('Location')).toBe(previousLocation)
    })

    it('should return the user to their previous location if they select "yes"', async () => {
        const previousLocation = 'http://example.com'
        sessionMock.session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, previousLocation)
        const response = await request(app)
          .post(SIGNOUT_LOCATION)
          .send({signout: 'yes'})

          expect(response.status).toBe(302)
          expect(response.get('Location')).toBe(ACCOUNTS_SIGNOUT_PATH)
    })
  })

  describe('no session tests', () => {
    it('should land on error screen if no session is available when performing get', async () => {
      sessionMock.session = undefined;

      const response = await request(app)
        .get(SIGNOUT_LOCATION)

      expect(response.status).toBe(500)
    })

    it('should land on error screen if no session is available when performing post', async () => {
      sessionMock.session = undefined;

        const response = await request(app)
          .post(SIGNOUT_LOCATION)

        expect(response.status).toBe(500)
    })
  })
});
