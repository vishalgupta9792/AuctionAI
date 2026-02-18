import express from "express";
import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/seller", protect, async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id });
    const ids = auctions.map((a) => a._id);
    const bids = await Bid.find({ auction: { $in: ids } });

    const revenue = auctions.reduce((sum, a) => sum + (a.currentPrice || 0), 0);
    res.json({ auctions, totalAuctions: auctions.length, totalBids: bids.length, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/bidder", protect, async (req, res) => {
  try {
    const myBids = await Bid.find({ bidder: req.user._id }).populate("auction").sort({ createdAt: -1 });
    const activeBids = myBids.filter((b) => b.auction && new Date(b.auction.endTime) > new Date());
    const wonAuctions = myBids.filter(
      (b) => b.auction && b.auction.highestBidder && b.auction.highestBidder.toString() === req.user._id.toString() && new Date(b.auction.endTime) < new Date()
    );

    res.json({ activeBids, wonAuctions, bidHistory: myBids });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
