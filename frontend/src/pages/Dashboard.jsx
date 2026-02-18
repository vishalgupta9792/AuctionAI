import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [paymentMsg, setPaymentMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const notes = await api.get("/notifications");
      setNotifications(notes.data);

      if (user.role === "Seller") {
        const res = await api.get("/dashboard/seller");
        setData(res.data);
      } else if (user.role === "Bidder") {
        const [dash, watchlist] = await Promise.all([
          api.get("/dashboard/bidder"),
          api.get("/watchlist")
        ]);
        setData({ ...dash.data, watchlist: watchlist.data });
      } else {
        const [stats, users, fraud] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/admin/fraud")
        ]);
        setData({ stats: stats.data, users: users.data, fraud: fraud.data });
      }
    };
    load();
  }, [user]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  const simulatePayment = async (auction) => {
    const { data: pay } = await api.post("/payments/simulate", {
      auctionId: auction._id,
      amount: auction.currentPrice
    });
    setPaymentMsg(`Payment success: ${pay.transactionId}`);
  };

  if (!data) return <p>Loading dashboard...</p>;

  if (user.role === "Seller") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card">Total Auctions: {data.totalAuctions}</div>
          <div className="card">Total Bids: {data.totalBids}</div>
          <div className="card">Revenue Summary: ${data.revenue}</div>
        </div>
        <div className="card">
          <h2 className="mb-2 font-semibold">Notifications</h2>
          <ul className="space-y-2 text-sm">
            {notifications.map((n) => (
              <li key={n._id} className="flex flex-wrap items-start gap-2">
                <span className="min-w-0 flex-1">{n.message}</span>
                {!n.read && <button className="rounded border px-2 py-0.5" onClick={() => markRead(n._id)}>Mark read</button>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (user.role === "Bidder") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Bidder Dashboard</h1>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card">Active Bids: {data.activeBids.length}</div>
          <div className="card">Won Auctions: {data.wonAuctions.length}</div>
          <div className="card">Bid History: {data.bidHistory.length}</div>
        </div>

        <div className="card">
          <h2 className="mb-2 font-semibold">Won Auctions Payment (Dummy)</h2>
          <ul className="space-y-2 text-sm">
            {data.wonAuctions.map((b) => (
              <li key={b._id} className="flex flex-col gap-2 rounded border p-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0">{b.auction?.title} - ${b.auction?.currentPrice}</span>
                <button className="btn-primary w-full sm:w-auto" onClick={() => simulatePayment(b.auction)}>Pay Now</button>
              </li>
            ))}
          </ul>
          {paymentMsg && <p className="mt-2 text-sm">{paymentMsg}</p>}
        </div>

        <div className="card">
          <h2 className="mb-2 font-semibold">Watchlist</h2>
          <ul className="space-y-1 text-sm">
            {data.watchlist.map((a) => (
              <li key={a._id}>{a.title} - ${a.currentPrice}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="mb-2 font-semibold">Notifications</h2>
          <ul className="space-y-2 text-sm">
            {notifications.map((n) => (
              <li key={n._id} className="flex flex-wrap items-start gap-2">
                <span className="min-w-0 flex-1">{n.message}</span>
                {!n.read && <button className="rounded border px-2 py-0.5" onClick={() => markRead(n._id)}>Mark read</button>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">Users: {data.stats.users}</div>
        <div className="card">Auctions: {data.stats.auctions}</div>
        <div className="card">Bids: {data.stats.bids}</div>
        <div className="card">Fraud Reports: {data.stats.fraudReports}</div>
      </div>
      <div className="card">
        <h2 className="mb-2 font-semibold">Users</h2>
        <ul className="space-y-1 break-words text-sm">
          {data.users.map((u) => (
            <li key={u._id}>{u.name} | {u.email} | {u.role} | Flagged: {u.isFlagged ? "Yes" : "No"}</li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h2 className="mb-2 font-semibold">Flagged Fraud Accounts</h2>
        <ul className="space-y-1 break-words text-sm">
          {data.fraud.map((f) => (
            <li key={f._id}>{f.user?.name} | {f.reason} | {f.severity}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
