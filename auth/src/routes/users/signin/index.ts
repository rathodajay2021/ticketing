import { UserController } from "controller/users";
import { Router } from "express";
import { validateRequest } from "@articketing2021/common";
import { signInValidation } from "validators/users/signIn";

const router = Router();

router
  .route("/")
  .post(signInValidation, validateRequest, new UserController().signIn);

export default router;
