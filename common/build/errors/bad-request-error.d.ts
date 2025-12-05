import { CustomError } from "./custom-error";
export declare class BadRequestError extends CustomError {
    message: string;
    statusCode: number;
    constructor(message: string, statusCode?: number);
    serializeErrors(): {
        message: string;
        fields?: string;
    }[];
}
