import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { protect } from "../middleware/auth.js";
import Notification from "../models/Notification.js";
import Payment from "../models/Payment.js";
import Auction from "../models/Auction.js";

const router = express.Router();

const hasRazorpayKeys = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

router.post("/create-order", protect, async (req, res) => {
  try {
    const { auctionId, amount, currency } = req.body;

    if (!hasRazorpayKeys()) {
      return res.status(400).json({ message: "Razorpay keys are not configured on server" });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const allowedCurrencies = (process.env.RAZORPAY_ALLOWED_CURRENCIES || "INR,USD")
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    const selectedCurrency = (currency || process.env.RAZORPAY_CURRENCY || "INR").toUpperCase();
    if (!allowedCurrencies.includes(selectedCurrency)) {
      return res.status(400).json({
        message: `Currency ${selectedCurrency} is not allowed`,
        allowedCurrencies
      });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency: selectedCurrency,
      receipt: `auc_${auctionId}_${Date.now()}`
    });

    const payment = await Payment.create({
      user: req.user._id,
      auction: auctionId,
      orderId: order.id,
      amount: numericAmount,
      currency: order.currency,
      status: "created"
    });

    return res.json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentRecordId: payment._id,
      auctionTitle: auction.title
    });
  } catch (error) {
    const message =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      "Payment gateway error while creating order";
    const status = error?.statusCode || 500;
    return res.status(status).json({ message });
  }
});

router.post("/verify", protect, async (req, res) => {
  try {
    const {
      auctionId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!hasRazorpayKeys()) {
      return res.status(400).json({ message: "Razorpay keys are not configured on server" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
      user: req.user._id,
      auction: auctionId
    });

    if (!payment) return res.status(404).json({ message: "Payment record not found" });

    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = "paid";
    await payment.save();

    await Notification.create({
      user: req.user._id,
      message: `Payment successful for auction ${auctionId}. Payment ID: ${razorpay_payment_id}`
    });

    return res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    const message =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      "Payment verification failed";
    const status = error?.statusCode || 500;
    return res.status(status).json({ message });
  }
});

router.get("/my", protect, async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate("auction", "title")
    .sort({ createdAt: -1 });
  return res.json(payments);
});

export default router;
