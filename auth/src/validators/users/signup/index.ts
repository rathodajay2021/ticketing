import { body } from "express-validator";

const signup = [
  body("email").isEmail().withMessage("Enter valid email id"),
  body("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Password must be between 4 and 20 characters"),
];

export {
    signup as signupValidation
}