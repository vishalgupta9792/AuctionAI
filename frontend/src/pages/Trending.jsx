import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import AuctionCard from "../components/AuctionCard";
import { formatINR, getAuctionImage } from "../utils/auctionHelpers";

const SectionBlock = ({ eyebrow, title, subtitle, items }) => (
  <section className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-amber-300/75">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
      </div>
      <p className="max-w-xl text-sm leading-6 text-slate-400">{subtitle}</p>
    </div>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((auction) => (
        <AuctionCard key={auction._id} auction={auction} />
      ))}
    </div>
  </section>
);

const Trending = () => {
  const [sections, setSections] = useState({ mostBids: [], highestPrice: [], endingSoon: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const { data } = await api.get("/auctions/trending");
        setSections(data);
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
    const refresh = setInterval(loadTrending, 20000);
    return () => clearInterval(refresh);
  }, []);

  const spotlight = useMemo(
    () => sections.mostBids[0] || sections.highestPrice[0] || sections.endingSoon[0],
    [sections]
  );

  const momentumStats = useMemo(() => {
    const flat = [...sections.mostBids, ...sections.highestPrice, ...sections.endingSoon];
    const unique = Array.from(new Map(flat.map((item) => [item._id, item])).values());

    return {
      totalTracked: unique.length,
      mostBids: Math.max(...unique.map((item) => Number(item.bidCount || 0)), 0),
      topValue: Math.max(...unique.map((item) => Number(item.currentPrice || 0)), 0)
    };
  }, [sections]);

  if (loading) {
    return (
      <div className="rounded-[30px] border border-white/10 bg-slate-900/70 p-8 text-slate-300 shadow-[0_20px_60px_rgba(15,23,42,0.24)]">
        Loading trending auctions...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[34px] border border-amber-300/15 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_36%),linear-gradient(135deg,_rgba(69,26,3,0.95),_rgba(15,23,42,0.98))] p-6 text-white shadow-[0_30px_90px_rgba(120,53,15,0.3)] md:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_52%)] lg:block" />
        <div className="relative space-y-6">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-100">
              Trending intelligence
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                See which lots are pulling attention, price, and last-minute urgency.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-amber-50/80 md:text-lg">
                This board surfaces the auctions with the strongest traction, highest value movement, and the shortest close horizon.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-100/70">Tracked Lots</p>
              <p className="mt-4 text-4xl font-semibold">{momentumStats.totalTracked}</p>
              <p className="mt-2 text-sm text-amber-50/75">Unique auctions inside the premium trend board.</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-100/70">Top Bid Count</p>
              <p className="mt-4 text-4xl font-semibold">{momentumStats.mostBids}</p>
              <p className="mt-2 text-sm text-amber-50/75">Current highest engagement among trending items.</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-100/70">Peak Value</p>
              <p className="mt-4 text-4xl font-semibold">{formatINR(momentumStats.topValue)}</p>
              <p className="mt-2 text-sm text-amber-50/75">Strongest live valuation across all trending categories.</p>
            </div>
          </div>
        </div>
      </section>

      {spotlight && (
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[340px] overflow-hidden">
              <img
                src={getAuctionImage(spotlight)}
                alt={spotlight.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/48 to-transparent" />
              <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-3">
                <span className="rounded-full bg-amber-300 px-4 py-1.5 text-sm font-semibold text-slate-950">
                  Trending spotlight
                </span>
                <span className="rounded-full border border-white/10 bg-slate-950/55 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
                  {spotlight.bidCount || 0} bids
                </span>
              </div>
              <div className="absolute inset-x-6 bottom-6 max-w-md space-y-3">
                <p className="text-xs uppercase tracking-[0.32em] text-amber-200/80">
                  Seller {spotlight?.seller?.name || "Auction Seller"}
                </p>
                <h2 className="text-3xl font-semibold text-white md:text-4xl">
                  {spotlight.title}
                </h2>
                <p className="text-sm leading-6 text-slate-200/80 md:text-base">
                  {spotlight.description}
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 md:p-7">
              <div className="rounded-[26px] border border-amber-300/20 bg-amber-400/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-amber-200/75">Current Price</p>
                <p className="mt-3 text-4xl font-semibold text-white">{formatINR(spotlight.currentPrice)}</p>
                <p className="mt-2 text-sm text-amber-50/75">
                  This lot is currently setting the pace across the trend board.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Base Price</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{formatINR(spotlight.basePrice)}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Bid Count</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{spotlight.bidCount || 0}</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Momentum Mix</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>Bid intensity</span>
                      <span>{spotlight.bidCount || 0}/10</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400"
                        style={{
                          width: `${Math.min(100, Math.max(16, (Number(spotlight.bidCount || 0) / 10) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>Value heat</span>
                      <span>{formatINR(spotlight.currentPrice)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <SectionBlock
        eyebrow="Most bids"
        title="High-competition lots"
        subtitle="These auctions are attracting the heaviest bidder traffic and tend to produce the sharpest final-minute swings."
        items={sections.mostBids}
      />

      <SectionBlock
        eyebrow="Highest value"
        title="Premium-ticket listings"
        subtitle="Top-end lots with the strongest current valuation, curated for buyers looking at serious inventory."
        items={sections.highestPrice}
      />

      <SectionBlock
        eyebrow="Ending soon"
        title="Fast-closing opportunities"
        subtitle="The shortest close windows on the board, where hesitation usually costs bidding position."
        items={sections.endingSoon}
      />
    </div>
  );
};

export default Trending;
