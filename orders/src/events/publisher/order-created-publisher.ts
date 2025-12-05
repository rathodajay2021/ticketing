import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from "@articketing2021/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
