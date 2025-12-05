import { BadRequestError } from "@articketing2021/common";
import { type NextFunction, type Request, type Response } from "express";
import { User } from "models/users";
import jwt from "jsonwebtoken";
import { Password } from "utils/password";

export class UserController {
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser)
        return next(new BadRequestError("User already exist with this e-mail"));

      // TODO: encrypt the password

      const user = User.build({ email, password });
      await user.save();

      //generate JWT
      const userJwt = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_KEY as jwt.Secret
      );

      //store it on session object
      req.session = { ...req.session, jwt: userJwt };

      res.status(201).send(user);
    } catch (error) {
      next(error);
    }
  }

  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      //step 1 check email
      const existingUser = await User.findOne({ email });

      if (!existingUser)
        return next(new BadRequestError("Invalid credentials"));
      //step 2 check password

      const hasSamePassword = await Password.compare(
        existingUser.password,
        password
      );

      if (!hasSamePassword)
        return next(new BadRequestError("Invalid credentials"));
      //step 3 generate jwt token
      const userJwt = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
        },
        process.env.JWT_KEY as jwt.Secret
      );

      //store it on session object
      req.session = { ...req.session, jwt: userJwt };
      //step 4 send proper response
      res.status(200).send(existingUser);
    } catch (error) {
      next(error);
    }
  }

  async currentUser(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).send({ current: req.currentUser ?? null });
    } catch (error) {
      next(error);
    }
  }

  async signout(req: Request, res: Response, next: NextFunction) {
    try {
      req.session = null;

      res.send({});
    } catch (error) {
      next(error);
    }
  }
}
