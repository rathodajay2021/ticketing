import mongoose, { Types } from "mongoose";
import { Order } from "./order";
import { OrderStatus } from "@articketing2021/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

const TicketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret: TicketRet) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    // versionKey: false, //to remove the __v, you can do it in toJSON too by delete ret.__v
  }
);

TicketSchema.set("versionKey", "version");
TicketSchema.plugin(updateIfCurrentPlugin);
TicketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    ...attrs,
    _id: attrs.id,
  });
};
TicketSchema.statics.findByEvent = (event: { id: Types.ObjectId, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

TicketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Complete,
        OrderStatus.AwaitingPayment,
        OrderStatus.Created,
      ],
    },
  });

  return !!existingOrder;
};

interface TicketRet extends mongoose.FlatRecord<Omit<TicketAttrs, "id">> {
  id?: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
  __v?: number;
}

interface TicketAttrs {
  title: string;
  price: number;
  id: Types.ObjectId;
}

export interface TicketDoc
  extends mongoose.InferSchemaType<typeof TicketSchema>,
    mongoose.Document {
  isReserved(): Promise<boolean>;
  version: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: Types.ObjectId;
    version: number;
  }): Promise<TicketDoc | null>;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", TicketSchema);

export { Ticket };
