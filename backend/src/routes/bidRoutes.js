import express from "express";
import { protect } from "../middleware/auth.js";
import { placeBidService } from "../services/biddingService.js";

const router = express.Router();

router.post("/:auctionId", protect, async (req, res) => {
  try {
    const { amount, maxAutoBid } = req.body;
    const io = req.app.get("io");
    const payload = await placeBidService({
      auctionId: req.params.auctionId,
      bidderId: req.user._id,
      amount: Number(amount),
      maxAutoBid: maxAutoBid ? Number(maxAutoBid) : null,
      io
    });

    return res.status(201).json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

export default router;
