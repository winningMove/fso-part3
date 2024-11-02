import mongoose, { Schema, model } from "mongoose";

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
} catch (err) {
  console.err("Couldn't connect to DB:", err);
}

const personSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
    },
    number: {
      type: String,
      required: true,
      minLength: 8,
      validate: {
        validator: (v) => /^\d{2,3}-\d+$/.test(v),
        message: ({ value }) => `${value} is not a valid phone number`,
      },
    },
  },
  {
    toJSON: {
      transform: (_, returned) => {
        returned.id = String(returned._id);
        delete returned.__v;
        delete returned._id;
      },
    },
  }
);

export default model("Person", personSchema);
