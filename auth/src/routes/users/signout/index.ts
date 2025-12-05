import { UserController } from "controller/users";
import { Router } from "express";
import { currentUser, requireAuth } from "@articketing2021/common";

const router = Router();

router.route("/").get(currentUser, requireAuth, new UserController().signout);

export default router;
