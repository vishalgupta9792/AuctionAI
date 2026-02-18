import { useEffect, useState } from "react";
import api from "../api/client";
import AuctionCard from "../components/AuctionCard";

const Trending = () => {
  const [sections, setSections] = useState({ mostBids: [], highestPrice: [], endingSoon: [] });

  useEffect(() => {
    api.get("/auctions/trending").then((res) => setSections(res.data));
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Trending Auctions</h1>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Most Bids</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sections.mostBids.map((a) => <AuctionCard key={a._id} auction={a} />)}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Highest Price</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sections.highestPrice.map((a) => <AuctionCard key={a._id} auction={a} />)}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Ending Soon</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sections.endingSoon.map((a) => <AuctionCard key={a._id} auction={a} />)}
        </div>
      </div>
    </div>
  );
};

export default Trending;
