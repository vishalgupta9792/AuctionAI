import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 1 },
    maxAutoBid: { type: Number, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Bid", bidSchema);
