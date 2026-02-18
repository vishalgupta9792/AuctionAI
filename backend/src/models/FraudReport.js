import mongoose from "mongoose";

const fraudReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
    reason: { type: String, required: true },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    }
  },
  { timestamps: true }
);

export default mongoose.model("FraudReport", fraudReportSchema);
