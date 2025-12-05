import request from "supertest";
import { app } from "app";
import { signup } from "test/utils";
import { Ticket } from "models/ticket";
import mongoose from "mongoose";
import { natsWrapper } from "__mocks__/nats/nats-wrapper";

const createTicket = async ({
  title,
  price,
}: {
  title: string;
  price: number;
}) => {
  const response = await request(app)
    .post("/api/tickets")
    .send({ title, price })
    .set("Cookie", signup())
    .expect(201);
  return response;
};

describe("create ticket", () => {
  it("has a route handler listing to /api/tickets for post request", async () => {
    const response = await request(app).post("/api/tickets").send({});

    expect(response.status).not.toEqual(404);
  });

  it("can only be access if the user is signed in", async () => {
    await request(app).post("/api/tickets").send({}).expect(401);
  });

  it("returns status other than 401 if the user is signed in", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", signup())
      .send({});

    expect(response).not.toEqual(401);
  });

  it("returns an error if an invalid title is provided", async () => {
    await request(app)
      .post("/api/tickets")
      .send({ title: "", price: 45 })
      .set("Cookie", signup())
      .expect(400);
  });

  it("returns an error if an invalid price is provided", async () => {
    await request(app)
      .post("/api/tickets")
      .send({ title: "Title", price: "price" })
      .set("Cookie", signup())
      .expect(400);

    await request(app)
      .post("/api/tickets")
      .send({ title: "Title", price: -23 })
      .set("Cookie", signup())
      .expect(400);

    await request(app)
      .post("/api/tickets")
      .send({ title: "Title" })
      .set("Cookie", signup())
      .expect(400);
  });

  it("creates a tickets with valid inputs", async () => {
    let tickets = await Ticket.find({});
    const title = "Title";
    const price = 45;

    expect(tickets.length).toEqual(0);

    await request(app)
      .post("/api/tickets")
      .send({ title, price })
      .set("Cookie", signup())
      .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(price);
    expect(tickets[0].title).toEqual(title);
  });

  it("it publish event successfully", async () => {
    let tickets = await Ticket.find({});
    const title = "Title";
    const price = 45;

    expect(tickets.length).toEqual(0);

    await request(app)
      .post("/api/tickets")
      .send({ title, price })
      .set("Cookie", signup())
      .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(price);
    expect(tickets[0].title).toEqual(title);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});

describe("get ticket by id", () => {
  it("returns 404 if ticket is not found", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${id}`).expect(404);
  });

  it("returns ticket if found", async () => {
    const title = "Title";
    const price = 45;

    const response = await request(app)
      .post("/api/tickets")
      .send({ title, price })
      .set("Cookie", signup())
      .expect(201);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
  });
});

describe("get all tickets", () => {
  it("can fetch the list of tickets", async () => {
    const title = "Title";
    const price = 45;

    await createTicket({ title, price });
    await createTicket({ title, price });
    await createTicket({ title, price });
    await createTicket({ title, price });
    await createTicket({ title, price });

    const response = await request(app).get("/api/tickets").send().expect(200);

    expect(response.body.length).toEqual(5);
  });
});

describe("update ticket", () => {
  it("returns a 401 if user is not authenticated", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        title: "title",
        price: 20,
      })
      .expect(401);
  });

  it("returns a 404 if the provided id does not exist", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .set("Cookie", signup())
      .send({
        title: "title",
        price: 20,
      })
      .expect(404);
  });

  it("returns a 401 if the user don't own the ticket", async () => {
    const response = await createTicket({ title: "Title", price: 20 });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", signup())
      .send({
        title: "title",
        price: 20,
      })
      .expect(401);
  });

  it("returns a 400 if user provide invalid title or price", async () => {
    const Cookie = signup();
    const title = "Title";
    const price = 25;

    const response = await request(app)
      .post("/api/tickets")
      .send({ title, price })
      .set("Cookie", Cookie)
      .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", Cookie)
      .send({
        title: "",
        price: 20,
      })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", Cookie)
      .send({
        title,
        price: "fsfsdf",
      })
      .expect(400);
  });

  it("it updates the ticket if provided correct inputs", async () => {
    const Cookie = signup();
    const title = "Title";
    const price = 25;

    const response = await request(app)
      .post("/api/tickets")
      .send({ title, price })
      .set("Cookie", Cookie)
      .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", Cookie)
      .send({
        title: "updatedTitle",
        price: 20,
      })
      .expect(200);

    const updatedTicket = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .expect(200);

    expect(updatedTicket.body.title).toEqual("updatedTitle");
    expect(updatedTicket.body.price).toEqual(20);
  });

  it("it publish event successfully", async () => {
    const Cookie = signup();
    const title = "Title";
    const price = 25;

    const response = await request(app)
      .post("/api/tickets")
      .send({ title, price })
      .set("Cookie", Cookie)
      .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", Cookie)
      .send({
        title: "updatedTitle",
        price: 20,
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
