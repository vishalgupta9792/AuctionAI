import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Auction from "./models/Auction.js";
import Bid from "./models/Bid.js";
import FraudReport from "./models/FraudReport.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([
    User.deleteMany({}),
    Auction.deleteMany({}),
    Bid.deleteMany({}),
    FraudReport.deleteMany({})
  ]);

  const [admin, seller, bidder1, bidder2] = await User.create([
    { name: "Admin User", email: "admin@auction.com", password: "123456", role: "Admin" },
    { name: "Seller One", email: "seller@auction.com", password: "123456", role: "Seller" },
    { name: "Bidder One", email: "bidder1@auction.com", password: "123456", role: "Bidder" },
    { name: "Bidder Two", email: "bidder2@auction.com", password: "123456", role: "Bidder" }
  ]);

  const now = Date.now();
  const hour = 60 * 60 * 1000;

  const auctions = await Auction.create([
    {
      title: "Gaming Laptop",
      description: "RTX laptop in great condition",
      imageUrl: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
      basePrice: 500,
      currentPrice: 620,
      startTime: new Date(now - 1 * hour),
      endTime: new Date(now + 5 * hour),
      seller: seller._id,
      highestBidder: bidder1._id,
      bidCount: 2,
      status: "Live"
    },
    {
      title: "Canon DSLR Camera",
      description: "EOS 80D with 50mm prime lens",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      basePrice: 700,
      currentPrice: 890,
      startTime: new Date(now - 2 * hour),
      endTime: new Date(now + 3 * hour),
      seller: seller._id,
      highestBidder: bidder2._id,
      bidCount: 5,
      status: "Live"
    },
    {
      title: "PlayStation 5 Bundle",
      description: "PS5 + 2 controllers + games",
      imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=1200&q=80",
      basePrice: 450,
      currentPrice: 610,
      startTime: new Date(now - 30 * 60 * 1000),
      endTime: new Date(now + 6 * hour),
      seller: seller._id,
      highestBidder: bidder1._id,
      bidCount: 7,
      status: "Live"
    },
    {
      title: "Vintage Watch",
      description: "Collector's piece, limited edition",
      imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80",
      basePrice: 1200,
      currentPrice: 1200,
      startTime: new Date(now + 2 * hour),
      endTime: new Date(now + 24 * hour),
      seller: seller._id,
      bidCount: 0,
      status: "Upcoming"
    },
    {
      title: "iPad Pro 12.9",
      description: "M2 chip, 256GB, Apple Pencil included",
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80",
      basePrice: 650,
      currentPrice: 650,
      startTime: new Date(now + 4 * hour),
      endTime: new Date(now + 20 * hour),
      seller: seller._id,
      bidCount: 0,
      status: "Upcoming"
    },
    {
      title: "Mountain Bike",
      description: "Aluminum frame, disc brakes",
      imageUrl: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=1200&q=80",
      basePrice: 320,
      currentPrice: 320,
      startTime: new Date(now + 1 * hour),
      endTime: new Date(now + 18 * hour),
      seller: seller._id,
      bidCount: 0,
      status: "Upcoming"
    },
    {
      title: "Smartphone Bundle",
      description: "Phone + earbuds + charger",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
      basePrice: 300,
      currentPrice: 450,
      startTime: new Date(now - 24 * hour),
      endTime: new Date(now - 2 * hour),
      seller: seller._id,
      highestBidder: bidder2._id,
      bidCount: 4,
      status: "Ended"
    },
    {
      title: "Air Jordan Sneakers",
      description: "Limited drop, size 9",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      basePrice: 180,
      currentPrice: 290,
      startTime: new Date(now - 16 * hour),
      endTime: new Date(now - 1 * hour),
      seller: seller._id,
      highestBidder: bidder1._id,
      bidCount: 8,
      status: "Ended"
    },
    {
      title: "Mechanical Keyboard",
      description: "Hot-swappable, RGB, custom keycaps",
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
      basePrice: 80,
      currentPrice: 80,
      startTime: new Date(now - 20 * hour),
      endTime: new Date(now - 3 * hour),
      seller: seller._id,
      bidCount: 0,
      status: "Ended"
    },
    {
      title: "Drone 4K Camera",
      description: "Stabilized footage, extra battery pack",
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
      basePrice: 520,
      currentPrice: 730,
      startTime: new Date(now - 18 * hour),
      endTime: new Date(now - 30 * 60 * 1000),
      seller: seller._id,
      highestBidder: bidder2._id,
      bidCount: 6,
      status: "Ended"
    }
  ]);

  await Bid.create([
    { auction: auctions[0]._id, bidder: bidder2._id, amount: 580, maxAutoBid: 700 },
    { auction: auctions[0]._id, bidder: bidder1._id, amount: 620, maxAutoBid: 750 },
    { auction: auctions[1]._id, bidder: bidder1._id, amount: 760, maxAutoBid: 950 },
    { auction: auctions[1]._id, bidder: bidder2._id, amount: 820 },
    { auction: auctions[1]._id, bidder: bidder2._id, amount: 890 },
    { auction: auctions[2]._id, bidder: bidder2._id, amount: 540 },
    { auction: auctions[2]._id, bidder: bidder1._id, amount: 610 },
    { auction: auctions[6]._id, bidder: bidder1._id, amount: 380 },
    { auction: auctions[6]._id, bidder: bidder2._id, amount: 450 },
    { auction: auctions[7]._id, bidder: bidder2._id, amount: 220 },
    { auction: auctions[7]._id, bidder: bidder1._id, amount: 290 },
    { auction: auctions[9]._id, bidder: bidder1._id, amount: 610 },
    { auction: auctions[9]._id, bidder: bidder2._id, amount: 730 }
  ]);

  console.log("Seed completed with extended products");
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
