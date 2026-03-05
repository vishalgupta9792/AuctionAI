export const FALLBACK_AUCTION_IMAGE =
  "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1200";

export const getAuctionImage = (imageUrl) => {
  if (typeof imageUrl !== "string") return FALLBACK_AUCTION_IMAGE;
  const cleaned = imageUrl.trim();
  return cleaned.length > 0 ? cleaned : FALLBACK_AUCTION_IMAGE;
};

export const formatINR = (amount) =>
  `INR ${Number(amount || 0).toLocaleString("en-IN")}`;

export const getCountdownText = (endTime, nowTs = Date.now()) => {
  const diff = new Date(endTime).getTime() - nowTs;
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return `${h}h ${m}m ${s}s`;
};
