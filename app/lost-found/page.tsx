import Link from 'next/link'
import type { Metadata } from 'next'
import {
  MapPin,
  Clock,
  Tag,
  Search,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { createServerClient } from '@/utils/supabase/server'

export const metadata: Metadata = {
  title: 'Lost & Found',
  description:
    'Report lost items or share found items to help reunite students with their belongings.',
}

// ── Types ──────────────────────────────────────────────────────────────────────
type Report = {
  id: string
  type: 'lost' | 'found'
  title: string
  category: string
  status: string
  location: string | null
  date_occurred: string | null
  description: string | null
  reporter_name: string | null
  image_urls: string[]
  created_at: string
}

// ── Seed data ──────────────────────────────────────────────────────────────────
const SEED_REPORTS: Report[] = [
  {
    id: 'seed-1',
    type: 'lost',
    title: 'Blue JBL Earbuds Case',
    category: 'Electronics',
    status: 'open',
    location: 'Library, 2nd Floor',
    date_occurred: '2026-08-19',
    description: 'Small blue plastic case. Left it near the study carrels.',
    reporter_name: 'Mihail P.',
    image_urls: [],
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-2',
    type: 'found',
    title: 'Student ID Card — Suresh Rao',
    category: 'ID Card',
    status: 'open',
    location: 'Main Cafeteria',
    date_occurred: '2026-08-20',
    description: 'Found on a table near the vending machines.',
    reporter_name: 'Divya R.',
    image_urls: [],
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-3',
    type: 'lost',
    title: 'Grey Hoodie (Size L)',
    category: 'Clothing',
    status: 'resolved',
    location: 'Gym Locker Room',
    date_occurred: '2026-08-18',
    description: 'Plain grey Uniqlo hoodie. Name tag on the inner collar.',
    reporter_name: 'Karan V.',
    image_urls: [],
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-4',
    type: 'found',
    title: 'Silver Keys with Anchor Keychain',
    category: 'Keys',
    status: 'open',
    location: 'Parking Lot B',
    date_occurred: '2026-08-19',
    description: 'Three keys on a silver ring. Left with the Security desk.',
    reporter_name: 'Ananya B.',
    image_urls: [],
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-5',
    type: 'lost',
    title: 'Aqua Blue Hydro Flask (600ml)',
    category: 'Water Bottle',
    status: 'open',
    location: 'Student Union Building',
    date_occurred: '2026-08-20',
    description: 'Aqua-coloured flask with a sticker of a mountain on it.',
    reporter_name: 'Riya S.',
    image_urls: [],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-6',
    type: 'found',
    title: 'Black Leather Wallet',
    category: 'Wallet',
    status: 'open',
    location: 'Engineering Block Corridor',
    date_occurred: '2026-08-20',
    description: 'Wallet with cash and two debit cards. No ID visible.',
    reporter_name: 'Tanmay K.',
    image_urls: [],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
]

// ── Utilities ─────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Card gradient placeholders ────────────────────────────────────────────────
const GRADIENTS = [
  'from-rose-300 to-pink-400',
  'from-indigo-300 to-blue-400',
  'from-amber-300 to-orange-400',
  'from-teal-300 to-emerald-400',
  'from-violet-300 to-purple-400',
  'from-sky-300 to-cyan-400',
]

const CATEGORY_EMOJI: Record<string, string> = {
  Electronics: '🎧',
  Keys: '🔑',
  'ID Card': '🪪',
  Bag: '🎒',
  'Water Bottle': '🧋',
  Clothing: '👕',
  Books: '📚',
  Wallet: '👛',
  Jewellery: '💍',
  'Sports Equipment': '⚽',
  Other: '📦',
}

// ── Report Card ────────────────────────────────────────────────────────────────
function ReportCard({ report, index }: { report: Report; index: number }) {
  const isLost = report.type === 'lost'
  const isResolved = report.status === 'resolved'
  const gradient = GRADIENTS[index % GRADIENTS.length]
  const emoji = CATEGORY_EMOJI[report.category] ?? '📦'

  return (
    <Link
      href={`/lost-found/${report.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-rose-100"
    >
      {/* Thumbnail */}
      <div
        className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${gradient}`}
      >
        {report.image_urls.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.image_urls[0]}
            alt={report.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl drop-shadow">{emoji}</span>
        )}

        {/* Type pill */}
        <span
          className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${
            isLost
              ? 'bg-rose-500 text-white'
              : 'bg-indigo-500 text-white'
          }`}
        >
          {isLost ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          {isLost ? 'Lost' : 'Found'}
        </span>

        {/* Resolved ribbon */}
        {isResolved && (
          <span className="absolute right-0 top-4 bg-slate-600 px-3 py-0.5 text-[10px] font-bold text-white shadow">
            Resolved
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-800 group-hover:text-rose-700">
          {report.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {report.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
              <span className="line-clamp-1">{report.location}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-slate-400" />
            {report.category}
          </span>
        </div>

        {report.description && (
          <p className="line-clamp-2 text-xs text-slate-400">
            {report.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {relativeTime(report.created_at)}
          </span>
          <span className="text-xs text-slate-400">{report.reporter_name}</span>
        </div>
      </div>
    </Link>
  )
}

// ── Page (Server Component) ────────────────────────────────────────────────────
export default async function LostFoundPage({ searchParams }: PageProps<'/lost-found'>) {
  const params = await searchParams
  const activeFilter =
    typeof params?.filter === 'string' ? params.filter : 'all'

  // Fetch from Supabase with graceful seed fallback
  let reports: Report[] = []
  try {
    const supabase = createServerClient()
    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(24)

    if (activeFilter === 'lost') query = query.eq('type', 'lost')
    else if (activeFilter === 'found') query = query.eq('type', 'found')

    const { data, error } = await query
    if (error) throw error
    reports = (data as Report[]) ?? []
  } catch {
    reports =
      activeFilter === 'all'
        ? SEED_REPORTS
        : SEED_REPORTS.filter((r) => r.type === activeFilter)
  }

  if (reports.length === 0) {
    reports =
      activeFilter === 'all'
        ? SEED_REPORTS
        : SEED_REPORTS.filter((r) => r.type === activeFilter)
  }

  const lostCount = reports.filter((r) => r.type === 'lost').length
  const foundCount = reports.filter((r) => r.type === 'found').length

  const TABS = [
    { label: 'All Reports', value: 'all', count: reports.length },
    { label: 'Lost', value: 'lost', count: lostCount },
    { label: 'Found', value: 'found', count: foundCount },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Hero header ── */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 via-white to-indigo-50 p-8 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Search className="h-5 w-5 text-rose-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-rose-500">
                Lost &amp; Found
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Reunite campus belongings
            </h1>
            <p className="mt-2 max-w-lg text-slate-500">
              Lost something on campus? Found an item? Post a report and let our AI
              matching system help connect the dots.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href="/lost-found/new?type=lost"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-sm ring-2 ring-rose-200 transition hover:bg-rose-600 active:scale-95"
            >
              <AlertTriangle className="h-4 w-4 transition group-hover:scale-110" />
              I Lost Something
            </Link>
            <Link
              href="/lost-found/new?type=found"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm ring-2 ring-indigo-200 transition hover:bg-indigo-700 active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4 transition group-hover:scale-110" />
              I Found Something
            </Link>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map(({ label, value, count }) => {
          const isActive = value === activeFilter
          const href =
            value === 'all' ? '/lost-found' : `/lost-found?filter=${value}`
          return (
            <Link
              key={value}
              href={href}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? value === 'lost'
                    ? 'bg-rose-50 text-rose-700'
                    : value === 'found'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50'
              }`}
            >
              {label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isActive
                    ? value === 'lost'
                      ? 'bg-rose-100 text-rose-600'
                      : value === 'found'
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </Link>
          )
        })}

        <div className="ml-auto">
          <Link
            href="/lost-found/new"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            New Report
          </Link>
        </div>
      </div>

      {/* ── Grid ── */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <span className="text-5xl">🔍</span>
          <p className="text-lg font-semibold text-slate-700">No reports yet</p>
          <p className="text-sm text-slate-400">
            Be the first to post a lost or found report.
          </p>
          <Link
            href="/lost-found/new"
            className="mt-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Post a Report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {reports.map((r, i) => (
            <ReportCard key={r.id} report={r} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
