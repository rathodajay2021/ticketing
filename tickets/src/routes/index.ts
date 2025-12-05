import { type Express } from "express";
import ticketRoutes from "./tickets";
import { NotFoundError } from "@articketing2021/common";

export const routes = (app: Express) => {
  app.use("/api/tickets", ticketRoutes);
  app.use(async (req, res, next) => {
    return next(new NotFoundError())
  })
};
