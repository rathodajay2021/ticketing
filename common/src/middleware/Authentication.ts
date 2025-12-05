import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { UserLogin } from "@src/types";
import { RequestValidationError } from "@src/errors/request-validation-error";
import jwt from "jsonwebtoken";
import { BadRequestError } from "@src/errors/bad-request-error";

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
//This is my middleware
export class Authentication {
  private static async handle(
    req: Request,
    res: Response,
    next: NextFunction,
    loginType: UserLogin
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new RequestValidationError(errors.array()));
      // return next(new Error("Invalid input fields"))
      //   throw new RequestValidationError(errors.array());
    }

    if (loginType === UserLogin.LOGGED_IN) {
      if (!req.session?.jwt) {
        return next(new BadRequestError("Token is required", 401));
      }

      try {
        const payload = jwt.verify(
          req.session.jwt,
          process.env.JWT_KEY as jwt.Secret
        ) as UserPayload;

        req.currentUser = payload;
      } catch (error) {
        return next(new BadRequestError("In-valid token", 401));
      }
    }

    next();
  }

  static async blank(req: Request, res: Response, next: NextFunction) {
    Authentication.handle(req, res, next, UserLogin.OPEN_TO_ALL);
  }

  static async auth(req: Request, res: Response, next: NextFunction) {
    Authentication.handle(req, res, next, UserLogin.LOGGED_IN);
  }
}
