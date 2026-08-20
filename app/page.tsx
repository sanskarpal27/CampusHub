import {
  ArrowLeftRight,
  MapPin,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Package,
} from "lucide-react";

// ─────────────────────────────────────────────
// Static placeholder data
// ─────────────────────────────────────────────
const recentItems = [
  {
    id: "1",
    title: "Calculus: Early Transcendentals (9th ed.)",
    category: "Books",
    price: 450,
    condition: "Good",
    timeAgo: "2 hours ago",
    seller: "Aryan K.",
    status: "available",
  },
  {
    id: "2",
    title: "HDMI Cable – 3m",
    category: "Electronics",
    price: 120,
    condition: "Like New",
    timeAgo: "5 hours ago",
    seller: "Priya M.",
    status: "available",
  },
  {
    id: "3",
    title: "Mechanical Keyboard (TKL)",
    category: "Electronics",
    price: 1800,
    condition: "Good",
    timeAgo: "Yesterday",
    seller: "Rohan S.",
    status: "reserved",
  },
  {
    id: "4",
    title: "Casio FX-991EX Calculator",
    category: "Stationery",
    price: 600,
    condition: "Fair",
    timeAgo: "Yesterday",
    seller: "Sneha T.",
    status: "available",
  },
];

const recentReports = [
  {
    id: "1",
    type: "lost" as const,
    title: "Blue JBL Earbuds Case",
    category: "Electronics",
    location: "Library, 2nd Floor",
    timeAgo: "1 hour ago",
    status: "open",
    reporter: "Mihail P.",
  },
  {
    id: "2",
    type: "found" as const,
    title: "ID Card – Suresh Rao",
    category: "ID Card",
    location: "Cafeteria",
    timeAgo: "3 hours ago",
    status: "open",
    reporter: "Divya R.",
  },
  {
    id: "3",
    type: "lost" as const,
    title: "Grey Hoodie (L)",
    category: "Clothing",
    location: "Gym Locker Room",
    timeAgo: "Yesterday",
    status: "resolved",
    reporter: "Karan V.",
  },
  {
    id: "4",
    type: "found" as const,
    title: "Silver Keys with Keychain",
    category: "Keys",
    location: "Parking Lot B",
    timeAgo: "2 days ago",
    status: "open",
    reporter: "Ananya B.",
  },
];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </span>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function ItemCard({
  title,
  category,
  price,
  condition,
  timeAgo,
  seller,
  status,
}: (typeof recentItems)[number]) {
  return (
    <article className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
      {/* Placeholder thumbnail */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-300">
        <Package className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-indigo-700">
            {title}
          </p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              status === "available"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {status === "available" ? "Available" : "Reserved"}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" /> {category}
          </span>
          <span>·</span>
          <span>{condition}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {timeAgo}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-bold text-indigo-600">
            ₹{price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-slate-400">{seller}</span>
        </div>
      </div>
    </article>
  );
}

function ReportCard({
  type,
  title,
  category,
  location,
  timeAgo,
  status,
  reporter,
}: (typeof recentReports)[number]) {
  const isLost = type === "lost";
  const isResolved = status === "resolved";

  return (
    <article className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-rose-100 hover:shadow-md">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isLost
            ? "bg-rose-50 text-rose-500"
            : "bg-emerald-50 text-emerald-600"
        }`}
      >
        {isLost ? "L" : "F"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-rose-700">
            {title}
          </p>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              isResolved
                ? "bg-slate-100 text-slate-500"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {isResolved ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {isResolved ? "Resolved" : "Open"}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" /> {category}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {location}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" /> {timeAgo}
          </span>
          <span className="text-xs text-slate-400">{reporter}</span>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function HomePage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Greeting ── */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {greeting},{" "}
          <span className="text-indigo-600">Bhaskar</span> 👋
        </h1>
        <p className="mt-1 text-slate-500">
          Here&apos;s what&apos;s happening on campus today.
        </p>
      </section>

      {/* ── Stats row ── */}
      <section
        aria-label="Campus statistics"
        className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <StatCard
          icon={ArrowLeftRight}
          label="Active Listings"
          value="124"
          color="bg-indigo-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Sold This Week"
          value="38"
          color="bg-violet-500"
        />
        <StatCard
          icon={AlertCircle}
          label="Open Lost Reports"
          value="17"
          color="bg-rose-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Items Recovered"
          value="9"
          color="bg-emerald-500"
        />
      </section>

      {/* ── Two-column feed ── */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Exchange – Recent Activity */}
        <section aria-labelledby="exchange-heading">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-indigo-500" />
              <h2
                id="exchange-heading"
                className="text-lg font-semibold text-slate-900"
              >
                Recent Activity
              </h2>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                Exchange
              </span>
            </div>
            <a
              href="/exchange"
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {recentItems.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        {/* Lost & Found – Recent Reports */}
        <section aria-labelledby="lostfound-heading">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-rose-500" />
              <h2
                id="lostfound-heading"
                className="text-lg font-semibold text-slate-900"
              >
                Recent Reports
              </h2>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600">
                Lost &amp; Found
              </span>
            </div>
            <a
              href="/lost-found"
              className="text-xs font-medium text-rose-600 hover:underline"
            >
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <ReportCard key={report.id} {...report} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
