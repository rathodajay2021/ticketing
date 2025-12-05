import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  constructor(public message: string, public statusCode = 400) {
    super(message);

    this.statusCode = statusCode;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors(): { message: string; fields?: string }[] {
    return [
      {
        message: this.message,
      },
    ];
  }
}
