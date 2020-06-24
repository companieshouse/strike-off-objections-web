import { Session } from "ch-node-session-handler";
import { OBJECTIONS_SESSION } from "../../src/constants";
import * as objectionsSessionService from "../../src/services/objections.session.service";

const testKey: string = "testKey";
const testValue: string = "00006400";

describe ("objections session service tests", () => {
    it("should create a new empty objections session", async () => {
        const session: Session = new Session();
        expect(session.data[OBJECTIONS_SESSION]).toBeFalsy();
        await objectionsSessionService.createObjectionsSession(session);
        expect(session.data[OBJECTIONS_SESSION]).toBeTruthy();
    });

    it("should replace an existing objections session if one exists", async () => {
        const session: Session = new Session();
        await objectionsSessionService.createObjectionsSession(session);
        expect(session.data[OBJECTIONS_SESSION]).toBeTruthy();
        session.data[OBJECTIONS_SESSION][testKey] = testValue;

        await objectionsSessionService.createObjectionsSession(session);
        expect(session.data[OBJECTIONS_SESSION][testKey]).toBeFalsy();
    });

    it("should update the objections session successfully", async () => {
        const session: Session = new Session();
        await objectionsSessionService.createObjectionsSession(session);
        expect(session.data[OBJECTIONS_SESSION]).toBeTruthy();

        await objectionsSessionService.addToObjectionsSession(session, testKey, testValue);
        expect(session.data[OBJECTIONS_SESSION][testKey]).toEqual(testValue);

        const newValue: string = "10";
        await objectionsSessionService.addToObjectionsSession(session, testKey, newValue);
        expect(session.data[OBJECTIONS_SESSION][testKey]).toEqual(newValue);
    });

    it("should retrieve from the objections session successfully", async () => {
        const session: Session = new Session();
        await objectionsSessionService.createObjectionsSession(session);
        expect(session.data[OBJECTIONS_SESSION]).toBeTruthy();

        await objectionsSessionService.addToObjectionsSession(session, testKey, testValue);
        const gotFromSessionValue: string = objectionsSessionService.getValueFromObjectionsSession(session, testKey);
        expect(gotFromSessionValue).toEqual(testValue);
    });
});
