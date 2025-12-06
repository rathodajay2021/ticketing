import { Listener, NotFoundError, OrderCreatedEvent, Subjects } from "@articketing2021/common";
import { queueGroupName } from "constants/events";
import { Message } from "node-nats-streaming";
import { Ticket } from "models/ticket";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if(!ticket) throw new NotFoundError();

    ticket.set({ orderId: data.id });

    await ticket.save();
    msg.ack();
  }
}
