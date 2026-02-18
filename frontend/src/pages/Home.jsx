import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import AuctionCard from "../components/AuctionCard";

const Home = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    api.get("/auctions").then((res) => setAuctions(res.data));
  }, []);

  const live = useMemo(() => auctions.filter((a) => a.status === "Live"), [auctions]);
  const upcoming = useMemo(() => auctions.filter((a) => a.status === "Upcoming"), [auctions]);
  const sold = useMemo(() => auctions.filter((a) => a.status === "Ended" && a.highestBidder), [auctions]);

  return (
    <div className="space-y-7">
      <section className="rounded-3xl bg-[radial-gradient(circle_at_top_left,#0f766e,transparent_45%),linear-gradient(110deg,#052e2b,#0d9488)] p-8 text-white">
        <h1 className="text-3xl font-bold md:text-4xl">Online Auction Platform with AI</h1>
        <p className="mt-3 max-w-3xl text-sm text-emerald-100 md:text-base">
          Real-time bidding, smart AI suggestions, fraud alerts, and role-based dashboards in one production-ready platform.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-100">Live Auctions</p>
            <p className="text-2xl font-bold">{live.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-100">Upcoming</p>
            <p className="text-2xl font-bold">{upcoming.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-100">Items Sold</p>
            <p className="text-2xl font-bold">{sold.length}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured Auctions</h2>
          <span className="text-sm text-slate-400">{auctions.length} total products</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {auctions.slice(0, 6).map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Live Bidding Now</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {live.slice(0, 6).map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Recently Sold</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sold.slice(0, 6).map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
