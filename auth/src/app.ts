import express from "express";
import { json } from "body-parser";
import { routes } from "routes";
import { errorHandler } from "@articketing2021/common";

import cookieSession from "cookie-session";

import "./utils/env";

const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false, //for no encryption
    secure: process.env.NODE_ENV !== "test", //use cookie only if user use https connection
  })
);

routes(app);

app.use(errorHandler);

export { app };
