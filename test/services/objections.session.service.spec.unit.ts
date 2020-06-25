import { Session } from "ch-node-session-handler";
import { SESSION } from "../../src/constants";
import * as objectionsSessionService from "../../src/services/objections.session.service";
import { getValidAccessToken } from "../../src/services/objections.session.service";

const testKey: string = "testKey";
const testValue: string = "00006400";
const accessTokenValue = "tokenABC123";

describe ("objections session service tests", () => {
    it("should create a new empty objections session", async () => {
        const session: Session = new Session();
        expect(session.data[SESSION]).toBeFalsy();
        await objectionsSessionService.createObjectionsSession(session);
        expect(session.data[SESSION]).toBeTruthy();
    });

    it("should replace an existing objections session if one exists", async () => {
        const session: Session = new Session();
        await objectionsSessionService.createObjectionsSession(session);
        expect(session.data[SESSION]).toBeTruthy();
        session.data[SESSION][testKey] = testValue;

        await objectionsSessionService.createObjectionsSession(session);
        expect(session.data[SESSION][testKey]).toBeFalsy();
    });

    it("should update the objections session successfully", async () => {
        const session: Session = new Session();
        await objectionsSessionService.createObjectionsSession(session);
        expect(session.data[SESSION]).toBeTruthy();

        await objectionsSessionService.addToObjectionsSession(session, testKey, testValue);
        expect(session.data[SESSION][testKey]).toEqual(testValue);

        const newValue: string = "10";
        await objectionsSessionService.addToObjectionsSession(session, testKey, newValue);
        expect(session.data[SESSION][testKey]).toEqual(newValue);
    });

    it("should retrieve from the objections session successfully", async () => {
        const session: Session = new Session();
        await objectionsSessionService.createObjectionsSession(session);
        expect(session.data[SESSION]).toBeTruthy();

        await objectionsSessionService.addToObjectionsSession(session, testKey, testValue);
        const gotFromSessionValue: string = objectionsSessionService.getValueFromObjectionsSession(session, testKey);
        expect(gotFromSessionValue).toEqual(testValue);
    });

    it("should retieve access token when present in the session", async () => {
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

    it("should receive undefined when token is absent", async () => {
        const session: Session = new Session();
        const token: string = getValidAccessToken(session) as string;
        expect(token).toBeUndefined();
    });

    it("should receive undefined when token is empty", async () => {
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
