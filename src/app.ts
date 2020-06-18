import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import logger from "./logger";
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

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

app.use(express.static(path.join(__dirname, "public")));

// apply our default router to /
app.use("/strike-off-objections", router);

logger.info("************** strike-off-objections-web has started **************");

export default app;
