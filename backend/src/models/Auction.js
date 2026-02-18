import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80"
    },
    basePrice: { type: Number, required: true, min: 1 },
    currentPrice: { type: Number, default: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    bidCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Upcoming", "Live", "Ended"],
      default: "Upcoming"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Auction", auctionSchema);
