import { SessionMiddleware, SessionStore, EnsureSessionCookiePresentMiddleware } from "@companieshouse/node-session-handler";
import { COOKIE_DOMAIN, COOKIE_NAME, COOKIE_SECRET, COOKIE_SECURE_FLAG } from "../utils/properties";

export const createSessionMiddleware = (sessionStore: SessionStore) => SessionMiddleware({
  cookieDomain: COOKIE_DOMAIN,
  cookieName: COOKIE_NAME,
  cookieSecret: COOKIE_SECRET,
  cookieSecureFlag: COOKIE_SECURE_FLAG !== "0", 
  cookieTimeToLiveInSeconds: undefined,
}, sessionStore, true);

export const createEnsureSessionCookiePresentMiddleware = () => EnsureSessionCookiePresentMiddleware({
  cookieName: COOKIE_NAME
});
