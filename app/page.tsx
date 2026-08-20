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
import { createServerClient } from "@/utils/supabase/server";
import { formatDistanceToNow } from "date-fns";

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
  value: string | number;
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

function ItemCard({ item }: { item: any }) {
  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
  const imageUrl = item.image_urls?.[0];

  return (
    <article className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-indigo-50 text-indigo-300">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <Package className="h-6 w-6" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-indigo-700">
            {item.title}
          </p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              item.status === "available"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {item.status === "available" ? "Available" : "Reserved"}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" /> {item.category}
          </span>
          <span>·</span>
          <span>{item.condition}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {timeAgo}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-bold text-indigo-600">
            {item.price ? `₹${item.price.toLocaleString("en-IN")}` : "Free"}
          </span>
          <span className="text-xs text-slate-400">{item.seller_name || 'Anonymous'}</span>
        </div>
      </div>
    </article>
  );
}

function ReportCard({ report }: { report: any }) {
  const isLost = report.type === "lost";
  const isResolved = report.status === "resolved";
  const timeAgo = formatDistanceToNow(new Date(report.created_at), { addSuffix: true });

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
            {report.title}
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
            <Tag className="h-3 w-3" /> {report.category}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {report.location || 'Unknown location'}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" /> {timeAgo}
          </span>
          <span className="text-xs text-slate-400">{report.reporter_name || 'Anonymous'}</span>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default async function HomePage() {
  const supabase = await createServerClient();
  
  const [
    { data: userResponse },
    { data: recentItems },
    { data: recentReports },
    { count: activeListingsCount },
    { count: soldItemsCount },
    { count: openReportsCount },
    { count: resolvedReportsCount }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('items').select('*').order('created_at', { ascending: false }).limit(4),
    supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(4),
    supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved')
  ]);

  const userName = userResponse?.user?.email?.split('@')[0] || "Guest";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Greeting ── */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {greeting},{" "}
          <span className="text-indigo-600">{userName}</span> 👋
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
          value={activeListingsCount || 0}
          color="bg-indigo-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Sold This Week"
          value={soldItemsCount || 0}
          color="bg-violet-500"
        />
        <StatCard
          icon={AlertCircle}
          label="Open Lost Reports"
          value={openReportsCount || 0}
          color="bg-rose-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Items Recovered"
          value={resolvedReportsCount || 0}
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
            {recentItems && recentItems.length > 0 ? (
              recentItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No recent activity. Be the first to list an item!
              </div>
            )}
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
            {recentReports && recentReports.length > 0 ? (
              recentReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No recent reports.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
