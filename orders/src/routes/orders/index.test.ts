import { HttpStatus, OrderStatus } from "@articketing2021/common";
import { app } from "app";
import { Order } from "models/order";
import { Ticket } from "models/ticket";
import mongoose, { Types } from "mongoose";
import request from "supertest";
import { signup } from "test/utils";
import { natsWrapper } from "__mocks__/nats/nats-wrapper";

const buildTicket = async (ticketId?: Types.ObjectId) => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    id: ticketId || new mongoose.Types.ObjectId(),
  });

  await ticket.save();

  return ticket;
};

describe("create order - post request /api/orders", () => {
  describe("basic route test", () => {
    it("has a route handler listing to /api/orders for post request", async () => {
      const response = await request(app).post("/api/orders").send({});

      expect(response.status).not.toEqual(HttpStatus.NotFound);
    });

    it("can only be access if the user is signed in", async () => {
      await request(app).post("/api/orders").send({}).expect(401);
    });

    it("returns status other than 401 if the user is signed in", async () => {
      const response = await request(app)
        .post("/api/orders")
        .set("Cookie", signup())
        .send({});

      expect(response).not.toEqual(HttpStatus.Unauthorized);
    });

    it("returns an error if an invalid ticketId is provided", async () => {
      await request(app)
        .post("/api/orders")
        .send({ ticketId: "" })
        .set("Cookie", signup())
        .expect(HttpStatus.BadRequest);
    });
  });

  describe("route controller logic test", () => {
    it("returns an error if the ticket does not exist", async () => {
      const ticketId = new mongoose.Types.ObjectId();
      await request(app)
        .post("/api/orders")
        .send({ ticketId })
        .set("Cookie", signup())
        .expect(HttpStatus.NotFound);
    });

    it("returns an error if the ticket already reserved", async () => {
      const ticket = await buildTicket();

      const order = Order.build({
        ticket,
        userId: "fgsdfg",
        status: OrderStatus.Created,
        expiresAt: new Date(),
      });

      await order.save();

      await request(app)
        .post("/api/orders")
        .send({ ticketId: ticket.id })
        .set("Cookie", signup())
        .expect(HttpStatus.BadRequest);
    });

    it("reserves a ticket", async () => {
      const ticket = await buildTicket();

      await request(app)
        .post("/api/orders")
        .set("Cookie", signup())
        .send({ ticketId: ticket.id })
        .expect(HttpStatus.Created);
    });
  });

  it("emits an order created event", async () => {
    const ticket = await buildTicket();

    await request(app)
      .post("/api/orders")
      .set("Cookie", signup())
      .send({ ticketId: ticket.id })
      .expect(HttpStatus.Created);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});

describe("get orders - get request /api/orders", () => {
  describe("basic route test", () => {
    it("has a route handler listing to /api/orders for post request", async () => {
      const response = await request(app).post("/api/orders").send({});

      expect(response.status).not.toEqual(HttpStatus.NotFound);
    });

    it("can only be access if the user is signed in", async () => {
      await request(app)
        .post("/api/orders")
        .send({})
        .expect(HttpStatus.Unauthorized);
    });

    it("returns status other than 401 if the user is signed in", async () => {
      const response = await request(app)
        .post("/api/orders")
        .set("Cookie", signup())
        .send({});

      expect(response).not.toEqual(HttpStatus.Unauthorized);
    });
  });

  describe("route logic test", () => {
    it("fetches orders for an particular user", async () => {
      const userOneCookie = signup();
      const userTwoCookie = signup();

      const TicketOne = await buildTicket();
      const TicketTwo = await buildTicket();
      const TicketThree = await buildTicket();

      const orderOne = await request(app)
        .post("/api/orders")
        .set("Cookie", userOneCookie)
        .send({ ticketId: TicketOne.id })
        .expect(HttpStatus.Created);

      const orderTwo = await request(app)
        .post("/api/orders")
        .set("Cookie", userTwoCookie)
        .send({ ticketId: TicketTwo.id })
        .expect(HttpStatus.Created);

      const orderThree = await request(app)
        .post("/api/orders")
        .set("Cookie", userTwoCookie)
        .send({ ticketId: TicketThree.id })
        .expect(HttpStatus.Created);

      const response = await request(app)
        .get("/api/orders")
        .set("Cookie", userTwoCookie)
        .expect(HttpStatus.OK);

      expect(response.body.length).toEqual(2);
      expect(response.body[0].id).toEqual(orderTwo.body.id);
      expect(response.body[1].id).toEqual(orderThree.body.id);
      expect(response.body[0].ticket.id).toEqual(TicketTwo.id);
      expect(response.body[1].ticket.id).toEqual(TicketThree.id);
    });
  });
});

describe("get order by id - get request /api/orders/:orderId", () => {
  describe("basic route test", () => {
    it("has a route handler listing to /api/orders for post request", async () => {
      const response = await request(app).get("/api/orders/:orderId").send({});

      expect(response.status).not.toEqual(HttpStatus.NotFound);
    });

    it("can only be access if the user is signed in", async () => {
      await request(app).get("/api/orders/:orderId").send({}).expect(401);
    });

    it("returns status other than 401 if the user is signed in", async () => {
      const response = await request(app)
        .get("/api/orders/:orderId")
        .set("Cookie", signup())
        .send({});

      expect(response).not.toEqual(401);
    });
  });

  describe("route logic test", () => {
    it("get ticket", async () => {
      const ticket = await buildTicket();

      const user = signup();

      const order = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(HttpStatus.Created);

      const response = await request(app)
        .get(`/api/orders/${order.body.id}`)
        .set("Cookie", user)
        .send({})
        .expect(HttpStatus.OK);

      expect(response.body.id).toEqual(order.body.id);
    });

    it("return an 401 error if one user tries to fetch another users other user order", async () => {
      const ticket = await buildTicket();

      const user = signup();

      const order = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(HttpStatus.Created);

      const response = await request(app)
        .get(`/api/orders/${order.body.id}`)
        .set("Cookie", signup())
        .send({})
        .expect(HttpStatus.Unauthorized);
    });

    it("return an 404 error if one user tries to fetch order with invalid orderId", async () => {
      await request(app)
        .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
        .set("Cookie", signup())
        .send({})
        .expect(HttpStatus.NotFound);
    });
  });
});

describe("delete order by id - delete request /api/orders/:orderId", () => {
  describe("basic route test", () => {
    it("has a route handler listing to /api/orders for post request", async () => {
      const response = await request(app)
        .delete("/api/orders/:orderId")
        .send({});

      expect(response.status).not.toEqual(HttpStatus.NotFound);
    });

    it("can only be access if the user is signed in", async () => {
      await request(app).delete("/api/orders/:orderId").send({}).expect(401);
    });

    it("returns status other than 401 if the user is signed in", async () => {
      const response = await request(app)
        .delete("/api/orders/:orderId")
        .set("Cookie", signup())
        .send({});

      expect(response).not.toEqual(401);
    });
  });

  describe("route logic test", () => {
    it("return an 404 error if one user tries to delete order with invalid orderId", async () => {
      await request(app)
        .delete(`/api/orders/${new mongoose.Types.ObjectId()}`)
        .set("Cookie", signup())
        .send({})
        .expect(HttpStatus.NotFound);
    });

    it("return an 401 error if one user tries to fetch another users other user order", async () => {
      const ticket = await buildTicket();

      const user = signup();

      const order = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(HttpStatus.Created);

      const response = await request(app)
        .delete(`/api/orders/${order.body.id}`)
        .set("Cookie", signup())
        .send({})
        .expect(HttpStatus.Unauthorized);
    });

    it("delete ticket", async () => {
      const ticket = await buildTicket();

      const user = signup();

      const order = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(HttpStatus.Created);

      await request(app)
        .delete(`/api/orders/${order.body.id}`)
        .set("Cookie", user)
        .send({})
        .expect(HttpStatus.NoContent);

      const response = await Order.findById(order.body.id);

      expect(response!.status).toEqual(OrderStatus.Cancelled);
    });

    it("emits an order cancelled event", async () => {
      const ticket = await buildTicket();

      const user = signup();

      const order = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(HttpStatus.Created);

      await request(app)
        .delete(`/api/orders/${order.body.id}`)
        .set("Cookie", user)
        .send({})
        .expect(HttpStatus.NoContent);

      const response = await Order.findById(order.body.id);

      expect(response!.status).toEqual(OrderStatus.Cancelled);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
