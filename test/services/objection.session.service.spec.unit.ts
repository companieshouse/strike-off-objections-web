import { Session } from "ch-node-session-handler";
import {
  addObjectionCreateToObjectionSession, deleteFromObjectionSession, deleteObjectionCreateFromObjectionSession,
  retrieveAccessTokenFromSession,
  retrieveObjectionCreateFromObjectionSession,
  retrieveUserEmailFromSession,
} from "../../src/services/objection.session.service";
import { ObjectionCreate } from "../../src/modules/sdk/objections";
import { CHANGE_ANSWER_KEY, OBJECTIONS_SESSION_NAME, SESSION_OBJECTION_CREATE } from "../../src/constants";

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

  it("should retrieve objection create when present", () => {
    const session: Session = new Session();
    session.data.extra_data[OBJECTIONS_SESSION_NAME] = {};
    addObjectionCreateToObjectionSession(session, dummyObjectionCreate);
    const objectionCreate: ObjectionCreate = retrieveObjectionCreateFromObjectionSession(session);
    expect(objectionCreate).not.toBeUndefined();
    expect(objectionCreate.fullName).toEqual("Joe Bloggs");
    expect(objectionCreate.shareIdentity).toEqual(false);
  });

  it("should not retrieve objection create when objection session is not present", () => {
    const session: Session = new Session();
    expect(() => {
      retrieveObjectionCreateFromObjectionSession(session);
    }).toThrow();
  });

  it("should throw error when objection create is absent", () => {
    const session: Session = new Session();
    session.data.extra_data[OBJECTIONS_SESSION_NAME] = {};
    expect(() => {
      retrieveObjectionCreateFromObjectionSession(session);
    }).toThrow("Error: No ObjectionCreate present in ObjectionSession");
  });

  it("should delete objection create", () => {
    const session: Session = new Session();
    session.data.extra_data[OBJECTIONS_SESSION_NAME] = {};
    addObjectionCreateToObjectionSession(session, dummyObjectionCreate);
    expect(session.data.extra_data[OBJECTIONS_SESSION_NAME][SESSION_OBJECTION_CREATE]).toBe(dummyObjectionCreate);
    deleteObjectionCreateFromObjectionSession(session);
    expect(session.data.extra_data[OBJECTIONS_SESSION_NAME][SESSION_OBJECTION_CREATE]).toBeUndefined();
  });

  it("should delete key from session if present", () => {
    const session: Session = new Session();
    session.data.extra_data[OBJECTIONS_SESSION_NAME] = { [CHANGE_ANSWER_KEY]: "test" };

    deleteFromObjectionSession(session, CHANGE_ANSWER_KEY);
    expect(session.data.extra_data[OBJECTIONS_SESSION_NAME][CHANGE_ANSWER_KEY]).toBeFalsy();
  });
});

const dummyObjectionCreate: ObjectionCreate = {
  fullName: "Joe Bloggs",
  shareIdentity: false,
};
