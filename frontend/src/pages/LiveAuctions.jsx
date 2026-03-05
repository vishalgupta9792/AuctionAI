import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import AuctionCard from "../components/AuctionCard";
import { getCountdownText } from "../utils/auctionHelpers";

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Live Auctions</h1>
        <span className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
          {trulyLiveAuctions.length} auctions live now
        </span>
      </div>

      {loading ? (
        <div className="card">Loading live auctions...</div>
      ) : trulyLiveAuctions.length === 0 ? (
        <div className="card text-sm text-slate-400">
          No live auctions right now. Check back in a few minutes or create a new auction from Sell Item.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trulyLiveAuctions.map((auction) => (
            <div key={auction._id} className="space-y-2">
              <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                Time Left: <span className="font-semibold">{getCountdownText(auction.endTime, tick)}</span>
              </div>
              <AuctionCard auction={auction} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveAuctions;
