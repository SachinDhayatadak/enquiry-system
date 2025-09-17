import { Schema, model } from "mongoose";

const activitySchema = new Schema(
  {
    action: { type: String, required: true },
    enquiry: { type: Schema.Types.ObjectId, ref: "Enquiry" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    details: { type: String },
  },
  { timestamps: true }
);

export default model("ActivityLog", activitySchema);
