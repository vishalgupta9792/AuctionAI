import FraudReport from "../models/FraudReport.js";
import User from "../models/User.js";
import Bid from "../models/Bid.js";

export const runFraudChecks = async ({ userId, auctionId }) => {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const rapidBids = await Bid.countDocuments({
    bidder: userId,
    auction: auctionId,
    createdAt: { $gte: oneMinuteAgo }
  });

  if (rapidBids >= 5) {
    const reason = "Rapid repeated bids detected in under 1 minute";
    await FraudReport.create({
      user: userId,
      auction: auctionId,
      reason,
      severity: "High"
    });
    await User.findByIdAndUpdate(userId, { isFlagged: true });
    return { flagged: true, reason };
  }

  return { flagged: false };
};
