import { SessionMiddleware, SessionStore } from "ch-node-session-handler";
import cookieParser from "cookie-parser";
import express from "express";
import Redis from "ioredis";
import * as nunjucks from "nunjucks";
import * as path from "path";
import { authMiddleware } from "web-security-node";
import { checkServiceAvailability } from "./availability/middleware/service.availability";
import logger from "./logger";
import * as pageURLs from "./model/page.urls";
import {
  CACHE_SERVER,
  COOKIE_DOMAIN,
  COOKIE_NAME,
  COOKIE_SECRET,
} from "./properties";
import router from "./routes/routes";

export const APP_NAME = "strike-off-objections-web";

const app = express();

// view engine setup
const env = nunjucks.configure([
  "views",
  "node_modules/govuk-frontend/",
  "node_modules/govuk-frontend/components/",
], {
  autoescape: true,
  express: app,
});
env.addGlobal("CDN_URL", process.env.CDN_HOST);

app.enable("trust proxy");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(checkServiceAvailability);
app.use(cookieParser());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

app.use(express.static(path.join(__dirname, "public")));

const redis = new Redis(CACHE_SERVER);
const sessionStore = new SessionStore(redis);

const sessionMiddleware = SessionMiddleware({
  cookieDomain: COOKIE_DOMAIN,
  cookieName: COOKIE_NAME,
  cookieSecret: COOKIE_SECRET,
  cookieSecureFlag: undefined,
  cookieTimeToLiveInSeconds: undefined,
}, sessionStore);

app.use(sessionMiddleware);

const authMiddlewareConfig = {
  accountWebUrl: "",
  returnUrl: `${pageURLs.STRIKE_OFF_OBJECTIONS}${pageURLs.COMPANY_NUMBER}`,
};

const signInMiddleware = authMiddleware(authMiddlewareConfig);

app.use(`${pageURLs.STRIKE_OFF_OBJECTIONS}/*`, signInMiddleware);

// apply our default router to /
app.use(pageURLs.STRIKE_OFF_OBJECTIONS, router);
logger.info(`************** ${APP_NAME} has started **************`);

export default app;
