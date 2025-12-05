import express, { Router } from "express";
import { TicketController } from "controller/tickets";
import { requireAuth, validateRequest } from "@articketing2021/common";
import {
  createTicket,
  getTicketById,
  updateTicketById,
} from "validation/Ticketing";

const routes: Router = express.Router();
const controller = new TicketController();

routes
  .route("/")
  .post(requireAuth, createTicket, validateRequest, controller.createTicket);
routes.route("/").get(controller.getTickets);
routes
  .route("/:ticketId")
  .get(getTicketById, validateRequest, controller.getTicketById);
routes
  .route("/:ticketId")
  .put(
    requireAuth,
    updateTicketById,
    validateRequest,
    controller.updateTicket
  );

export default routes;
