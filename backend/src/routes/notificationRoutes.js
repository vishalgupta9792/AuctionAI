import express from "express";
import { protect } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(list);
});

router.patch("/:id/read", protect, async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
  res.json({ message: "Marked as read" });
});

export default router;
