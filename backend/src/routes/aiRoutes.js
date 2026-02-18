import express from "express";
import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import { openai } from "../utils/aiClient.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/suggest-bid/:auctionId", protect, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    const bids = await Bid.find({ auction: auction._id }).sort({ createdAt: -1 }).limit(50);
    const current = auction.currentPrice || auction.basePrice;
    const defaultSuggestion = Math.round(current * 1.08);
    const competitionScore = Math.min(95, 35 + bids.length * 4);

    if (!openai) {
      return res.json({
        suggestedBid: defaultSuggestion,
        winningProbability: `${100 - competitionScore}%`,
        note: "Heuristic suggestion used because OPENAI_API_KEY is not configured"
      });
    }

    const prompt = `Auction title: ${auction.title}\nCurrent price: ${current}\nTotal bids: ${bids.length}\nReturn strict JSON with keys suggestedBid(number), winningProbability(number), reason(string).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);
    return res.json(parsed);
  } catch (error) {
    return res.json({
      suggestedBid: null,
      winningProbability: null,
      reason: `AI parsing fallback: ${error.message}`
    });
  }
});

router.post("/chatbot", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const history = await Bid.find({ bidder: req.user._id }).populate("auction", "title").sort({ createdAt: -1 }).limit(10);
    const trending = await Auction.find().sort({ bidCount: -1 }).limit(5);

    const context = {
      user: { id: req.user._id, name: req.user.name, role: req.user.role },
      bidHistory: history.map((h) => ({ auction: h.auction?.title, amount: h.amount, time: h.createdAt })),
      trending: trending.map((a) => ({ title: a.title, currentPrice: a.currentPrice, bidCount: a.bidCount }))
    };

    if (!openai) {
      return res.json({
        reply: `Chatbot fallback: ${message}. You have ${history.length} recent bids. Top trending auction: ${trending[0]?.title || "N/A"}.`
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an auction assistant. Explain bidding clearly and keep replies concise."
        },
        {
          role: "user",
          content: `User question: ${message}\nContext: ${JSON.stringify(context)}`
        }
      ],
      temperature: 0.5
    });

    return res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
