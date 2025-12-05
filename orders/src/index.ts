import { app } from "app";
import mongoose from "mongoose";
import { natsWrapper } from "nats/nats-wrapper";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "events/listeners/ticket-created-listeners";
import { TicketUpdatedListener } from "events/listeners/ticket-update-listeners";

const start = async () => {
  // await mongoose.connect('mongodb://localhost')
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://orders-mongo-srv:27017/orders"
    );
    console.log("connected to mongo db", process.env.MONGO_URI);
  } catch (error) {
    console.log("🚀 ~ mongoose start ~ error:", error);
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID || randomBytes(8).toString("hex"),
      process.env.NATS_URL
    );

    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
  } catch (error) {
    console.log("🚀 ~ start ~ error:", error);
  }

  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
};

start();
