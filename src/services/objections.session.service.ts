import { Session } from "ch-node-session-handler";
import { OBJECTIONS_SESSION } from "../constants";

export const createObjectionsSession = (session: Session) => {
    session.data[OBJECTIONS_SESSION] = {};
};

export const addToObjectionsSession = (session: Session, key: string, value: any) => {
    session.data[OBJECTIONS_SESSION][key] = value;
};

export const getValueFromObjectionsSession = (session: Session, key: string) => {
    return session.data[OBJECTIONS_SESSION][key];
};
