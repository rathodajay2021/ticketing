import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@articketing2021/common";

export class OrderCreatedCancelled extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
