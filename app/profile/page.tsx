import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/utils/supabase/server";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeftRight,
  CheckCircle2,
  Edit3,
  MapPin,
  Star,
  ShieldCheck,
  User,
  Lock,
  Bell,
  CreditCard,
  ChevronRight,
  Package,
  Tag,
  TrendingUp,
  Clock,
  GraduationCap,
  BadgeCheck,
  ExternalLink,
  Plus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your CampusHub profile, listings, and account settings.",
};

const SETTINGS_LINKS = [
  { icon: User, label: "Personal Information", href: "/profile/personal" },
  { icon: Lock, label: "Security & Privacy", href: "/profile/security" },
  { icon: Bell, label: "Notification Preferences", href: "/profile/notifications" },
  { icon: CreditCard, label: "Payment Methods", href: "/profile/payments" },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const CONDITION_COLORS: Record<string, string> = {
  New: "bg-emerald-100 text-emerald-700",
  "Like New": "bg-teal-100 text-teal-700",
  Good: "bg-sky-100 text-sky-700",
  Fair: "bg-amber-100 text-amber-700",
  Poor: "bg-red-100 text-red-700",
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-100 bg-white px-4 py-5 text-center shadow-sm">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </span>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ListingCard({ listing }: { listing: any }) {
  const conditionClass =
    CONDITION_COLORS[listing.condition] ?? "bg-slate-100 text-slate-500";
  const isReserved = listing.status === "reserved";
  const daysAgo = formatDistanceToNow(new Date(listing.created_at));
  const imageUrl = listing.image_urls?.[0];
  const priceLabel = listing.price != null ? `₹${listing.price.toLocaleString('en-IN')}` : "Free";

  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <Package className="h-6 w-6 text-indigo-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-semibold text-slate-800 group-hover:text-indigo-700">
            {listing.title}
          </p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              isReserved
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {isReserved ? "Reserved" : "Active"}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {listing.category}
          </span>
          <span>·</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${conditionClass}`}
          >
            {listing.condition}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysAgo} ago
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-bold text-indigo-600">
            {priceLabel}
          </span>
          <Link
            href={`/exchange/${listing.id}/edit`}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-indigo-600 hover:ring-indigo-200"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  // Fetch items belonging to this user
  const { data: myItems } = await supabase
    .from("items")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const items = myItems || [];
  const activeItems = items.filter((item) => item.status !== "sold");
  const soldItems = items.filter((item) => item.status === "sold");

  // Fetch reports belonging to this user
  const { count: reportsCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("reporter_id", user.id);

  const userName = user.email?.split("@")[0] || "User";
  const initials = userName.substring(0, 2).toUpperCase();

  const USER = {
    name: userName,
    branch: "AKTU Student",
    year: "Active",
    joinedYear: new Date(user.created_at).getFullYear(),
    location: "Campus",
    avatar: null, // no avatar support yet
    stats: {
      activeListings: activeItems.length,
      completedTrades: soldItems.length,
      lostFoundReports: reportsCount || 0,
      rating: soldItems.length > 0 ? 5.0 : 0.0,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* ══════════════════════════════════════════════════════
            Left sidebar — Profile card + Settings
        ══════════════════════════════════════════════════════ */}
        <aside className="flex flex-col gap-6 lg:col-span-1">
          {/* ── Profile card ── */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            {/* Cover gradient */}
            <div className="h-24 bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500" />

            <div className="px-5 pb-6">
              {/* Avatar */}
              <div className="-mt-10 mb-4 flex items-end justify-between">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-indigo-600 text-xl font-bold text-white shadow-md">
                  {initials}
                </div>
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </Link>
              </div>

              {/* Identity */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    {USER.name}
                  </h1>
                  <BadgeCheck className="h-5 w-5 text-indigo-500" />
                </div>

                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">
                    Verified Student
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  {USER.branch}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  {USER.year} · Joined {USER.joinedYear}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {USER.location}
                </div>
              </div>

              {/* Rating pill */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(USER.stats.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-amber-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-amber-700">
                  {USER.stats.rating.toFixed(1)}
                </span>
                <span className="text-xs text-amber-600">
                  / {USER.stats.completedTrades} trades
                </span>
              </div>
            </div>
          </div>

          {/* ── Account Settings ── */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Account Settings
              </p>
            </div>
            <nav>
              {SETTINGS_LINKS.map(({ icon: Icon, label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 border-b border-slate-50 px-5 py-3.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-indigo-700 last:border-0"
                >
                  <Icon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-500" />
                  {label}
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-400" />
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════════════
            Main content — Stats + Listings + History
        ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* ── Quick stats row ── */}
          <section aria-label="Activity statistics">
            <h2 className="mb-4 text-base font-semibold text-slate-700">
              Activity Overview
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon={ArrowLeftRight}
                label="Active Listings"
                value={USER.stats.activeListings}
                accent="bg-indigo-500"
              />
              <StatCard
                icon={CheckCircle2}
                label="Completed Trades"
                value={USER.stats.completedTrades}
                accent="bg-emerald-500"
              />
              <StatCard
                icon={MapPin}
                label="L&F Reports"
                value={USER.stats.lostFoundReports}
                accent="bg-rose-500"
              />
              <StatCard
                icon={TrendingUp}
                label="Seller Rating"
                value={`${USER.stats.rating.toFixed(1)}★`}
                accent="bg-amber-500"
              />
            </div>
          </section>

          {/* ── My Listings ── */}
          <section aria-labelledby="my-listings-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="my-listings-heading"
                className="text-base font-semibold text-slate-700"
              >
                My Listings
                <span className="ml-2 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600">
                  {activeItems.length}
                </span>
              </h2>
              <Link
                href="/exchange/new"
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                New Listing
              </Link>
            </div>

            <div className="space-y-3">
              {activeItems.length > 0 ? (
                activeItems.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                  <p className="text-sm text-slate-500">You don't have any active listings.</p>
                </div>
              )}
            </div>

            {activeItems.length > 0 && (
              <Link
                href="/exchange?seller=me"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View all my listings
              </Link>
            )}
          </section>

          {/* ── Completed Trades ── */}
          <section aria-labelledby="trades-heading">
            <h2
              id="trades-heading"
              className="mb-4 text-base font-semibold text-slate-700"
            >
              Completed Trades
              <span className="ml-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                {soldItems.length}
              </span>
            </h2>

            {soldItems.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                {soldItems.map((trade, i) => (
                  <div
                    key={trade.id}
                    className={`flex items-center justify-between gap-4 px-5 py-4 ${
                      i !== soldItems.length - 1
                        ? "border-b border-slate-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {trade.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          Sold · {format(new Date(trade.updated_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-emerald-600">
                      {trade.price ? `₹${trade.price.toLocaleString('en-IN')}` : 'Free'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
                No completed trades yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
