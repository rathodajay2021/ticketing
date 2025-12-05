import request, { Test } from "supertest";
import TestAgent from "supertest/lib/agent";
import { app } from "app";

export const signup = async ({
  email: loginEmail,
  password: loginPassword,
  agent,
  expectStatusCode = 201
}: {
  email?: string;
  password?: string;
  agent?: TestAgent<Test>;
  expectStatusCode?: number
}) => {
  const email = loginEmail ?? "test@test.com";
  const password = loginPassword ?? "password";

  const response = await (agent ?? request(app))
    .post("/api/users/signup")
    .send({ email, password })
    .expect(expectStatusCode);

  return { response, cookie: response.get("Set-Cookie") };
};
