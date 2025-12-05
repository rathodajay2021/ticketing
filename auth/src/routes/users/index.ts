import { Router } from "express";
import currentUser from "./current-user";
import signin from './signin'
import signup from './signup'
import signout from './signout'

const router = Router();

router.get("/testing", (req, res) => res.send("working"));
router.use("/current-user", currentUser);
router.use("/signin", signin);
router.use("/signup", signup);
router.use("/signout", signout);

export default router
