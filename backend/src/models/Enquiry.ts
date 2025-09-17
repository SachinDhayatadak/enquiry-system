import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEnquiry extends Document {
  customerName: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  assignedTo?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "new" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEnquiry>("Enquiry", enquirySchema);
