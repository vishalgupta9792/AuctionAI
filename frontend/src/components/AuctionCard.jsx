import { Link } from "react-router-dom";
import {
  FALLBACK_AUCTION_IMAGE,
  formatINR,
  getAuctionImage
} from "../utils/auctionHelpers";

const statusClasses = {
  Live: "bg-emerald-500 text-white",
  Upcoming: "bg-amber-400 text-slate-900",
  Ended: "bg-slate-700 text-white"
};

const AuctionCard = ({ auction }) => {
  const label =
    auction.status === "Ended"
      ? auction.highestBidder
        ? "Sold"
        : "Closed"
      : auction.status;

  return (
    <Link
      to={`/auctions/${auction._id}`}
      className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-900/75"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={getAuctionImage(auction)}
          alt={auction.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_AUCTION_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[auction.status] || statusClasses.Ended}`}>
          {label}
        </span>
        <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {auction.bidCount || 0} bids
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80">
                Seller
              </p>
              <p className="truncate text-sm font-medium text-white/90">
                {auction?.seller?.name || "Auction Seller"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-right backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-200/70">
                Current
              </p>
              <p className="text-lg font-semibold text-white">{formatINR(auction.currentPrice)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-1 text-xl font-semibold text-slate-900 dark:text-white">
            {auction.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
            {auction.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300">
            Base {formatINR(auction.basePrice)}
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-300">
            View Auction
          </span>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
