import request, { Test } from "supertest";
import TestAgent from "supertest/lib/agent";
import { app } from "app";
import { signup } from "test/utils";

// in supertest it don't send cookie automatically like in browser or postman so either you have to use agent or set manually
let agent: TestAgent<Test>;

beforeEach(() => {
  agent = request.agent(app); // new agent for each test
});

describe("signout", () => {
  it("clears the cookie after sign out", async () => {
    await signup({ agent });

    const response = await agent.get("/api/users/signout").send({}).expect(200);

    //if you want to check exact cookie struct but if you want generic just check set cookie defined
    const cookie = response.get("Set-Cookie");
    if (!cookie) {
      throw new Error("Expected cookie but got undefined.");
    }

    expect(cookie[0]).toEqual(
      "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
    );

    // expect(response.get("Set-Cookie")).toBeDefined();
  });
});
