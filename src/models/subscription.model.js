import mongoose, { Schema } from "mongoose";

const subscriptionModel = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const Subscription = mongoose.Model("Subscription", subscriptionModel);

export { Subscription };
