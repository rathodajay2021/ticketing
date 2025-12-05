import request, { Test } from "supertest";
import { app } from "app";
import TestAgent from "supertest/lib/agent";
import { signup } from "test/utils";

let agent: TestAgent<Test>;

beforeEach(() => {
  agent = request.agent(app); // new agent for each test
});

describe("current-user", () => {
  it("responds with details about the current user", async () => {
    await signup({ agent });

    return agent.get("/api/users/current-user").send().expect(200);
  });

  it("response with null if not authenticated", async () => {
    const response = await agent
      .get("/api/users/current-user")
      .send()
      .expect(401);

    expect(response.body.current).toEqual(undefined);
  });
});
