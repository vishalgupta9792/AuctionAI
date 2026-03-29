import { useMemo, useState } from "react";
import api from "../api/client";
import {
  FALLBACK_AUCTION_IMAGE,
  formatINR,
  getAuctionImage
} from "../utils/auctionHelpers";

const metricGradients = [
  "from-emerald-400 to-cyan-300",
  "from-sky-400 to-blue-300",
  "from-fuchsia-400 to-rose-300"
];

const formatLocalDate = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

const SellItem = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    basePrice: "",
    startTime: "",
    endTime: ""
  });
  const [message, setMessage] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const smartPreview = useMemo(
    () =>
      getAuctionImage({
        imageUrl: form.imageUrl,
        title: form.title,
        description: form.description
      }),
    [form.imageUrl, form.title, form.description]
  );

  const durationLabel = useMemo(() => {
    if (!form.startTime || !form.endTime) return "Add start and end times to calculate the auction window.";
    const start = new Date(form.startTime).getTime();
    const end = new Date(form.endTime).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "End time should be later than the start time.";
    const diffHours = ((end - start) / (1000 * 60 * 60)).toFixed(1);
    return `${diffHours} hour listing window`;
  }, [form.endTime, form.startTime]);

  const previewTitle = form.title || "Your premium auction listing";
  const previewDescription =
    form.description ||
    "Describe rarity, condition, bundle details, and why bidders should pay attention to this lot.";

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auctions", { ...form, basePrice: Number(form.basePrice) });
      setMessage("Auction created successfully");
      setForm({ title: "", description: "", imageUrl: "", basePrice: "", startTime: "", endTime: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create auction");
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[34px] border border-emerald-400/10 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.15),transparent_18%),linear-gradient(120deg,#07131f,#0f172a_35%,#134e4a_120%)] p-8 text-white shadow-[0_26px_80px_rgba(8,47,73,0.35)]">
        <div className="absolute -left-12 top-8 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1.1fr,0.9fr] xl:items-end">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-100">
              Seller Studio
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Launch a premium auction listing with a stronger first impression</h1>
              <p className="max-w-3xl text-base leading-8 text-emerald-50/80">
                Build a high-conviction lot with clean pricing, strong timing, visual previewing, and presentation that feels ready for serious bidders.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Preview ready", value: form.title ? "Yes" : "Waiting" },
              { label: "Base price", value: form.basePrice ? formatINR(form.basePrice) : "Not set" },
              { label: "Schedule", value: form.startTime && form.endTime ? "Planned" : "Draft" }
            ].map((metric, index) => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/75">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                <div className={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${metricGradients[index % metricGradients.length]}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/75">
          <div className="border-b border-slate-200/80 px-6 py-5 dark:border-white/10">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-500">Live Preview</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Auction Presentation</h2>
          </div>

          <div className="p-6">
            <div className="overflow-hidden rounded-[26px] border border-slate-200/80 dark:border-white/10">
              <div className="relative h-80 overflow-hidden bg-slate-100 dark:bg-slate-950/40">
                <img
                  src={smartPreview}
                  alt="Auction preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_AUCTION_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950">
                  Draft Listing
                </div>
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/75">Featured Lot</p>
                    <h3 className="mt-2 line-clamp-2 text-2xl font-semibold text-white">{previewTitle}</h3>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-200/70">Opening Price</p>
                    <p className="mt-2 text-xl font-semibold text-white">{form.basePrice ? formatINR(form.basePrice) : "Set price"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Description</p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{previewDescription}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Schedule Overview</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Starts:</span> {formatLocalDate(form.startTime)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Ends:</span> {formatLocalDate(form.endTime)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Window:</span> {durationLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/75">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-500">Listing Builder</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Create Auction</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                Enter strong details, choose a clean start window, and publish a lot that looks valuable before the first bid lands.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Auction Title</span>
                <input
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  name="title"
                  placeholder="Example: Canon DSLR Camera Bundle"
                  value={form.title}
                  onChange={onChange}
                  required
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
                <textarea
                  className="min-h-[140px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  name="description"
                  placeholder="Condition, accessories, rarity, warranty, and why bidders should trust this lot."
                  value={form.description}
                  onChange={onChange}
                  required
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Image URL</span>
                <input
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  name="imageUrl"
                  placeholder="Paste a direct image URL or leave blank for smart auto-preview"
                  value={form.imageUrl}
                  onChange={onChange}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Base Price</span>
                <input
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  type="number"
                  name="basePrice"
                  placeholder="Base Price"
                  value={form.basePrice}
                  onChange={onChange}
                  required
                />
              </label>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Pricing Note</p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Start with a realistic opening price to attract more bids while keeping your value protected.
                </p>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Start Time</span>
                <input
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  type="datetime-local"
                  name="startTime"
                  value={form.startTime}
                  onChange={onChange}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">End Time</span>
                <input
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  type="datetime-local"
                  name="endTime"
                  value={form.endTime}
                  onChange={onChange}
                  required
                />
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Launch Checklist</p>
              <div className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 dark:border-white/10 dark:bg-slate-950/40">
                  <p className="font-semibold text-slate-900 dark:text-white">Strong title</p>
                  <p className="mt-1">Short, specific, and search-friendly.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 dark:border-white/10 dark:bg-slate-950/40">
                  <p className="font-semibold text-slate-900 dark:text-white">Confident timing</p>
                  <p className="mt-1">Choose a window that supports competitive bidding.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 dark:border-white/10 dark:bg-slate-950/40">
                  <p className="font-semibold text-slate-900 dark:text-white">Visual quality</p>
                  <p className="mt-1">Preview updates automatically as you type.</p>
                </div>
              </div>
            </div>

            <button className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(16,185,129,0.35)]">
              Publish Auction
            </button>
          </form>

          {message && (
            <p className={`mt-4 text-sm font-medium ${message.includes("success") ? "text-emerald-500" : "text-rose-500"}`}>
              {message}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default SellItem;
