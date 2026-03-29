import express from "express";
import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import { openai } from "../utils/aiClient.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const buildFallbackChatReply = ({ message, history, trending, liveAuctions, user }) => {
  const text = String(message || "").toLowerCase();
  const topTrending = trending[0];
  const recentBid = history[0];
  const livePreview = liveAuctions.slice(0, 3).map((auction) => auction.title).join(", ");

  if (text.includes("bidding") || text.includes("bid") || text.includes("how does")) {
    return `Bidding is simple: open a live auction, place an amount above the current price, and keep track of the countdown until the auction closes. You currently have ${history.length} recent bids${recentBid ? `, with your latest on ${recentBid.auction?.title || "an auction"}` : ""}.`;
  }

  if (text.includes("trending")) {
    return topTrending
      ? `Right now the top trending auction is ${topTrending.title} at ${topTrending.currentPrice} with ${topTrending.bidCount} bids. Other strong movers include ${trending
          .slice(1, 3)
          .map((auction) => auction.title)
          .join(", ") || "the rest of the premium board"}.`
      : "There are no trending auctions available yet, but as soon as auctions receive bids they will appear here.";
  }

  if (text.includes("live")) {
    return liveAuctions.length
      ? `There are ${liveAuctions.length} live auctions right now. The main active lots are ${livePreview}. Open any of them to place a bid and monitor the countdown.`
      : "There are no live auctions at the moment. You can create a new listing from Sell Item or check Upcoming lots.";
  }

  if (text.includes("payment") || text.includes("pay") || text.includes("buy")) {
    return "After an auction ends, the highest bidder sees a Pay Now action in the dashboard. Complete the Razorpay flow there, and the payment status will update once the order is verified.";
  }

  if (text.includes("history") || text.includes("my bids")) {
    return recentBid
      ? `Your most recent bid was ${recentBid.amount} on ${recentBid.auction?.title || "an auction"}. In total, you have ${history.length} recent bid records in the assistant context.`
      : "You do not have any recent bids yet. Join a live auction and place your first bid to start building history.";
  }

  return `Hello ${user.name}. I can help you with live auctions, trending lots, bidding rules, and payments. Right now there are ${liveAuctions.length} live auctions${topTrending ? `, and the top trending listing is ${topTrending.title}` : ""}.`;
};

const isRecoverableAiError = (error) => {
  const status = error?.status || error?.response?.status;
  const message = String(error?.message || "").toLowerCase();

  return (
    status === 401 ||
    status === 429 ||
    status === 500 ||
    status === 503 ||
    message.includes("api key") ||
    message.includes("incorrect api key") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("overloaded")
  );
};

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
    const [history, trending, liveAuctions] = await Promise.all([
      Bid.find({ bidder: req.user._id }).populate("auction", "title").sort({ createdAt: -1 }).limit(10),
      Auction.find().sort({ bidCount: -1 }).limit(5),
      Auction.find({ status: "Live" }).sort({ bidCount: -1, currentPrice: -1 }).limit(5)
    ]);

    const context = {
      user: { id: req.user._id, name: req.user.name, role: req.user.role },
      bidHistory: history.map((h) => ({ auction: h.auction?.title, amount: h.amount, time: h.createdAt })),
      trending: trending.map((a) => ({ title: a.title, currentPrice: a.currentPrice, bidCount: a.bidCount })),
      liveAuctions: liveAuctions.map((a) => ({ title: a.title, currentPrice: a.currentPrice, bidCount: a.bidCount }))
    };

    if (!openai) {
      return res.json({
        reply: buildFallbackChatReply({
          message,
          history,
          trending,
          liveAuctions,
          user: req.user
        })
      });
    }

    try {
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
      if (isRecoverableAiError(error)) {
        return res.json({
          reply: buildFallbackChatReply({
            message,
            history,
            trending,
            liveAuctions,
            user: req.user
          })
        });
      }

      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      message: "Chat assistant is temporarily unavailable. Please try again shortly."
    });
  }
});

export default router;
