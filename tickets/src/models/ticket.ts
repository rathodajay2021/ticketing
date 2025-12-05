import mongoose from "mongoose";
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
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret: TicketRet) {
        ret.id = ret._id;
        delete ret._id;
        // delete ret.__v
        return ret;
      },
    },
    // versionKey: false, //to remove the __v, you can do it in toJSON too by delete ret.__v
    // timeStamps: true
  }
);

interface TicketAttr {
  title: string;
  price: number;
  userId: string;
}

interface TicketRet extends mongoose.FlatRecord<TicketAttr> {
  id?: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
  __v?: number;
}

// an interface that describe the properties that user document has
interface TicketDoc
  extends mongoose.InferSchemaType<typeof TicketSchema>, //this will give only schema filed like all attrs and extra like updateAt, createdAt and so on
    mongoose.Document {
  version: number; //if we keep __v then there is no need for this type
} // this will give mongoose document properties like save and so on

interface TicketModal extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttr): TicketDoc;
}

// for version control
TicketSchema.set("versionKey", "version"); //set version key name from __v to "version"
TicketSchema.plugin(updateIfCurrentPlugin);

TicketSchema.statics.build = (attrs: TicketAttr) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModal>("Ticket", TicketSchema);

export { Ticket };
