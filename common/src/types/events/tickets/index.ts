import { Subjects } from "@src/types/events";
import { Types } from "mongoose";

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: Types.ObjectId;
    title: string;
    price: number;
    userId: string;
    version: number;
  };
}

export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;
  data: {
    id: Types.ObjectId;
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
  };
}
