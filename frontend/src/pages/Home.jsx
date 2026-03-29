import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import AuctionCard from "../components/AuctionCard";
import {
  formatINR,
  getAuctionImage,
  getCountdownText
} from "../utils/auctionHelpers";

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAuctions = async () => {
    try {
      const { data } = await api.get("/auctions");
      setAuctions(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
    const refresh = setInterval(loadAuctions, 20000);
    return () => clearInterval(refresh);
  }, []);

  const live = useMemo(() => auctions.filter((a) => a.status === "Live"), [auctions]);
  const upcoming = useMemo(() => auctions.filter((a) => a.status === "Upcoming"), [auctions]);
  const sold = useMemo(() => auctions.filter((a) => a.status === "Ended" && a.highestBidder), [auctions]);
  const spotlight = useMemo(() => live[0] || auctions[0] || null, [auctions, live]);
  const endingSoon = useMemo(
    () => [...live].sort((a, b) => new Date(a.endTime) - new Date(b.endTime))[0] || null,
    [live]
  );
  const highestValue = useMemo(
    () => [...auctions].sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0))[0] || null,
    [auctions]
  );
  const mostBids = useMemo(
    () => [...auctions].sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0))[0] || null,
    [auctions]
  );

  const signals = useMemo(
    () => [
      {
        label: "Most Active",
        value: mostBids ? `${mostBids.bidCount || 0} bids` : "No signal yet",
        hint: mostBids?.title || "Waiting for bidding activity"
      },
      {
        label: "Highest Value",
        value: highestValue ? formatINR(highestValue.currentPrice) : "No signal yet",
        hint: highestValue?.title || "Premium lots will show here"
      },
      {
        label: "Ending Soon",
        value: endingSoon ? getCountdownText(endingSoon.endTime) : "No live lots",
        hint: endingSoon?.title || "Create a live auction to start urgency"
      },
      {
        label: "Closed Deals",
        value: `${sold.length} sold`,
        hint: sold[0]?.title || "Winning payments land here"
      }
    ],
    [endingSoon, highestValue, mostBids, sold]
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[36px] border border-emerald-400/10 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.22),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_20%),linear-gradient(120deg,#07131f,#0b2232_40%,#0f766e_120%)] p-8 text-white shadow-[0_30px_100px_rgba(8,47,73,0.45)]">
        <div className="absolute -left-16 top-8 h-36 w-36 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.18fr,0.82fr] xl:items-stretch">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-100">
                Curated Auction Floor
              </span>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
                Online Auction Platform with an executive live-market feel
              </h1>
              <p className="max-w-3xl text-base leading-8 text-emerald-50/85 md:text-lg">
                Real-time bidding, AI bid intelligence, fraud monitoring, secure checkout, and role-based auction workflows in one polished marketplace.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.26em] text-emerald-100/80">Live Auctions</p>
                <p className="mt-3 text-4xl font-semibold">{live.length}</p>
                <p className="mt-2 text-sm text-emerald-50/70">Competitive lots running right now.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.26em] text-emerald-100/80">Upcoming</p>
                <p className="mt-3 text-4xl font-semibold">{upcoming.length}</p>
                <p className="mt-2 text-sm text-emerald-50/70">Fresh inventory preparing to open.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.26em] text-emerald-100/80">Items Sold</p>
                <p className="mt-3 text-4xl font-semibold">{sold.length}</p>
                <p className="mt-2 text-sm text-emerald-50/70">Closed deals with payment flow ready.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/20 p-4 backdrop-blur">
            {spotlight ? (
              <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/30">
                <div className="relative h-72 overflow-hidden">
                  <img src={getAuctionImage(spotlight)} alt={spotlight.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <span className="rounded-full bg-emerald-400/90 px-3 py-1 text-xs font-semibold text-slate-950">{spotlight.status}</span>
                    <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-semibold text-white">{spotlight.bidCount || 0} bids</span>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.26em] text-emerald-200/70">Spotlight Lot</p>
                    <h2 className="text-2xl font-semibold">{spotlight.title}</h2>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-200/80">{spotlight.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">Current Price</p>
                      <p className="mt-2 text-xl font-semibold">{formatINR(spotlight.currentPrice)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">Closing Window</p>
                      <p className="mt-2 text-xl font-semibold">{spotlight.status === "Live" ? getCountdownText(spotlight.endTime) : spotlight.status}</p>
                    </div>
                  </div>
                  <Link to={`/auctions/${spotlight._id}`} className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-emerald-100">
                    Explore Spotlight Auction
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-slate-950/20 text-center text-slate-200/70">
                Auctions will appear here as soon as inventory is loaded.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {signals.map((signal, index) => (
          <div key={signal.label} className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/75">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{signal.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{signal.value}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{signal.hint}</p>
            <div className={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${["from-emerald-400 to-cyan-300", "from-sky-400 to-blue-300", "from-fuchsia-400 to-rose-300", "from-amber-300 to-orange-300"][index % 4]}`} />
          </div>
        ))}
      </section>

      {loading ? (
        <div className="card">Loading auctions...</div>
      ) : (
        <>
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-500">Signature Picks</p>
                <h2 className="mt-2 text-3xl font-semibold">Featured Auctions</h2>
              </div>
              <span className="text-sm text-slate-400">{auctions.length} total products</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {auctions.slice(0, 6).map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-500">Market Floor</p>
                <h2 className="mt-2 text-3xl font-semibold">Live Bidding Now</h2>
              </div>
              <span className="text-sm text-slate-400">{live.length ? "Realtime competition is active" : "No lots are live right now"}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {live.slice(0, 6).map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
            {live.length === 0 && <div className="card mt-3 text-sm text-slate-400">No live auctions currently.</div>}
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-500">Closed Deals</p>
                <h2 className="mt-2 text-3xl font-semibold">Recently Sold</h2>
              </div>
              <span className="text-sm text-slate-400">Winning bidders and completed cycles</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sold.slice(0, 6).map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
