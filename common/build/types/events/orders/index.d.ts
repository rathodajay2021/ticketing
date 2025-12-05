import { Subjects } from "..";
export declare enum OrderStatus {
    Created = "created",
    Cancelled = "cancelled",
    AwaitingPayment = "awaiting:payment",
    Complete = "complete"
}
export interface OrderCancelledEvent {
    subject: Subjects.OrderCancelled;
    data: {
        id: string;
        version: number;
        ticket: {
            id: string;
        };
    };
}
export interface OrderCreatedEvent {
    subject: Subjects.OrderCreated;
    data: {
        id: string;
        status: OrderStatus;
        userId: string;
        expiresAt: string;
        version: number;
        ticket: {
            id: string;
            price: number;
        };
    };
}
