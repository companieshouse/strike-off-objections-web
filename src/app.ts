import cookieParser from "cookie-parser";
import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import { checkServiceAvailability } from "./availability/middleware/service.availability";
import { APP_NAME } from "./constants";
import logger from "./logger";
import authenticationMiddleware from "./middleware/authentication.middleware";
import sessionMiddleware from "./middleware/session.middleware";
import * as pageURLs from "./model/page.urls";
import router from "./routes/routes";

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

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
app.use(express.static(path.join(__dirname, "public")));

app.use(checkServiceAvailability);
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(`${pageURLs.STRIKE_OFF_OBJECTIONS}/*`, authenticationMiddleware);
// apply our default router to /
app.use(pageURLs.STRIKE_OFF_OBJECTIONS, router);

logger.info(`************** ${APP_NAME} has started **************`);

export default app;
