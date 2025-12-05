import { Subjects } from "../types";
import { Stan } from "node-nats-streaming";
interface Event {
    subject: Subjects;
    data: unknown;
}
export declare abstract class Publisher<T extends Event> {
    abstract subject: T["subject"];
    private client;
    constructor(client: Stan);
    pub(data: T["data"]): Promise<void>;
}
export {};
