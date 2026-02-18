import express from "express";
import { protect } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.post("/simulate", protect, async (req, res) => {
  const { auctionId, amount } = req.body;
  const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  await Notification.create({
    user: req.user._id,
    message: `Dummy payment successful for auction ${auctionId}. Amount: $${amount}. Transaction: ${transactionId}`
  });

  return res.json({
    success: true,
    transactionId,
    paidAmount: amount,
    method: "DummyGateway"
  });
});

export default router;
