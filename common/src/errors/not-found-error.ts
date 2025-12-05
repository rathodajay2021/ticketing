import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor() {
    super("In-valid route");

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors(): { message: string; fields?: string }[] {
    return [
      {
        message: "In-valid route, this route does not exist",
      },
    ];
  }
}
