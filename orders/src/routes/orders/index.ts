import { requireAuth, validateRequest } from "@articketing2021/common";
import { OrdersController } from "controller/orders";
import express, { Router } from "express";
import { createOrder } from "validation/orders";

const routes: Router = express.Router();

const controller = new OrdersController();

routes.route("/").get(requireAuth, controller.getOrders);
routes.route("/:orderId").get(requireAuth, controller.getOrder);
routes
  .route("/")
  .post(requireAuth, createOrder, validateRequest, controller.createNew);
routes
  .route("/:orderId")
  .delete(requireAuth, controller.deleteOrder);

export default routes;
