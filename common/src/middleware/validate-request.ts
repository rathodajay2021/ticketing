import { type Request, type Response, type NextFunction } from "express";
import { validationResult } from "express-validator";
import { RequestValidationError } from "@src/errors/request-validation-error";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new RequestValidationError(errors.array()));
  }

  next();
};
