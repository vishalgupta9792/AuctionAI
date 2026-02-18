import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [paymentMsg, setPaymentMsg] = useState("");
  const [paidAuctionIds, setPaidAuctionIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      const notes = await api.get("/notifications");
      setNotifications(notes.data);

      if (user.role === "Seller") {
        const res = await api.get("/dashboard/seller");
        setData(res.data);
      } else if (user.role === "Bidder") {
        const [dash, watchlist, payments] = await Promise.all([
          api.get("/dashboard/bidder"),
          api.get("/watchlist"),
          api.get("/payments/my")
        ]);

        const paidIds = new Set(
          payments.data
            .filter((p) => p.status === "paid" && p.auction?._id)
            .map((p) => p.auction._id)
        );
        setPaidAuctionIds(paidIds);

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

  const payWithRazorpay = async (auction) => {
    try {
      if (paidAuctionIds.has(auction._id)) {
        setPaymentMsg(`Already paid for ${auction.title}`);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentMsg("Razorpay SDK failed to load. Check internet connection.");
        return;
      }

      const { data: order } = await api.post("/payments/create-order", {
        auctionId: auction._id,
        amount: auction.currentPrice
      });

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "AuctionAI",
        description: `Payment for ${order.auctionTitle}`,
        order_id: order.orderId,
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: { color: "#0e8a6a" },
        handler: async (response) => {
          await api.post("/payments/verify", {
            auctionId: auction._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          setPaidAuctionIds((prev) => new Set([...prev, auction._id]));
          setPaymentMsg(`Payment successful: ${response.razorpay_payment_id}`);
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setPaymentMsg(resp.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (error) {
      setPaymentMsg(error.response?.data?.message || "Unable to start payment");
    }
  };

  const wonCount = useMemo(() => data?.wonAuctions?.length || 0, [data]);

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
          <div className="card">Won Auctions: {wonCount}</div>
          <div className="card">Bid History: {data.bidHistory.length}</div>
        </div>

        <div className="card">
          <h2 className="mb-2 font-semibold">Won Auctions Payment (Razorpay)</h2>
          <ul className="space-y-2 text-sm">
            {data.wonAuctions.map((b) => {
              const isPaid = paidAuctionIds.has(b.auction?._id);
              return (
                <li key={b._id} className="flex flex-col gap-2 rounded border p-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0">{b.auction?.title} - INR {b.auction?.currentPrice}</span>
                  {isPaid ? (
                    <span className="rounded bg-emerald-600 px-3 py-1 text-xs text-white">Paid</span>
                  ) : (
                    <button className="btn-primary w-full sm:w-auto" onClick={() => payWithRazorpay(b.auction)}>Pay Now</button>
                  )}
                </li>
              );
            })}
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
