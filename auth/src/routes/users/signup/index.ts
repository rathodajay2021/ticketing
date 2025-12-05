import { signupValidation } from "validators/users/signup";
import { Router } from "express";
import { UserController } from "controller/users";
import { validateRequest } from "@articketing2021/common";

const router = Router();

router
  .route("/")
  .post(signupValidation, validateRequest, new UserController().signUp);

export default router;
