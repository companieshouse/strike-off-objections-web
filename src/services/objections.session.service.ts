import { Session } from "ch-node-session-handler";
import { Request } from "express";
import { SESSION } from "../constants";
import logger from "../utils/logger";

export const createObjectionsSession = (session: Session) => {
    session.data[SESSION] = {};
};

export const addToObjectionsSession = (session: Session, key: string, value: any) => {
    session.data[SESSION][key] = value;
};

export const getValueFromObjectionsSession = (session: Session, key: string) => {
    return session.data[SESSION][key];
};

export const getValidAccessToken = (session: Session): string | undefined => {
    const signIn = session.data.signin_info;
    if (signIn && signIn.access_token) {
        return signIn.access_token.access_token as string;
    } else {
        logger.error("Access token is missing");
    }
    return undefined;
};
