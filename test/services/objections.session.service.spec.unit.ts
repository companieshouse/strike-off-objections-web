import { Session } from "ch-node-session-handler";
import { OBJECTIONS_SESSION } from "../../src/constants";
import * as objectionsSessionService from "../../src/services/objections.session.service";
import { getValidAccessToken } from "../../src/services/objections.session.service";

const testKey: string = "testKey";
const testValue: string = "00006400";
const accessTokenValue = "tokenABC123";

describe ("objections session service tests", () => {
    it("should create a new empty objections session", () => {
        const session: Session = new Session();
        expect(session.data[OBJECTIONS_SESSION]).toBeFalsy();
        objectionsSessionService.createObjectionsSession(session);
        expect(session.data[OBJECTIONS_SESSION]).toBeTruthy();
    });

    it("should replace an existing objections session if one exists", () => {
        const session: Session = new Session();
        objectionsSessionService.createObjectionsSession(session);
        expect(session.data[OBJECTIONS_SESSION]).toBeTruthy();
        session.data[OBJECTIONS_SESSION][testKey] = testValue;

        objectionsSessionService.createObjectionsSession(session);
        expect(session.data[OBJECTIONS_SESSION][testKey]).toBeFalsy();
    });

    it("should update the objections session successfully", () => {
        const session: Session = new Session();
        objectionsSessionService.createObjectionsSession(session);
        expect(session.data[OBJECTIONS_SESSION]).toBeTruthy();

        objectionsSessionService.addToObjectionsSession(session, testKey, testValue);
        expect(session.data[OBJECTIONS_SESSION][testKey]).toEqual(testValue);

        const newValue: string = "10";
        objectionsSessionService.addToObjectionsSession(session, testKey, newValue);
        expect(session.data[OBJECTIONS_SESSION][testKey]).toEqual(newValue);
    });

    it("should retrieve from the objections session successfully", () => {
        const session: Session = new Session();
        objectionsSessionService.createObjectionsSession(session);
        expect(session.data[OBJECTIONS_SESSION]).toBeTruthy();

        objectionsSessionService.addToObjectionsSession(session, testKey, testValue);
        const gotFromSessionValue: string = objectionsSessionService.getValueFromObjectionsSession(session, testKey);
        expect(gotFromSessionValue).toEqual(testValue);
    });

    it("should retieve access token when present in the session", () => {
        const session: Session = new Session();
        session.data = {
            signin_info: {
                access_token: {
                    access_token: accessTokenValue,
                },
            },
        };
        const token: string = getValidAccessToken(session) as string;
        expect(token).not.toBeUndefined();
        expect(token).toEqual(accessTokenValue);
    });

    it("should receive undefined when token is absent", () => {
        const session: Session = new Session();
        const token: string = getValidAccessToken(session) as string;
        expect(token).toBeUndefined();
    });

    it("should receive undefined when token is empty", () => {
        const session: Session = new Session();
        session.data = {
            signin_info: {
                access_token: {},
            },
        };
        const token: string = getValidAccessToken(session) as string;
        expect(token).toBeUndefined();
    });
});
