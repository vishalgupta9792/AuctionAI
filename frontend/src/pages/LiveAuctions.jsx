import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import AuctionCard from "../components/AuctionCard";

const LiveAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    api.get("/auctions?status=Live").then((res) => setAuctions(res.data));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeLeft = useMemo(() => {
    const map = {};
    auctions.forEach((auction) => {
      const diff = new Date(auction.endTime).getTime() - tick;
      if (diff <= 0) {
        map[auction._id] = "Ended";
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      map[auction._id] = `${h}h ${m}m ${s}s`;
    });
    return map;
  }, [auctions, tick]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Live Auctions</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auction) => (
          <div key={auction._id} className="space-y-2">
            <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              Time Left: <span className="font-semibold">{timeLeft[auction._id] || "--"}</span>
            </div>
            <AuctionCard auction={auction} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveAuctions;
