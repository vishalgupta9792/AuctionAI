import express from "express";
import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { getAuctionStatus } from "../utils/auctionStatus.js";

const router = express.Router();

router.post("/", protect, allowRoles("Seller", "Admin"), async (req, res) => {
  try {
    const { title, description, imageUrl, basePrice, startTime, endTime } = req.body;
    const auction = await Auction.create({
      title,
      description,
      imageUrl,
      basePrice,
      currentPrice: basePrice,
      startTime,
      endTime,
      seller: req.user._id,
      status: getAuctionStatus(startTime, endTime)
    });
    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const auctions = await Auction.find().populate("seller", "name role").sort({ createdAt: -1 });
    const withStatus = auctions.map((a) => ({
      ...a.toObject(),
      status: getAuctionStatus(a.startTime, a.endTime)
    }));
    const filtered = status ? withStatus.filter((a) => a.status === status) : withStatus;
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/trending", async (_, res) => {
  try {
    const mostBids = await Auction.find().sort({ bidCount: -1 }).limit(5);
    const highestPrice = await Auction.find().sort({ currentPrice: -1 }).limit(5);
    const endingSoon = await Auction.find({ endTime: { $gte: new Date() } }).sort({ endTime: 1 }).limit(5);

    res.json({ mostBids, highestPrice, endingSoon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("seller", "name")
      .populate("highestBidder", "name email");

    if (!auction) return res.status(404).json({ message: "Auction not found" });

    const bids = await Bid.find({ auction: req.params.id })
      .populate("bidder", "name")
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json({
      ...auction.toObject(),
      status: getAuctionStatus(auction.startTime, auction.endTime),
      bids
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
