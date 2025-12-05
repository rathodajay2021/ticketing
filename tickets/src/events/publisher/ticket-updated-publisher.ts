import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@articketing2021/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}