import mongoose from "mongoose";
import { OrderStatus } from "@articketing2021/common";
import { TicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    // versionKey: false, //to remove the __v, you can do it in toJSON too by delete ret.__v
    // timeStamps: true
  }
);

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

// interface OrderRet extends mongoose.FlatRecord<OrderAttrs> {
//   id?: mongoose.Types.ObjectId;
//   _id?: mongoose.Types.ObjectId;
//   __v?: number;
// }

interface OrderDoc
  extends mongoose.InferSchemaType<typeof orderSchema>,
    mongoose.Document {
  version: number;
}

interface OrderModal extends mongoose.Model<OrderDoc> {
  build(args: OrderAttrs): OrderDoc;
}

export const Order = mongoose.model<OrderDoc, OrderModal>("Order", orderSchema);
