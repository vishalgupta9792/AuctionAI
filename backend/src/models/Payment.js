import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
    provider: { type: String, default: "Razorpay" },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String, default: null },
    signature: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
