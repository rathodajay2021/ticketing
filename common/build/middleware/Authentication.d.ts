import { NextFunction, Request, Response } from "express";
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
export declare class Authentication {
    private static handle;
    static blank(req: Request, res: Response, next: NextFunction): Promise<void>;
    static auth(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export {};
