import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
  reason = "Error connecting the database";
  statusCode = 500;

  constructor() {
    super('Error connecting db');

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors (){
    return [
      {
        message: this.reason
      }
    ]
  }
}
