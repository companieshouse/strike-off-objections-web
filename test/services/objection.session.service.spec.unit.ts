import { Session } from "ch-node-session-handler";
import {
  retrieveAccessTokenFromSession,
  retrieveUserEmailFromSession,
} from "../../src/services/objection.session.service";

const accessTokenValue = "tokenABC123";
const testEmail = "demo@ch.gov.uk";

describe ("objections session service tests", () => {

  it("should retrieve email when present in the session", () => {
    const session: Session = new Session();
    session.data = {
      signin_info: {
        user_profile: {
          email: testEmail,

        },
      },
    };
    const email: string = retrieveUserEmailFromSession(session);
    expect(email).not.toBeUndefined();
    expect(email).toEqual(testEmail);
  });

  it("should throw error when sign in info is absent", () => {
    const session: Session = new Session();
    expect(() => {
      retrieveUserEmailFromSession(session);
    }).toThrow();
  });

  it("should throw error when user profile is absent", () => {
    const session: Session = new Session();
    session.data = {
      signin_info: {},
    };
    expect(() => {
      retrieveUserEmailFromSession(session);
    }).toThrow();
  });

  it("should throw error when email is absent", () => {
    const session: Session = new Session();
    session.data = {
      signin_info: {
        user_profile: {},
      },
    };
    expect(() => {
      retrieveUserEmailFromSession(session);
    }).toThrow();
  });

  it("should retrieve access token when present in the session", () => {
    const session: Session = new Session();
    session.data = {
      signin_info: {
        access_token: {
          access_token: accessTokenValue,
        },
      },
    };
    const token: string = retrieveAccessTokenFromSession(session) as string;
    expect(token).not.toBeUndefined();
    expect(token).toEqual(accessTokenValue);
  });

  it("should throw error when token is absent", () => {
    const session: Session = new Session();
    expect(() => {
      retrieveAccessTokenFromSession(session);
    }).toThrow();
  });

  it("should throw error when token is empty", () => {
    const session: Session = new Session();
    session.data = {
      signin_info: {
        access_token: {},
      },
    };
    expect(() => {
      retrieveAccessTokenFromSession(session);
    }).toThrow();
  });
});
