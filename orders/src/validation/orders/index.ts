import { body } from "express-validator";

export const createOrder = [
  body("ticketId")
    .not()
    .isEmpty()
    .withMessage("TicketId is required")
    .isMongoId()
    .withMessage("Provide valid TicketId"),
];
