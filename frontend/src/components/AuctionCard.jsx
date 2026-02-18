import { Link } from "react-router-dom";

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
      className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/70 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80";
          }}
        />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[auction.status] || statusClasses.Ended}`}>
          {label}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-lg font-semibold text-white">{auction.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-300">{auction.description}</p>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="rounded-md bg-slate-700 px-2 py-1 text-slate-200">{auction.bidCount || 0} bids</span>
          <span className="text-lg font-bold text-emerald-300">${auction.currentPrice}</span>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
