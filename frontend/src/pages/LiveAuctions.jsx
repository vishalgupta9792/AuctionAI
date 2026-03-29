import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import AuctionCard from "../components/AuctionCard";
import { formatINR, getAuctionImage, getCountdownText } from "../utils/auctionHelpers";

const formatShortTime = (endTime, tick) => {
  const diff = new Date(endTime).getTime() - tick;
  if (diff <= 0) return "Auction closed";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m remaining`;
};

const LiveAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [tick, setTick] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  const loadLiveAuctions = async () => {
    try {
      const { data } = await api.get("/auctions?status=Live");
      setAuctions(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveAuctions();
    const refresh = setInterval(loadLiveAuctions, 15000);
    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const trulyLiveAuctions = useMemo(
    () => auctions.filter((auction) => new Date(auction.endTime).getTime() > tick),
    [auctions, tick]
  );

  const leadAuction = trulyLiveAuctions[0];
  const totalBidCount = trulyLiveAuctions.reduce(
    (sum, auction) => sum + Number(auction.bidCount || 0),
    0
  );
  const peakPrice = trulyLiveAuctions.reduce(
    (max, auction) => Math.max(max, Number(auction.currentPrice || 0)),
    0
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[34px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.28),_transparent_42%),linear-gradient(135deg,_rgba(6,78,59,0.92),_rgba(15,23,42,0.98))] p-6 text-white shadow-[0_30px_90px_rgba(4,120,87,0.25)] md:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_54%)] lg:block" />
        <div className="relative space-y-6">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">
              Auction floor is open
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Live bidding with real pressure, real momentum, and real-time closing windows.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-emerald-50/80 md:text-lg">
                Watch active lots, monitor countdown pressure, and move on fast-rising items before the final-minute surge.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/70">Live Auctions</p>
              <p className="mt-4 text-4xl font-semibold">{trulyLiveAuctions.length}</p>
              <p className="mt-2 text-sm text-emerald-50/75">Lots currently taking bids right now.</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/70">Bid Pressure</p>
              <p className="mt-4 text-4xl font-semibold">{totalBidCount}</p>
              <p className="mt-2 text-sm text-emerald-50/75">Combined bid activity across the live floor.</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/70">Top Current Price</p>
              <p className="mt-4 text-4xl font-semibold">{formatINR(peakPrice)}</p>
              <p className="mt-2 text-sm text-emerald-50/75">Highest current ticket among active auctions.</p>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[30px] border border-white/10 bg-slate-900/70 p-8 text-slate-300 shadow-[0_20px_60px_rgba(15,23,42,0.24)]">
          Loading live auctions...
        </div>
      ) : trulyLiveAuctions.length === 0 ? (
        <div className="rounded-[30px] border border-white/10 bg-slate-900/70 p-8 text-sm text-slate-300 shadow-[0_20px_60px_rgba(15,23,42,0.24)]">
          No live auctions right now. Create a new auction from Sell Item or come back in a few minutes for the next active lot.
        </div>
      ) : (
        <>
          {leadAuction && (
            <section className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
                <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative min-h-[320px] overflow-hidden">
                    <img
                      src={getAuctionImage(leadAuction)}
                      alt={leadAuction.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
                    <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-emerald-400 px-4 py-1.5 text-sm font-semibold text-slate-950">
                        Live spotlight
                      </span>
                      <span className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
                        {leadAuction.bidCount || 0} bids
                      </span>
                    </div>
                    <div className="absolute inset-x-6 bottom-6 max-w-md space-y-3">
                      <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/80">
                        Seller {leadAuction?.seller?.name || "Auction Seller"}
                      </p>
                      <h2 className="text-3xl font-semibold text-white md:text-4xl">
                        {leadAuction.title}
                      </h2>
                      <p className="text-sm leading-6 text-slate-200/80 md:text-base">
                        {leadAuction.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 p-6 md:p-7">
                    <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                        Time Left
                      </p>
                      <p className="mt-3 text-4xl font-semibold text-white">
                        {getCountdownText(leadAuction.endTime, tick)}
                      </p>
                      <p className="mt-2 text-sm text-emerald-50/75">
                        Final-moment activity usually spikes in the last thirty minutes.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current Price</p>
                        <p className="mt-3 text-3xl font-semibold text-white">
                          {formatINR(leadAuction.currentPrice)}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Opening Price</p>
                        <p className="mt-3 text-3xl font-semibold text-white">
                          {formatINR(leadAuction.basePrice)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Auction Pulse</p>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                          {formatShortTime(leadAuction.endTime, tick)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300"
                          style={{
                            width: `${Math.min(100, Math.max(18, (Number(leadAuction.bidCount || 0) / 10) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {trulyLiveAuctions.slice(1, 4).map((auction, index) => (
                  <div
                    key={auction._id}
                    className="rounded-[28px] border border-white/10 bg-slate-900/75 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.22)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">
                        Queue {index + 1}
                      </span>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        {getCountdownText(auction.endTime, tick)}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <h3 className="text-xl font-semibold text-white">{auction.title}</h3>
                      <p className="text-sm leading-6 text-slate-300">{auction.description}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current</p>
                        <p className="text-xl font-semibold text-white">{formatINR(auction.currentPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Bid Count</p>
                        <p className="text-xl font-semibold text-emerald-300">{auction.bidCount || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-emerald-300/70">
                  Active lots
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  Browse the full live floor
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-400">
                Every card is updating against the active auction feed, so bidders can scan value, pace, and competition at a glance.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {trulyLiveAuctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default LiveAuctions;
