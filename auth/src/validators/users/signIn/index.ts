import { body } from "express-validator";

const signIn = [
  body("email").isEmail().withMessage("Enter valid email id"),
  body("password").trim().notEmpty().withMessage("You must supply a password"),
];

export { signIn as signInValidation };
