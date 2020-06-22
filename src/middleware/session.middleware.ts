import { SessionMiddleware, SessionStore } from "ch-node-session-handler";
import Redis from "ioredis";
import { CACHE_SERVER, COOKIE_DOMAIN, COOKIE_NAME, COOKIE_SECRET } from "../properties";

const redis = new Redis(CACHE_SERVER);
const sessionStore = new SessionStore(redis);

const sessionMiddleware = SessionMiddleware({
  cookieDomain: COOKIE_DOMAIN,
  cookieName: COOKIE_NAME,
  cookieSecret: COOKIE_SECRET,
  cookieSecureFlag: undefined,
  cookieTimeToLiveInSeconds: undefined,
}, sessionStore);

export default sessionMiddleware;
