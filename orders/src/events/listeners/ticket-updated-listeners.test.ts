import { natsWrapper } from "nats/nats-wrapper";
import { TicketUpdatedListener } from "./ticket-update-listeners";
import { TicketUpdatedEvent } from "@articketing2021/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { id } from "zod/v4/locales";
import { Ticket } from "models/ticket";

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: "title",
    price: 20,
  });
  await ticket.save();

  // create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "new title",
    price: 50,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return all of this stuff
  return { listener, data, msg, ticket };
};

it("finds, updates, and saves a ticket", async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("test message acknowledgement", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("it does not call ack if the event has a skipped version number", async () => {
  const { listener, data, msg, ticket } = await setup();

  try {
    await listener.onMessage({ ...data, version: data.version + 1 }, msg);
  } catch (error) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
