import { useState } from "react";

const BidPanel = ({ auction, onBid, disabled }) => {
  const [amount, setAmount] = useState("");
  const [maxAutoBid, setMaxAutoBid] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onBid({ amount: Number(amount), maxAutoBid: maxAutoBid ? Number(maxAutoBid) : null });
    setAmount("");
  };

  return (
    <form onSubmit={submit} className="card space-y-3">
      <h4 className="font-semibold">Place Bid</h4>
      <input
        type="number"
        className="w-full rounded border p-2 text-black"
        placeholder="Bid amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        min={auction.currentPrice + 1}
      />
      <input
        type="number"
        className="w-full rounded border p-2 text-black"
        placeholder="Optional max auto-bid"
        value={maxAutoBid}
        onChange={(e) => setMaxAutoBid(e.target.value)}
      />
      <button className="btn-primary w-full" disabled={disabled}>
        Submit Bid
      </button>
    </form>
  );
};

export default BidPanel;
