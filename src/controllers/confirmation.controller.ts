import { Session } from "ch-node-session-handler";
import { UserProfileKeys } from "ch-node-session-handler/lib/session/keys/UserProfileKeys";
import { NextFunction, Request, Response } from "express";
import { SESSION_OBJECTION_ID } from "../constants";
import { Templates } from "../model/template.paths";
import { retrieveFromObjectionSession, retrieveUserProfileFromSession } from "../services/objection.session.service";

export const get = (req: Request, res: Response, next: NextFunction) => {
    const session: Session | undefined  = req.session;
    if (session) {
        const userProfile = retrieveUserProfileFromSession(session);
        const email: string = userProfile[UserProfileKeys.Email] as string;
        const objectionId: string = retrieveFromObjectionSession(session, SESSION_OBJECTION_ID);

        return res.render(Templates.CONFIRMATION, {
            email,
            objectionId,
            templateName: Templates.CONFIRMATION,
        });
    } else {
        return next(new Error("No Session present"));
    }
};
