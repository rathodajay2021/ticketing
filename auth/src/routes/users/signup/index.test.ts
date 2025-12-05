import request, { Test } from "supertest";
import { app } from "app";
import TestAgent from "supertest/lib/agent";
import { signup } from "test/utils";

let agent: TestAgent<Test>;

beforeEach(() => {
  agent = request.agent(app); // new agent for each test
});

const email = "test@test.com";
const password = "password";

describe("signUp route", () => {
  it("returns 201 on successful signup", async () => {
    await signup({ agent, email, password });
  });

  it("disallows duplicate emails", async () => {
    await signup({ agent, email, password });
    await signup({ agent, email, password, expectStatusCode: 400 });
  });

  it("sets a cookie after successful signup", async () => {
    const { response } = await signup({ agent, email, password });

    expect(response.get("Set-Cookie")).toBeDefined();
  });
});
