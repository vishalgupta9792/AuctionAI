import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import Notification from "../models/Notification.js";
import { getAuctionStatus } from "../utils/auctionStatus.js";
import { runFraudChecks } from "./fraudService.js";

const minIncrement = (currentPrice) => {
  if (currentPrice < 100) return 5;
  if (currentPrice < 1000) return 20;
  return 50;
};

export const placeBidService = async ({ auctionId, bidderId, amount, maxAutoBid, io }) => {
  const auction = await Auction.findById(auctionId);
  if (!auction) throw new Error("Auction not found");

  const status = getAuctionStatus(auction.startTime, auction.endTime);
  if (status !== "Live") throw new Error(`Auction is ${status}`);

  const current = auction.currentPrice || auction.basePrice;
  const required = current + minIncrement(current);
  if (amount < required) {
    throw new Error(`Bid must be at least ${required}`);
  }

  const previousHighest = await Bid.findOne({ auction: auctionId }).sort({ amount: -1, createdAt: -1 });

  const bid = await Bid.create({ auction: auctionId, bidder: bidderId, amount, maxAutoBid: maxAutoBid || null });

  auction.currentPrice = amount;
  auction.highestBidder = bidderId;
  auction.bidCount += 1;
  auction.status = status;
  await auction.save();

  if (previousHighest && previousHighest.bidder.toString() !== bidderId.toString() && previousHighest.maxAutoBid && previousHighest.maxAutoBid > amount) {
    const autoAmount = Math.min(previousHighest.maxAutoBid, amount + minIncrement(amount));
    await Bid.create({
      auction: auctionId,
      bidder: previousHighest.bidder,
      amount: autoAmount,
      maxAutoBid: previousHighest.maxAutoBid
    });
    auction.currentPrice = autoAmount;
    auction.highestBidder = previousHighest.bidder;
    auction.bidCount += 1;
    await auction.save();
  }

  await runFraudChecks({ userId: bidderId, auctionId });

  await Notification.create({
    user: auction.seller,
    message: `New bid placed on ${auction.title}. Current price: ${auction.currentPrice}`
  });

  const payload = {
    auctionId,
    currentPrice: auction.currentPrice,
    highestBidder: auction.highestBidder,
    bidCount: auction.bidCount,
    lastBidder: bidderId
  };

  io.to(`auction_${auctionId}`).emit("bid:update", payload);
  return payload;
};
