import { Session } from "@companieshouse/node-session-handler";
import { SIGNOUT_RETURN_URL_SESSION_KEY } from "../constants";
import { Handler, NextFunction, Request, Response } from "express";
import { ACCOUNTS_SIGNOUT_PATH } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import logger from "../utils/logger";

export const get: Handler = async (req, res) => {
    const returnPage = saveReturnPageInSession(req)

    res.render(Templates.SIGNOUT, {
        backLinkUrl: returnPage
    });
}

export const post = handleError(async (req, res) => {
    const returnPage = getReturnPageFromSession(req.session as Session)

    switch (req.body.signout) {
    case "yes":
        return res.redirect(ACCOUNTS_SIGNOUT_PATH);
    case "no":
        return res.redirect(returnPage);
    default:
        return showMustSelectButtonError(res, returnPage);
    }
})

// Async version of express handler so that static analysers don't complain that an await statement 
// isn't needed when it is.
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

// Wraps a handler function to catch any exceptions and pass them to the next handler in the chain.
function handleError(handler: AsyncHandler): AsyncHandler {
    return async (req, res, next) => {
        try {
            await handler(req, res, next)
        } catch (e) {
            next(e);
        }
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