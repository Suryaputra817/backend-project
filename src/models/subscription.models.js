import mongoose, { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // channel and subscriber both are user
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = model("Subscription", subscriptionSchema);
