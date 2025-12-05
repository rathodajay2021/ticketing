import { body, param } from "express-validator";

export const createTicket = [
  body("title")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Title is required and must be a valid string"),
  body("price")
    .trim()
    .notEmpty()
    .isFloat({ gt: 0 }) // ✅ ensures price is a positive number
    .withMessage("Price must be a positive number"),
];

export const getTicketById = [
  param("ticketId").notEmpty().withMessage("Ticket Id is required"),
];

export const updateTicketById = [
  body("title")
    .optional() // ✅ field is not required
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Title must be a valid non-empty string"),
  body("price")
    .optional() // ✅ field is not required
    .isFloat({ gt: 0 }) // ✅ must be positive if provided
    .withMessage("Price must be a positive number"),
  param("ticketId").notEmpty().isString().withMessage("Ticket Id is required"),
];
