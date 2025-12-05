import { app } from "app";
import request, { Test } from "supertest";
import TestAgent from "supertest/lib/agent";
import { signup } from "test/utils";

let agent: TestAgent<Test>;

beforeEach(() => {
  agent = request.agent(app); // new agent for each test
});

const email = "test@test.com";
const password = "password";

describe("sign-in route", () => {
  it("input field validation", async () => {
    await agent
      .post("/api/users/signin")
      .send({
        email: "testtest.com",
        password: "password",
      })
      .expect(400);

    agent
      .post("/api/users/signin")
      .send({
        email: "test@test.com",
      })
      .expect(400);
  });

  it("fails when logic in with email that don't exist", async () => {
    return agent
      .post("/api/users/signin")
      .send({
        email,
        password,
      })
      .expect(400);
  });

  it("it fails when incorrect password is provided", async () => {
    await signup({ agent, email, password });

    return agent
      .post("/api/users/signin")
      .send({
        email,
        password: "incorrect-password",
      })
      .expect(400);
  });

  it("respond with cookie when login with valid credentials", async () => {
    await signup({ agent, email, password });

    const response = await agent
      .post("/api/users/signin")
      .send({
        email,
        password,
      })
      .expect(200);

    expect(response.get("Set-Cookie")).toBeDefined();
  });
});
