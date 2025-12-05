import { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "@src/errors/custom-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json(err.serializeErrors());
  }

  console.error("error: ", err);

  res.status(500).send({
    message: err.message ?? "Something went wrong",
  });
};
