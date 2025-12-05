import { Subjects } from "..";

export enum OrderStatus {
  // when the order has been created,  but the ticket it is trying to order has not been reserved
  Created = "created",

  // The ticket the order is tying to reserve has already been reserved, or when the user has cancelled the order
  // The order has been expired before payment
  Cancelled = "cancelled",

  // The order has successfully reserved the ticket
  AwaitingPayment = "awaiting:payment",

  // The order has reserved the ticket and the user has provided payment successfully
  Complete = "complete",
}

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  data: {
    id: string;
    version: number;
    ticket: {
      id: string;
    };
  };
}

export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated;
  data: {
    id: string;
    status: OrderStatus;
    userId: string;
    expiresAt: string;
    version: number;
    ticket: {
      id: string;
      price: number;
    };
  };
}
