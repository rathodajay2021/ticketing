import { type Express } from "express";
import orderRoutes from "./orders";
import { NotFoundError } from "@articketing2021/common";

export const routes = (app: Express) => {
  app.use("/api/orders", orderRoutes);
  app.use(async (req, res, next) => {
    return next(new NotFoundError())
  })
};
