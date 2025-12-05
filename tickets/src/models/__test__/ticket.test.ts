import { Ticket } from "models/ticket";
import mongoose from "mongoose";

it("implements optimistic concurrency control", async () => {
  const ticket = Ticket.build({
    title: "Test",
    price: 23,
    userId: "123",
  });

  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  if (!firstInstance || !secondInstance) throw new Error("Ticket no found");

  firstInstance.set({ price: 10 });
  secondInstance.set({ price: 15 });

  await firstInstance.save();

  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error("should not reach here. ticket model version test");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "Test",
    price: 23,
    userId: "123",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0)
  
  await ticket.save();
  expect(ticket.version).toEqual(1)
  
  await ticket.save();
  expect(ticket.version).toEqual(2)
});
