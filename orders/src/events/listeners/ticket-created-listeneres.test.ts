import { natsWrapper } from "nats/nats-wrapper";
import { TicketCreatedListener } from "./ticket-created-listeners";
import { TicketCreatedEvent } from "@articketing2021/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "models/ticket"

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create and fake data event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    price: 50,
    id: new mongoose.Types.ObjectId(),
    title: "title",
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("create and save an ticket", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created.
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("ack the message", async () => {
  // call setup
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure ack is called
  expect(msg.ack).toHaveBeenCalled();
});
