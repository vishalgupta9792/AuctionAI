export const FALLBACK_AUCTION_IMAGE =
  "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1200";

const DEFAULT_PLACEHOLDER_MARKERS = [
  "1484704849700-f032a568e944",
  "5632402/pexels-photo-5632402"
];

const KEYWORD_IMAGE_MAP = [
  {
    keys: ["pen", "pencil", "marker"],
    image:
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80"
  },
  {
    keys: ["ball", "football", "cricket", "basketball"],
    image:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80"
  },
  {
    keys: ["laptop", "macbook", "notebook"],
    image:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
  },
  {
    keys: ["phone", "smartphone", "mobile", "iphone"],
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80"
  },
  {
    keys: ["watch", "clock"],
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80"
  },
  {
    keys: ["bike", "cycle"],
    image:
      "https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=1200&q=80"
  }
];

export const inferImageFromText = (title = "", description = "") => {
  const text = `${title} ${description}`.toLowerCase();
  const found = KEYWORD_IMAGE_MAP.find((entry) =>
    entry.keys.some((key) => text.includes(key))
  );
  return found?.image || FALLBACK_AUCTION_IMAGE;
};

export const getAuctionImage = (input) => {
  if (typeof input === "string") {
    const cleaned = input.trim();
    return cleaned.length > 0 ? cleaned : FALLBACK_AUCTION_IMAGE;
  }

  const imageUrl = input?.imageUrl;
  const cleaned = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (
    cleaned &&
    !DEFAULT_PLACEHOLDER_MARKERS.some((marker) => cleaned.includes(marker))
  ) {
    return cleaned;
  }

  return inferImageFromText(input?.title, input?.description);
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
