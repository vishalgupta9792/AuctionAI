import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate("watchlist");
  return res.json(user.watchlist || []);
});

router.post("/:auctionId", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const exists = user.watchlist.some((id) => id.toString() === req.params.auctionId);
  if (!exists) user.watchlist.push(req.params.auctionId);
  await user.save();
  return res.json({ message: "Added to watchlist" });
});

router.delete("/:auctionId", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.watchlist = user.watchlist.filter((id) => id.toString() !== req.params.auctionId);
  await user.save();
  return res.json({ message: "Removed from watchlist" });
});

export default router;
