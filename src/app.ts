import cookieParser from "cookie-parser";
import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import { APP_NAME } from "./constants";
import authenticationMiddleware from "./middleware/authentication.middleware";
import objectionsSessionMiddleware from "./middleware/objections.session.middleware";
import serviceAvailabilityMiddleware from "./middleware/service.availability.middleware";
import sessionMiddleware from "./middleware/session.middleware";
import * as pageURLs from "./model/page.urls";
import router from "./routes/routes";
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
app.use(`${pageURLs.STRIKE_OFF_OBJECTIONS}/*`, objectionsSessionMiddleware);
// apply our default router to /
app.use(pageURLs.STRIKE_OFF_OBJECTIONS, router);

logger.info(`************** ${APP_NAME} has started **************`);

export default app;
