import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  HttpStatus,
} from "@articketing2021/common";
import { EXPIRATION_WINDOW_SECONDS } from "constants/orders";
import { type NextFunction, type Request, type Response } from "express";
import { Order } from "models/order";
import { Ticket } from "models/ticket";
import { natsWrapper } from "nats/nats-wrapper";
import { OrderCreatedPublisher } from "events/publisher/order-created-publisher";
import { OrderCreatedCancelled } from "events/publisher/order-cancelled-publisher";

export class OrdersController {
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await Order.find({
        userId: req.currentUser?.id,
      }).populate("ticket");

      res.send(orders);
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await Order.findById(req.params.orderId).populate("ticket");

      if (!order) throw new NotFoundError();

      if (order.userId !== req.currentUser?.id) throw new NotAuthorizedError();

      res.send(order);
    } catch (error) {
      next(error);
    }
  }

  async createNew(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.body;

      const ticket = await Ticket.findById(ticketId);

      if (!ticket) throw new NotFoundError();

      const isReserved = await ticket.isReserved();

      if (isReserved) throw new BadRequestError("Ticket is already reserved");

      const expiration = new Date();
      expiration.setSeconds(
        expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS,
      );

      if (!req.currentUser?.id) throw new NotAuthorizedError();

      const order = Order.build({
        userId: req.currentUser.id,
        expiresAt: expiration,
        status: OrderStatus.Created,
        ticket,
      });

      await order.save();

      new OrderCreatedPublisher(natsWrapper.client).pub({
        id: order.id,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        version: order.version,
        ticket: {
          id: ticket.id,
          price: ticket.price,
        },
      });

      res.status(HttpStatus.Created).send(order);
    } catch (error) {
      console.log("🚀 ~ OrdersController ~ createNew ~ error:", error);
      next(error);
    }
  }

  async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await Order.findById(req.params.orderId).populate("ticket");

      if (!order) throw new NotFoundError();

      if (order.userId !== req.currentUser?.id) throw new NotAuthorizedError();

      order.status = OrderStatus.Cancelled;
      await order.save();

      new OrderCreatedCancelled(natsWrapper.client).pub({
        id: order.id,
        version: order.version,
        ticket: {
          id: order.ticket.id.toString(),
        },
      });

      res.status(HttpStatus.NoContent).send();
    } catch (error) {
      next(error);
    }
  }
}
