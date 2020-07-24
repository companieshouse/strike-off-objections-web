import { Session } from "ch-node-session-handler";
import { IUserProfile } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import {
  retrieveAccessTokenFromSession,
  retrieveUserProfileFromSession,
} from "../../src/services/objection.session.service";

const accessTokenValue = "tokenABC123";

describe ("objections session service tests", () => {

  it("should retrieve user profile when present in the session", () => {
    const session: Session = new Session();
    session.data = {
      signin_info: {
        user_profile: {
          email: "demo@ch.gov.uk",
          forename: "Joe",
          surname: "Bloggs",
        },
      },
    };
    const userProfile: IUserProfile = retrieveUserProfileFromSession(session);
    expect(userProfile).not.toBeUndefined();
    expect(userProfile).toEqual({email: "demo@ch.gov.uk", forename: "Joe", surname: "Bloggs"});
  });

  it("should throw error when user profile is absent", () => {
    const session: Session = new Session();
    expect(() => {
      retrieveUserProfileFromSession(session);
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
