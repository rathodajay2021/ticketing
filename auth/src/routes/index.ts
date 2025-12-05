import { type Express } from "express";
import userRoutes from "./users";
import { NotFoundError } from "@articketing2021/common";

export const routes = (app: Express) => {
  app.use("/api/users", userRoutes);
  app.use(async (req, res, next) => {
    return next(new NotFoundError());
  });
};
