import mongoose from "mongoose";
import { Password } from "utils/password";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      // you can use just any in ret type to resolve this quickly if you want too.
      transform(doc, ret: UserRet) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        // delete ret.__v
        return ret;
      },
    },
    versionKey: false, //to remove the __v, you can do it in toJSON too by delete ret.__v
    // timeStamps: true
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }

  done();
});

// an interface that describe the properties that are required to create a new user
interface UserAttrs {
  email: string;
  password: string;
}

interface UserRet
  extends mongoose.FlatRecord<
    Omit<UserAttrs, "password"> & Partial<Pick<UserAttrs, "password">>
  > {
  id?: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
  __v?: number;
}

// we added the build method inside of the schema so we don't have to export buildUser function and this stay with modal
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// an interface that describe the properties that user document has
interface UserDoc
  extends mongoose.InferSchemaType<typeof userSchema>, //this will give only schema filed like all attrs and extra like updateAt, createdAt and so on
    mongoose.Document {} // this will give mongoose document properties like save and so on

// an interface that describe the properties that user modal has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

// user this buildUser to create new user in place of "new User()" so typescript make sure you provided valid arguments
// const buildUser = (attrs: UserAttrs) => {
//   return new User(attrs);
// };

export { User };
