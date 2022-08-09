import { Session } from "@companieshouse/node-session-handler";
import { SIGNOUT_RETURN_URL_SESSION_KEY } from "../constants";
import { Handler, NextFunction, Request, Response } from "express";
import { ACCOUNTS_SIGNOUT_PATH } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import logger from "../utils/logger";
import { ACCOUNT_URL } from "../utils/properties";

export const get: Handler = async (req, res) => {
    console.log(`Account url: ${ACCOUNT_URL}`)
    const returnPage = saveReturnPageInSession(req)

    res.render(Templates.SIGNOUT, {
        backLinkUrl: returnPage
    });
}

export const post: Handler = async (req, res, next: NextFunction) => {
    const returnPage = getReturnPageFromSession(req.session as Session)
    console.log(`Return page: ${returnPage}`)
    try {
        switch (req.body.signout) {
            case "yes": 
                console.log("Yes option"); 
                return res.redirect(ACCOUNTS_SIGNOUT_PATH);
            case "no": 
                console.log("No option"); 
                return res.redirect(returnPage);
            default: 
                console.log("No input selected"); 
                return showMustSelectButtonError(res, returnPage);
        }
    } catch (e) {
        next(e);
    }
}

function saveReturnPageInSession(req: Request): string {
    const returnPageUrl = req.headers.referer!
    req.session?.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, returnPageUrl)
    return returnPageUrl;
}

function getReturnPageFromSession(session: Session): string {
    const returnPage = session?.getExtraData(SIGNOUT_RETURN_URL_SESSION_KEY) as string | undefined
    if (returnPage !== undefined && typeof returnPage === 'string') return returnPage

    logger.error(`Unable to find page to return the user to. ` 
        + `It should have been a string value stored in the session extra data with key signout-return-to-url. ` 
        + `However, ${JSON.stringify(returnPage)} was there instead.`)

    throw new Error(`Cannot find url of page to return user to.`)
}

function showMustSelectButtonError(res: Response, returnPage: string) {
    res.status(400);
    return res.render(Templates.SIGNOUT, {
        backLinkUrl: returnPage,
        noInputSelectedError: true
    });
}