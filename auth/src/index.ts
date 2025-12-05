import { app } from "app";
import mongoose from "mongoose";

const start = async () => {
  // await mongoose.connect('mongodb://localhost')
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://auth-mongo-srv:27017/auth"
    );
    console.log("connected to mongo db");
  } catch (error) {
    console.log("🚀 ~ mongoose start ~ error:", error);
  }

  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
};

start();
