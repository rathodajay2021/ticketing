import { NotAuthorizedError, NotFoundError } from "@articketing2021/common";
import { TicketCreatedPublisher } from "events/publisher/ticket-created-publisher";
import { TicketUpdatedPublisher } from "events/publisher/ticket-updated-publisher";
import { NextFunction, Request, Response } from "express";
import { Ticket } from "models/ticket";
import { natsWrapper } from "nats/nats-wrapper";

export class TicketController {
  async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, price } = req.body;

      const ticket = Ticket.build({
        price,
        title,
        userId: req?.currentUser?.id!,
      });
      await ticket.save();
      await new TicketCreatedPublisher(natsWrapper.client).pub({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version,
      });

      res.status(201).send(ticket);
    } catch (error) {
      console.log("🚀 ~ TicketController ~ createTicket ~ error:", error);
      next(error);
    }
  }

  async getTicketById(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params;
      const ticket = await Ticket.findById(ticketId);

      if (!ticket) throw new NotFoundError();

      res.send(ticket);
    } catch (error) {
      next(error);
    }
  }

  async getTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await Ticket.find({});

      res.send(response);
    } catch (error) {
      next(error);
    }
  }

  async updateTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params;
      const { title, price } = req.body;

      const ticket = await Ticket.findById(ticketId);

      if (!ticket) throw new NotFoundError();

      if (ticket.userId !== req.currentUser?.id) throw new NotAuthorizedError();

      if (title !== undefined) ticket.title = title;
      if (price !== undefined) ticket.price = price;

      await ticket.save();

      new TicketUpdatedPublisher(natsWrapper.client).pub({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version,
      });

      res.send(ticket);
    } catch (error) {
      console.log("🚀 ~ TicketController ~ updateTicket ~ error:", error);
      next(error);
    }
  }
}
