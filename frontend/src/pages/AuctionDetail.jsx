import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import BidPanel from "../components/BidPanel";
import { useSocket } from "../context/SocketContext";

const AuctionDetail = () => {
  const formatINR = (amount) => `INR ${Number(amount || 0).toLocaleString("en-IN")}`;

  const { id } = useParams();
  const { socket } = useSocket();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [tick, setTick] = useState(Date.now());
  const [watchMsg, setWatchMsg] = useState("");

  const loadData = async () => {
    const { data } = await api.get(`/auctions/${id}`);
    setAuction(data);
    setBids(data.bids || []);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("auction:join", id);
    socket.on("bid:update", (payload) => {
      if (payload.auctionId !== id) return;
      setAuction((prev) => ({ ...prev, ...payload }));
      loadData();
    });

    return () => {
      socket.emit("auction:leave", id);
      socket.off("bid:update");
    };
  }, [socket, id]);

  const placeBid = async ({ amount, maxAutoBid }) => {
    try {
      setError("");
      await api.post(`/bids/${id}`, { amount, maxAutoBid });
    } catch (e) {
      setError(e.response?.data?.message || "Bid failed");
    }
  };

  const askAi = async () => {
    const { data } = await api.post(`/ai/suggest-bid/${id}`);
    setSuggestion(data);
  };

  const addWatchlist = async () => {
    try {
      await api.post(`/watchlist/${id}`);
      setWatchMsg("Added to watchlist");
    } catch (e) {
      setWatchMsg(e.response?.data?.message || "Login required");
    }
  };

  const countdown = useMemo(() => {
    if (!auction) return "";
    const diff = new Date(auction.endTime) - new Date(tick);
    if (diff <= 0) return "Ended";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
  }, [auction, tick]);

  if (!auction) return <p>Loading...</p>;

  const highestId = typeof auction.highestBidder === "object" ? auction.highestBidder?._id : auction.highestBidder;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="card overflow-hidden p-0">
          <img
            src={auction.imageUrl}
            alt={auction.title}
            className="h-52 w-full object-cover sm:h-64"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80";
            }}
          />
          <div className="p-4">
            <h1 className="text-xl font-bold sm:text-2xl">{auction.title}</h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">{auction.description}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span>Status: {auction.status}</span>
              <span>Current: {formatINR(auction.currentPrice)}</span>
              <span>Countdown: {countdown}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button className="btn-primary w-full sm:w-auto" onClick={askAi}>Get AI Bid Suggestion</button>
              <button className="btn w-full border sm:w-auto" onClick={addWatchlist}>Add Watchlist</button>
            </div>
            {watchMsg && <p className="mt-2 text-sm">{watchMsg}</p>}
            {suggestion && (
              <div className="mt-3 rounded border border-brand-500 bg-brand-50 p-3 text-sm text-black">
                Suggested Bid: {suggestion.suggestedBid} | Winning Probability: {suggestion.winningProbability}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-2 font-semibold">Live Bid Feed</h3>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {bids.map((bid) => {
              const isHighest = bid.bidder?._id === highestId;
              return (
                <div key={bid._id} className={`animate-pop rounded border p-2 text-sm ${isHighest ? "border-brand-500 bg-brand-50 text-black" : ""}`}>
                  <span className="font-semibold">{bid.bidder?.name || "Unknown"}</span> bid <b>{formatINR(bid.amount)}</b>
                  {isHighest && <span className="ml-2 rounded bg-brand-500 px-2 py-0.5 text-xs text-white">Highest</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {auction.status === "Live" ? <BidPanel auction={auction} onBid={placeBid} /> : <div className="card">Bidding is closed.</div>}
        {error && <div className="rounded border border-red-500 bg-red-100 p-2 text-red-700">{error}</div>}
      </div>
    </div>
  );
};

export default AuctionDetail;
