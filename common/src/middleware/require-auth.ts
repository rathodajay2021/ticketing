import { NotAuthorizedError } from "@src/errors/not-authorized-error";
import { NextFunction, Request, Response } from "express";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    return next(new NotAuthorizedError());
  }

  next();
};
