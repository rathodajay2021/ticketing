import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@articketing2021/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
