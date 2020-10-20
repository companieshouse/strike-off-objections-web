import cookieParser from "cookie-parser";
import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import { APP_NAME } from "./constants";
import  errorHandlers from "./controllers/error.controller";
import { authenticationMiddleware } from "./middleware/authentication.middleware";
import { objectionSessionMiddleware } from "./middleware/objection.session.middleware";
import { serviceAvailabilityMiddleware } from "./middleware/service.availability.middleware";
import { sessionMiddleware } from "./middleware/session.middleware";
import { ErrorMessages } from "./model/error.messages";
import * as pageURLs from "./model/page.urls";
import { router } from "./routes/routes";
import logger from "./utils/logger";

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
env.addGlobal("PIWIK_URL", process.env.PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", process.env.PIWIK_SITE_ID);
env.addGlobal("ERROR_SUMMARY_TITLE", ErrorMessages.ERROR_SUMMARY_TITLE);

app.enable("trust proxy");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
app.use(express.static(path.join(__dirname, "public")));

app.use(serviceAvailabilityMiddleware);
app.use(cookieParser());
app.use(`${pageURLs.STRIKE_OFF_OBJECTIONS}/*`, sessionMiddleware);
app.use(`${pageURLs.STRIKE_OFF_OBJECTIONS}/*`, authenticationMiddleware);
app.use(`${pageURLs.STRIKE_OFF_OBJECTIONS}/*(?<!download)$`, objectionSessionMiddleware);
// apply our default router to /
app.use(pageURLs.STRIKE_OFF_OBJECTIONS, router);
app.use(...errorHandlers);

logger.info(`************** ${APP_NAME} has started **************`);

export default app;
