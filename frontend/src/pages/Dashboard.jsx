import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const surfaceClass =
  "rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_24px_70px_rgba(2,6,23,0.45)]";
const mutedText = "text-slate-500 dark:text-slate-400";
const subtleBorder = "border-slate-200/70 dark:border-white/10";
const accentGradients = [
  "from-emerald-400 via-teal-300 to-cyan-300",
  "from-sky-400 via-cyan-300 to-blue-300",
  "from-fuchsia-400 via-pink-300 to-rose-300",
  "from-amber-300 via-orange-300 to-red-300"
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const formatMoney = (amount, currency = "INR") => {
  const safeAmount = Number(amount || 0);
  const locale = currency === "USD" ? "en-US" : "en-IN";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(safeAmount);
  } catch {
    return `${currency} ${safeAmount.toLocaleString(locale)}`;
  }
};

const formatCompact = (value) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(value || 0));

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "Not scheduled";

const titleShort = (value = "") => (value.length > 18 ? `${value.slice(0, 18)}...` : value);

const initials = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("");

const uniqueBidsByAuction = (items = []) => {
  const seen = new Set();
  return items.filter((entry) => {
    const key = entry.auction?._id || entry._id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const statusTone = {
  Live: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  Upcoming: "border-sky-400/20 bg-sky-500/10 text-sky-300",
  Ended: "border-slate-400/20 bg-slate-500/10 text-slate-300",
  paid: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  failed: "border-rose-400/20 bg-rose-500/10 text-rose-300",
  created: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  Admin: "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300",
  Seller: "border-sky-400/20 bg-sky-500/10 text-sky-300",
  Bidder: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  No: "border-slate-400/20 bg-slate-500/10 text-slate-300",
  Yes: "border-rose-400/20 bg-rose-500/10 text-rose-300",
  High: "border-rose-400/20 bg-rose-500/10 text-rose-300",
  Medium: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  Low: "border-sky-400/20 bg-sky-500/10 text-sky-300"
};

const PageHero = ({ eyebrow, title, subtitle, chips = [] }) => (
  <section
    className={`relative overflow-hidden ${surfaceClass} bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_26%)] p-6 sm:p-8`}
  >
    <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl" />
    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">{eyebrow}</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h1>
          <p className={`max-w-2xl text-sm leading-6 sm:text-base ${mutedText}`}>{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
        {chips.map((chip, index) => (
          <div
            key={chip.label}
            className="rounded-2xl border border-white/10 bg-white/60 p-4 shadow-inner shadow-white/5 dark:bg-white/5"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{chip.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{chip.value}</p>
            <div className={`mt-3 h-1.5 rounded-full bg-gradient-to-r ${accentGradients[index % accentGradients.length]}`} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const StatCard = ({ label, value, meta, index = 0 }) => (
  <div className={`${surfaceClass} overflow-hidden p-5`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
        {meta ? <p className={`mt-2 text-sm ${mutedText}`}>{meta}</p> : null}
      </div>
      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${accentGradients[index % accentGradients.length]} p-[1px]`}>
        <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-white text-sm font-semibold text-slate-900 dark:bg-slate-950 dark:text-white">
          {String(label).slice(0, 2).toUpperCase()}
        </div>
      </div>
    </div>
    <div className={`mt-5 h-1.5 rounded-full bg-gradient-to-r ${accentGradients[index % accentGradients.length]}`} />
  </div>
);

const SectionCard = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`${surfaceClass} p-5 sm:p-6 ${className}`}>
    {(title || subtitle || action) && (
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          {title ? <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2> : null}
          {subtitle ? <p className={`text-sm ${mutedText}`}>{subtitle}</p> : null}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

const StatusBadge = ({ value }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
      statusTone[value] || "border-slate-400/20 bg-slate-500/10 text-slate-300"
    }`}
  >
    {value}
  </span>
);

const EmptyState = ({ title, description }) => (
  <div className="rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/70 p-8 text-center dark:border-white/10 dark:bg-slate-950/30">
    <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</p>
    <p className={`mt-2 text-sm ${mutedText}`}>{description}</p>
  </div>
);
const BarChartCard = ({ title, subtitle, items, formatter = (value) => value }) => {
  const max = Math.max(...items.map((item) => item.value || 0), 1);

  return (
    <SectionCard title={title} subtitle={subtitle}>
      {items.length ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{item.label}</p>
                  {item.meta ? <p className={`text-xs ${mutedText}`}>{item.meta}</p> : null}
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatter(item.value)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200/80 dark:bg-white/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${accentGradients[index % accentGradients.length]}`}
                  style={{ width: `${Math.max((item.value / max) * 100, item.value ? 10 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No chart data yet" description="This chart will light up as activity builds across the platform." />
      )}
    </SectionCard>
  );
};

const DonutChartCard = ({ title, subtitle, items, centerLabel = "Total", formatter = (value) => value }) => {
  const filtered = items.filter((item) => item.value > 0);
  const total = filtered.reduce((sum, item) => sum + item.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <SectionCard title={title} subtitle={subtitle}>
      {filtered.length ? (
        <div className="grid gap-6 lg:grid-cols-[180px,1fr] lg:items-center">
          <div className="relative mx-auto h-44 w-44">
            <svg viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="10" />
              {filtered.map((item, index) => {
                const dash = (item.value / total) * circumference;
                const circle = (
                  <circle
                    key={item.label}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={["#34d399", "#38bdf8", "#f472b6", "#f59e0b"][index % 4]}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                  />
                );
                offset += dash;
                return circle;
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{centerLabel}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{formatter(total)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((item, index) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: ["#34d399", "#38bdf8", "#f472b6", "#f59e0b"][index % 4] }}
                  />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{item.label}</p>
                    {item.meta ? <p className={`text-xs ${mutedText}`}>{item.meta}</p> : null}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">{formatter(item.value)}</p>
                  <p className={`text-xs ${mutedText}`}>{Math.round((item.value / total) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title="Nothing to break down yet" description="Once the platform records activity, this mix chart will populate automatically." />
      )}
    </SectionCard>
  );
};

const LineChartCard = ({ title, subtitle, items, formatter = (value) => value }) => {
  if (!items.length) {
    return (
      <SectionCard title={title} subtitle={subtitle}>
        <EmptyState title="No activity points yet" description="As bids and transactions happen, this performance chart will become more detailed." />
      </SectionCard>
    );
  }

  const values = items.map((item) => item.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const width = 320;
  const height = 140;
  const step = items.length === 1 ? width : width / (items.length - 1);

  const points = items
    .map((item, index) => {
      const x = index * step;
      const y = height - ((item.value - min) / Math.max(max - min || 1, 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <svg viewBox={`0 0 ${width} ${height + 12}`} className="h-40 w-full">
            <defs>
              <linearGradient id="dashboardLine" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            <polyline fill="none" stroke="url(#dashboardLine)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={points} />
            {items.map((item, index) => {
              const x = index * step;
              const y = height - ((item.value - min) / Math.max(max - min || 1, 1)) * height;
              return <circle key={item.label} cx={x} cy={y} r="4.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />;
            })}
          </svg>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/5">
              <p className={`text-xs uppercase tracking-[0.18em] ${mutedText}`}>{item.label}</p>
              <p className="mt-2 font-semibold text-slate-900 dark:text-white">{formatter(item.value)}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
};

const ProfileRow = ({ title, subtitle, meta, badge }) => (
  <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/75 p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
    <div className="min-w-0">
      <p className="truncate font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className={`mt-1 truncate text-sm ${mutedText}`}>{subtitle}</p>
      {meta ? <p className={`mt-2 text-xs ${mutedText}`}>{meta}</p> : null}
    </div>
    {badge}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [paymentMsg, setPaymentMsg] = useState("");
  const [paidAuctionIds, setPaidAuctionIds] = useState(new Set());
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const notes = await api.get("/notifications");
        if (!active) return;
        setNotifications(notes.data);

        if (user.role === "Seller") {
          const res = await api.get("/dashboard/seller");
          if (!active) return;
          setData(res.data);
          return;
        }

        if (user.role === "Bidder") {
          const [dash, watchlist, payments] = await Promise.all([
            api.get("/dashboard/bidder"),
            api.get("/watchlist"),
            api.get("/payments/my")
          ]);

          if (!active) return;

          const paidIds = new Set(
            payments.data
              .filter((item) => item.status === "paid" && item.auction?._id)
              .map((item) => item.auction._id)
          );

          setPaidAuctionIds(paidIds);
          setData({ ...dash.data, watchlist: watchlist.data, payments: payments.data });
          return;
        }

        const [stats, users, fraud, payments] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/admin/fraud"),
          api.get("/admin/payments")
        ]);

        if (!active) return;

        setData({
          stats: stats.data,
          users: users.data,
          fraud: fraud.data,
          payments: payments.data
        });
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || "Unable to load dashboard right now.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [refreshTick, user]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, read: true } : item)));
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
        amount: auction.currentPrice,
        currency: selectedCurrency
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
          setRefreshTick((prev) => prev + 1);
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setPaymentMsg(resp.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (err) {
      setPaymentMsg(err.response?.data?.message || "Unable to start payment");
    }
  };

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }),
    [data, notifications]
  );

  const bidderData = useMemo(() => {
    if (user.role !== "Bidder" || !data) return null;

    const activeBids = uniqueBidsByAuction(data.activeBids || []);
    const wonAuctions = uniqueBidsByAuction(data.wonAuctions || []);
    const watchlist = data.watchlist || [];
    const bidHistory = data.bidHistory || [];
    const totalBidValue = bidHistory.reduce((sum, item) => sum + (item.amount || 0), 0);

    return {
      activeBids,
      wonAuctions,
      watchlist,
      bidHistory,
      totalBidValue,
      lineItems: bidHistory
        .slice(0, 6)
        .reverse()
        .map((item) => ({
          label: titleShort(item.auction?.title || "Auction"),
          value: item.amount || 0
        })),
      mixItems: [
        { label: "Active bids", value: activeBids.length, meta: "Currently competing" },
        { label: "Won lots", value: wonAuctions.length, meta: "Ready for checkout" },
        { label: "Watchlist", value: watchlist.length, meta: "Saved for later" }
      ]
    };
  }, [data, user.role]);

  const sellerData = useMemo(() => {
    if (user.role !== "Seller" || !data) return null;

    const auctions = data.auctions || [];
    const liveCount = auctions.filter((item) => item.status === "Live").length;
    const upcomingCount = auctions.filter((item) => item.status === "Upcoming").length;
    const endedCount = auctions.filter((item) => item.status === "Ended").length;
    const topLots = [...auctions]
      .sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0))
      .slice(0, 5)
      .map((item) => ({
        label: titleShort(item.title),
        value: item.currentPrice || 0,
        meta: `${item.bidCount || 0} bids`
      }));

    const bidPulse = [...auctions]
      .sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0))
      .slice(0, 6)
      .map((item) => ({
        label: titleShort(item.title),
        value: item.bidCount || 0
      }));

    return {
      auctions,
      liveCount,
      upcomingCount,
      endedCount,
      averageAuctionValue: auctions.length ? data.revenue / auctions.length : 0,
      mixItems: [
        { label: "Live lots", value: liveCount, meta: "Active bidding now" },
        { label: "Upcoming", value: upcomingCount, meta: "Scheduled inventory" },
        { label: "Closed", value: endedCount, meta: "Completed cycles" }
      ],
      topLots,
      bidPulse
    };
  }, [data, user.role]);

  const adminData = useMemo(() => {
    if (user.role !== "Admin" || !data) return null;

    const users = data.users || [];
    const payments = data.payments || [];
    const fraud = data.fraud || [];
    const roleCounts = users.reduce((acc, item) => {
      acc[item.role] = (acc[item.role] || 0) + 1;
      return acc;
    }, {});
    const paymentCounts = payments.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    const paidVolume = payments
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    return {
      users,
      payments,
      fraud,
      roleSplit: [
        { label: "Admins", value: roleCounts.Admin || 0, meta: "Platform operators" },
        { label: "Sellers", value: roleCounts.Seller || 0, meta: "Inventory creators" },
        { label: "Bidders", value: roleCounts.Bidder || 0, meta: "Buyer side activity" }
      ],
      paymentSplit: [
        { label: "Paid", value: paymentCounts.paid || 0, meta: "Cleared successfully" },
        { label: "Pending", value: paymentCounts.created || 0, meta: "Awaiting checkout" },
        { label: "Failed", value: paymentCounts.failed || 0, meta: "Needs retry" }
      ],
      commandBars: [
        { label: "Users", value: data.stats.users, meta: "Registered accounts" },
        { label: "Auctions", value: data.stats.auctions, meta: "Listings across roles" },
        { label: "Bids", value: data.stats.bids, meta: "Marketplace interactions" },
        { label: "Fraud reports", value: data.stats.fraudReports, meta: "Risk signals" }
      ],
      paidVolume
    };
  }, [data, user.role]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={`${surfaceClass} h-52 animate-pulse bg-slate-200/60 dark:bg-white/5`} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className={`${surfaceClass} h-36 animate-pulse bg-slate-200/60 dark:bg-white/5`} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <SectionCard title="Dashboard unavailable" subtitle="The workspace data did not load correctly.">
        <EmptyState title="Unable to load data" description={error} />
      </SectionCard>
    );
  }

  if (user.role === "Seller" && sellerData) {
    return (
      <div className="space-y-6">
        <PageHero
          eyebrow="Seller Studio"
          title="Premium seller workspace"
          subtitle="Track listing momentum, revenue strength, and live auction health from one polished command surface."
          chips={[
            { label: "Live lots", value: sellerData.liveCount },
            { label: "Revenue", value: formatMoney(data.revenue) },
            { label: "Synced", value: lastUpdated }
          ]}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total auctions" value={data.totalAuctions} meta="Full inventory under your account" index={0} />
          <StatCard label="Bid traffic" value={data.totalBids} meta="Buyer engagement across all lots" index={1} />
          <StatCard label="Average value" value={formatMoney(sellerData.averageAuctionValue)} meta="Current average lot value" index={2} />
          <StatCard label="Unread notes" value={unreadNotifications} meta="Notifications waiting for action" index={3} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <BarChartCard
            title="Top performing lots"
            subtitle="Your strongest auctions by current price."
            items={sellerData.topLots}
            formatter={(value) => formatMoney(value)}
          />
          <DonutChartCard title="Inventory mix" subtitle="How your catalog is distributed right now." items={sellerData.mixItems} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <LineChartCard
            title="Bid pulse"
            subtitle="Where buyer attention is concentrating across your auctions."
            items={sellerData.bidPulse}
            formatter={(value) => `${value} bids`}
          />
          <SectionCard title="Command inventory" subtitle="Every lot with pricing, bid depth, and closing windows.">
            {sellerData.auctions.length ? (
              <div className="space-y-3">
                {sellerData.auctions.map((auction) => (
                  <ProfileRow
                    key={auction._id}
                    title={auction.title}
                    subtitle={`${formatMoney(auction.currentPrice)} current • ${auction.bidCount || 0} bids`}
                    meta={`Base ${formatMoney(auction.basePrice)} • Ends ${formatDate(auction.endTime)}`}
                    badge={<StatusBadge value={auction.status} />}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No auctions yet" description="Create your first listing and the dashboard will begin tracking seller analytics here." />
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Seller notifications"
          subtitle="System prompts, bid updates, and operational nudges."
          action={<StatusBadge value={unreadNotifications ? "Live" : "Ended"} />}
        >
          {notifications.length ? (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-slate-50/75 p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{item.message}</p>
                    <p className={`mt-1 text-xs ${mutedText}`}>{item.read ? "Read" : "Unread"} notification</p>
                  </div>
                  {!item.read ? (
                    <button className="btn-primary w-full md:w-auto" onClick={() => markRead(item._id)}>
                      Mark read
                    </button>
                  ) : (
                    <StatusBadge value="paid" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No notifications" description="You are clear for now. New auction events will appear here as they happen." />
          )}
        </SectionCard>
      </div>
    );
  }

  if (user.role === "Bidder" && bidderData) {
    return (
      <div className="space-y-6">
        <PageHero
          eyebrow="Bidder Portfolio"
          title="A sharper auction cockpit"
          subtitle="Stay on top of active competitions, payouts, saved lots, and recent bidding momentum from one premium control deck."
          chips={[
            { label: "Active", value: bidderData.activeBids.length },
            { label: "Won", value: bidderData.wonAuctions.length },
            { label: "Tracked", value: bidderData.watchlist.length }
          ]}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active bids" value={bidderData.activeBids.length} meta="Lots where you are still in play" index={0} />
          <StatCard label="Won auctions" value={bidderData.wonAuctions.length} meta="Lots ready for secure checkout" index={1} />
          <StatCard label="Bid history" value={bidderData.bidHistory.length} meta="Lifetime bidding actions on this account" index={2} />
          <StatCard label="Bid volume" value={formatMoney(bidderData.totalBidValue)} meta="Total value across bid history" index={3} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <LineChartCard
            title="Bid trail"
            subtitle="Your latest bid curve across recent auction interactions."
            items={bidderData.lineItems}
            formatter={(value) => formatMoney(value)}
          />
          <DonutChartCard title="Portfolio mix" subtitle="Where your attention is split right now." items={bidderData.mixItems} />
        </div>

        <SectionCard
          title="Won auctions checkout"
          subtitle="Currency selection affects checkout. Paid lots are marked automatically after verification."
          action={
            <div className="flex items-center gap-2">
              <label htmlFor="currency" className={`text-xs uppercase tracking-[0.24em] ${mutedText}`}>
                Currency
              </label>
              <select
                id="currency"
                className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                <option value="INR" className="text-black">
                  INR
                </option>
                <option value="USD" className="text-black">
                  USD
                </option>
              </select>
            </div>
          }
        >
          {bidderData.wonAuctions.length ? (
            <div className="space-y-3">
              {bidderData.wonAuctions.map((item) => {
                const auction = item.auction;
                const isPaid = paidAuctionIds.has(auction?._id);

                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%)] p-4 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_30%),rgba(255,255,255,0.03)] md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-slate-900 dark:text-white">{auction?.title}</p>
                      <p className={`mt-1 text-sm ${mutedText}`}>
                        Winning amount {formatMoney(auction?.currentPrice, selectedCurrency)} • Closed {formatDate(auction?.endTime)}
                      </p>
                    </div>
                    {isPaid ? (
                      <StatusBadge value="paid" />
                    ) : (
                      <button className="btn-primary w-full md:w-auto" onClick={() => payWithRazorpay(auction)}>
                        Pay Now
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No won lots yet" description="Win an auction and the payment panel will appear here with instant checkout." />
          )}
          {paymentMsg ? <p className="mt-4 text-sm font-medium text-emerald-500">{paymentMsg}</p> : null}
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
          <SectionCard title="Active bidbook" subtitle="The lots where you are currently competing.">
            {bidderData.activeBids.length ? (
              <div className="space-y-3">
                {bidderData.activeBids.map((item) => (
                  <ProfileRow
                    key={item._id}
                    title={item.auction?.title || "Auction"}
                    subtitle={`${formatMoney(item.amount)} your latest bid`}
                    meta={`Current lot value ${formatMoney(item.auction?.currentPrice)} • Ends ${formatDate(item.auction?.endTime)}`}
                    badge={<StatusBadge value={item.auction?.status || "Live"} />}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No active bids" description="Jump into a live auction and your active positions will appear here." />
            )}
          </SectionCard>

          <SectionCard title="Watchlist" subtitle="Saved products you may want to pursue next.">
            {bidderData.watchlist.length ? (
              <div className="space-y-3">
                {bidderData.watchlist.map((auction) => (
                  <ProfileRow
                    key={auction._id}
                    title={auction.title}
                    subtitle={`${formatMoney(auction.currentPrice)} current price`}
                    meta={`Auction ends ${formatDate(auction.endTime)}`}
                    badge={<StatusBadge value={auction.status} />}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="Watchlist empty" description="Save interesting auctions and keep them organized here." />
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <SectionCard title="Recent bid ledger" subtitle="A clean view of your most recent bidding activity.">
            {bidderData.bidHistory.length ? (
              <div className="space-y-3">
                {bidderData.bidHistory.slice(0, 8).map((item) => (
                  <ProfileRow
                    key={item._id}
                    title={item.auction?.title || "Auction"}
                    subtitle={`${formatMoney(item.amount)} bid placed`}
                    meta={`Recorded ${formatDate(item.createdAt)}`}
                    badge={<StatusBadge value={item.auction?.status || "Live"} />}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No bid history yet" description="Once you start bidding, this ledger will tell the full story." />
            )}
          </SectionCard>

          <SectionCard title="Notifications" subtitle="Bid updates, wins, and reminders from the platform.">
            {notifications.length ? (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-3xl border border-slate-200/70 bg-slate-50/75 p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{item.message}</p>
                        <p className={`mt-1 text-xs ${mutedText}`}>{item.read ? "Read" : "Unread"} notification</p>
                      </div>
                      {!item.read ? (
                        <button className="rounded-full border border-slate-300 px-3 py-1 text-xs dark:border-white/10" onClick={() => markRead(item._id)}>
                          Mark read
                        </button>
                      ) : (
                        <StatusBadge value="paid" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Inbox clear" description="Fresh platform signals will appear here as auctions evolve." />
            )}
          </SectionCard>
        </div>
      </div>
    );
  }

  if (user.role === "Admin" && adminData) {
    return (
      <div className="space-y-6">
        <PageHero
          eyebrow="Admin Control"
          title="A premium operations dashboard"
          subtitle="Monitor platform health, account mix, payment behavior, and risk posture from a cleaner, more executive-grade command center."
          chips={[
            { label: "Users", value: adminData.users.length },
            { label: "Paid volume", value: formatMoney(adminData.paidVolume) },
            { label: "Last sync", value: lastUpdated }
          ]}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Users" value={data.stats.users} meta="Total registered accounts" index={0} />
          <StatCard label="Auctions" value={data.stats.auctions} meta="All platform listings" index={1} />
          <StatCard label="Bids" value={data.stats.bids} meta="Total bid interactions" index={2} />
          <StatCard label="Fraud" value={data.stats.fraudReports} meta="Open risk signals" index={3} />
          <StatCard label="Payments" value={adminData.payments.length} meta="Checkout attempts tracked" index={0} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <BarChartCard
            title="Platform volume"
            subtitle="Core system counters, useful for quick health checks."
            items={adminData.commandBars}
            formatter={(value) => formatCompact(value)}
          />
          <DonutChartCard title="User role split" subtitle="How the marketplace audience is currently composed." items={adminData.roleSplit} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
          <DonutChartCard title="Payment health" subtitle="Checkout outcomes across the marketplace." items={adminData.paymentSplit} centerLabel="Payments" />
          <SectionCard title="Operator roster" subtitle="Recent platform users with role and risk visibility.">
            <div className="space-y-3">
              {adminData.users.map((account) => (
                <div
                  key={account._id}
                  className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/75 p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-300 to-sky-300 text-sm font-semibold text-slate-950">
                      {initials(account.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{account.name}</p>
                      <p className={`text-sm ${mutedText}`}>{account.email}</p>
                      <p className={`mt-1 text-xs ${mutedText}`}>Joined {formatDate(account.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={account.role} />
                    <StatusBadge value={account.isFlagged ? "Yes" : "No"} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
          <SectionCard title="Fraud watch" subtitle="Accounts and reports that need attention from the admin team.">
            {adminData.fraud.length ? (
              <div className="space-y-3">
                {adminData.fraud.map((report) => (
                  <div
                    key={report._id}
                    className="rounded-3xl border border-rose-400/15 bg-rose-500/5 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{report.user?.name || "Unknown user"}</p>
                        <p className={`text-sm ${mutedText}`}>{report.reason}</p>
                        <p className={`mt-1 text-xs ${mutedText}`}>{report.auction?.title ? `Auction: ${report.auction.title}` : "Auction context unavailable"}</p>
                      </div>
                      <StatusBadge value={report.severity || "Medium"} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No flagged fraud accounts" description="Risk monitors are clean right now. If suspicious bidding appears, it will show up here." />
            )}
          </SectionCard>

          <LineChartCard
            title="Payment activity pulse"
            subtitle="Most recent payment records represented as sequential value points."
            items={adminData.payments
              .slice(0, 6)
              .reverse()
              .map((payment) => ({
                label: titleShort(payment.auction?.title || payment.status),
                value: payment.amount || 0
              }))}
            formatter={(value) => formatMoney(value)}
          />
        </div>

        <SectionCard title="All payments" subtitle="Full payment ledger with state, order tracking, and checkout visibility.">
          {adminData.payments.length ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50/80 dark:bg-white/5">
                    <tr className={`border-b ${subtleBorder}`}>
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Auction</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Order ID</th>
                      <th className="px-4 py-3 font-semibold">Payment ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData.payments.map((payment) => (
                      <tr key={payment._id} className={`border-b align-top ${subtleBorder}`}>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900 dark:text-white">{payment.user?.name || "-"}</p>
                          <p className={`mt-1 text-xs ${mutedText}`}>{payment.user?.email || "No email"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900 dark:text-white">{payment.auction?.title || "-"}</p>
                          <p className={`mt-1 text-xs ${mutedText}`}>{formatDate(payment.createdAt)}</p>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{formatMoney(payment.amount, payment.currency)}</td>
                        <td className="px-4 py-4">
                          <StatusBadge value={payment.status} />
                        </td>
                        <td className="px-4 py-4">
                          <span className={`block max-w-[180px] break-all text-xs ${mutedText}`}>{payment.orderId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`block max-w-[180px] break-all text-xs ${mutedText}`}>{payment.paymentId || "-"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState title="No payment activity yet" description="As checkout events happen, the full ledger will appear here with richer financial visibility." />
          )}
        </SectionCard>
      </div>
    );
  }

  return null;
};

export default Dashboard;
