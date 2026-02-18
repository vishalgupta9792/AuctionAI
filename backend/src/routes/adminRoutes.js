import express from "express";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import User from "../models/User.js";
import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import FraudReport from "../models/FraudReport.js";

const router = express.Router();

router.get("/stats", protect, allowRoles("Admin"), async (_, res) => {
  try {
    const [users, auctions, bids, fraudReports] = await Promise.all([
      User.countDocuments(),
      Auction.countDocuments(),
      Bid.countDocuments(),
      FraudReport.countDocuments()
    ]);

    return res.json({ users, auctions, bids, fraudReports });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/users", protect, allowRoles("Admin"), async (_, res) => {
  const users = await User.find().select("name email role isFlagged createdAt").sort({ createdAt: -1 });
  return res.json(users);
});

router.get("/fraud", protect, allowRoles("Admin"), async (_, res) => {
  const reports = await FraudReport.find().populate("user", "name email").populate("auction", "title").sort({ createdAt: -1 });
  return res.json(reports);
});

export default router;
