import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ChevronLeft,
  MapPin,
  CalendarDays,
  Tag,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Shield,
  Sparkles,
  Clock,
  User,
  Info,
  ExternalLink,
} from 'lucide-react'
import { createServerClient } from '@/utils/supabase/server'
import { MarkResolvedButton } from '@/components/mark-resolved-button'
import { IFoundThisButton } from '@/components/i-found-this-button'
import { MessageListerModal } from '@/components/MessageListerModal'

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
  reporter_id: string | null
  reporter_name: string | null
  contact_info: string | null
  image_urls: string[]
  created_at: string
}

type AiMatch = {
  id: string
  title: string
  type: 'lost' | 'found'
  location: string
  confidence: number
  reason: string
  reporter: string
  timeAgo: string
}

// ── Seed data (matches all seed IDs) ─────────────────────────────────────────
const SEED_REPORTS: Record<string, Report> = {
  'seed-1': {
    id: 'seed-1',
    type: 'lost',
    title: 'Blue JBL Earbuds Case',
    category: 'Electronics',
    status: 'open',
    reporter_id: null,
    location: 'Library, 2nd Floor',
    date_occurred: '2026-08-19',
    description:
      'Small blue hard-shell plastic case for JBL earbuds. There is a small scratch on the lid. Left it near the study carrels on the second floor close to the window.',
    reporter_name: 'Mihail P.',
    contact_info: null,
    image_urls: [],
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  'seed-2': {
    id: 'seed-2',
    type: 'found',
    title: 'Student ID Card — Suresh Rao',
    category: 'ID Card',
    status: 'open',
    reporter_id: null,
    location: 'Main Cafeteria',
    date_occurred: '2026-08-20',
    description:
      'Found a student ID card on a table near the vending machines. Name on the card is Suresh Rao. Handed over to the cafeteria counter.',
    reporter_name: 'Divya R.',
    contact_info: null,
    image_urls: [],
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  'seed-3': {
    id: 'seed-3',
    type: 'lost',
    title: 'Grey Hoodie (Size L)',
    category: 'Clothing',
    status: 'resolved',
    reporter_id: null,
    location: 'Gym Locker Room',
    date_occurred: '2026-08-18',
    description:
      'Plain grey Uniqlo hoodie size L. Has a name tag "Karan V." on the inner collar tag. Very sentimental.',
    reporter_name: 'Karan V.',
    contact_info: null,
    image_urls: [],
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  'seed-4': {
    id: 'seed-4',
    type: 'found',
    title: 'Silver Keys with Anchor Keychain',
    category: 'Keys',
    status: 'open',
    reporter_id: null,
    location: 'Parking Lot B',
    date_occurred: '2026-08-19',
    description:
      'Three keys on a silver ring with a small anchor-shaped keychain. Left with the campus Security desk at the main gate.',
    reporter_name: 'Ananya B.',
    contact_info: null,
    image_urls: [],
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  'seed-5': {
    id: 'seed-5',
    type: 'lost',
    title: 'Aqua Blue Hydro Flask (600ml)',
    category: 'Water Bottle',
    status: 'open',
    reporter_id: null,
    location: 'Student Union Building',
    date_occurred: '2026-08-20',
    description:
      'Aqua-coloured insulated Hydro Flask, 600ml. Has a small mountain sticker near the bottom. My name "Riya" is written in marker on the base.',
    reporter_name: 'Riya S.',
    contact_info: null,
    image_urls: [],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  'seed-6': {
    id: 'seed-6',
    type: 'found',
    title: 'Black Leather Wallet',
    category: 'Wallet',
    status: 'open',
    reporter_id: null,
    location: 'Engineering Block Corridor',
    date_occurred: '2026-08-20',
    description:
      'Black bi-fold leather wallet found on the ground in the Engineering Block corridor near Room 204. Contains cash and two debit cards.',
    reporter_name: 'Tanmay K.',
    contact_info: null,
    image_urls: [],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
}

// ── Mock AI matches keyed by report id ────────────────────────────────────────
const AI_MATCHES: Record<string, AiMatch[]> = {
  'seed-1': [
    {
      id: 'seed-2',
      title: 'JBL Tune Earbuds (found)',
      type: 'found',
      location: 'Library Reference Desk',
      confidence: 89,
      reason: 'Same brand, same building, 1-day overlap',
      reporter: 'Tanmay K.',
      timeAgo: '4h ago',
    },
    {
      id: 'm2',
      title: 'Small blue electronics case',
      type: 'found',
      location: 'Library, Ground Floor',
      confidence: 61,
      reason: 'Similar size and colour described',
      reporter: 'Priya M.',
      timeAgo: '6h ago',
    },
    {
      id: 'm3',
      title: 'Wireless earbuds in grey pouch',
      type: 'found',
      location: 'Study Room 3, Library',
      confidence: 34,
      reason: 'Same campus zone, electronics category',
      reporter: 'Rohan S.',
      timeAgo: '2d ago',
    },
  ],
  'seed-5': [
    {
      id: 'm4',
      title: 'Aqua flask found at Library reference desk',
      type: 'found',
      location: 'Library Reference Desk',
      confidence: 92,
      reason: 'Exact colour match, same campus zone, overlapping date',
      reporter: 'Sneha T.',
      timeAgo: '1h ago',
    },
    {
      id: 'm5',
      title: 'Blue/teal water bottle (600ml)',
      type: 'found',
      location: 'Student Union Café',
      confidence: 45,
      reason: 'Colour and volume match; different floor',
      reporter: 'Aryan K.',
      timeAgo: '3h ago',
    },
  ],
}

// ── Generate generic AI matches for any report ────────────────────────────────
function generateMatches(report: Report): AiMatch[] {
  if (AI_MATCHES[report.id]) return AI_MATCHES[report.id]
  const opposite = report.type === 'lost' ? 'found' : 'lost'
  return [
    {
      id: 'gen-1',
      title: `${report.category} item ${opposite === 'found' ? 'found' : 'reported lost'} nearby`,
      type: opposite,
      location: report.location ?? 'Campus Area',
      confidence: 78,
      reason: `Same category (${report.category}), overlapping campus zone`,
      reporter: 'Campus AI',
      timeAgo: '2h ago',
    },
    {
      id: 'gen-2',
      title: `Similar ${report.category.toLowerCase()} — ${opposite}`,
      type: opposite,
      location: 'Admin Block',
      confidence: 42,
      reason: 'Category match; different location',
      reporter: 'Campus AI',
      timeAgo: '1d ago',
    },
    {
      id: 'gen-3',
      title: `Unidentified ${report.category.toLowerCase()}`,
      type: opposite,
      location: 'Security Desk',
      confidence: 21,
      reason: 'Loose category match; may be unrelated',
      reporter: 'Campus AI',
      timeAgo: '3d ago',
    },
  ]
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function confidenceColor(pct: number) {
  if (pct >= 75) return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  if (pct >= 50) return 'bg-amber-100 text-amber-700 ring-amber-200'
  return 'bg-slate-100 text-slate-500 ring-slate-200'
}

// ── Metadata (dynamic) ────────────────────────────────────────────────────────
export async function generateMetadata(
  props: PageProps<'/lost-found/[id]'>
): Promise<Metadata> {
  const { id } = await props.params
  const seed = SEED_REPORTS[id]
  return {
    title: seed ? `${seed.title} — Lost & Found` : 'Report — Lost & Found',
    description: seed?.description ?? 'Lost & Found report detail',
  }
}

// ── Page (Server Component) ────────────────────────────────────────────────────
export default async function ReportDetailPage(
  props: PageProps<'/lost-found/[id]'>
) {
  const { id } = await props.params

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch from DB or fall back to seed
  let report: Report | null = null
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    report = data as Report
  } catch {
    report = SEED_REPORTS[id] ?? null
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <span className="text-6xl">🔍</span>
        <h1 className="text-2xl font-bold text-slate-800">Report not found</h1>
        <p className="text-slate-500">
          This report may have been removed or the link is incorrect.
        </p>
        <Link
          href="/lost-found"
          className="mt-2 rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          ← Back to Lost &amp; Found
        </Link>
      </div>
    )
  }

  const isLost = report.type === 'lost'
  const isResolved = report.status === 'resolved'
  const isOwner = !!(user && report.reporter_id && user.id === report.reporter_id)
  const matches = generateMatches(report)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href="/lost-found"
        className="mb-6 flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Lost &amp; Found
      </Link>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ── Left: Report detail (3/5) ── */}
        <div className="lg:col-span-3">
          {/* Image / thumbnail */}
          <div
            className={`relative flex h-64 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br ${
              isLost
                ? 'from-rose-200 to-pink-300'
                : 'from-indigo-200 to-blue-300'
            } mb-6`}
          >
            {report.image_urls.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={report.image_urls[0]}
                alt={report.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-8xl opacity-30">
                {isLost ? '🔍' : '✅'}
              </span>
            )}

            {/* Type badge */}
            <span
              className={`absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow ${
                isLost
                  ? 'bg-rose-500 text-white'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {isLost ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {isLost ? 'Lost' : 'Found'}
            </span>

            {isResolved && (
              <span className="absolute right-4 top-4 rounded-full bg-slate-700 px-3 py-1.5 text-xs font-bold text-white">
                ✓ Resolved
              </span>
            )}
          </div>

          {/* Details card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h1 className="mb-4 text-2xl font-bold tracking-tight text-slate-900">
              {report.title}
            </h1>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                {
                  icon: Tag,
                  label: 'Category',
                  value: report.category,
                },
                {
                  icon: MapPin,
                  label: isLost ? 'Last Seen' : 'Found At',
                  value: report.location ?? 'Unknown',
                },
                {
                  icon: CalendarDays,
                  label: 'Date',
                  value: report.date_occurred
                    ? new Date(report.date_occurred).toLocaleDateString(
                        'en-IN',
                        { day: 'numeric', month: 'short', year: 'numeric' }
                      )
                    : 'Unknown',
                },
                {
                  icon: Clock,
                  label: 'Reported',
                  value: relativeTime(report.created_at),
                },
                {
                  icon: User,
                  label: 'Reported By',
                  value: report.reporter_name ?? 'Anonymous',
                },
                {
                  icon: CheckCircle2,
                  label: 'Status',
                  value: isResolved ? 'Resolved' : 'Open',
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {report.description && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <Info className="h-3 w-3" />
                  Description
                </p>
                <p className="text-sm leading-relaxed text-slate-700">
                  {report.description}
                </p>
              </div>
            )}

            {/* Claim / Contact CTA */}
            {!isResolved && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {isOwner ? (
                  // Reporter sees only the 'Mark as Resolved' button
                  <MarkResolvedButton reportId={report.id} />
                ) : (
                  // Other users see the action + message buttons
                  <>
                    <IFoundThisButton
                      reportId={report.id}
                      reporterId={report.reporter_id ?? ''}
                      isLost={isLost}
                    />
                    <MessageListerModal
                      reportId={report.id}
                      reporterId={report.reporter_id ?? ''}
                      reporterName={report.reporter_name ?? 'the lister'}
                      isOwnReport={isOwner}
                    />
                  </>
                )}
              </div>
            )}

            <p className="mt-3 flex items-center gap-1.5 text-center text-xs text-slate-400">
              <Shield className="h-3 w-3" />
              Contact details are never exposed publicly — all messages are
              anonymised.
            </p>
          </div>
        </div>

        {/* ── Right: AI Matches panel (2/5) ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  AI Possible Matches
                </p>
                <p className="text-xs text-slate-500">
                  Semantic search · {matches.length} suggestions
                </p>
              </div>
              <span className="ml-auto rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Beta
              </span>
            </div>

            {/* Match list */}
            <div className="divide-y divide-slate-50 px-4 py-2">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/lost-found/${match.id}`}
                  className="group flex items-start gap-3 py-4 transition hover:opacity-80"
                >
                  {/* Confidence ring */}
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                    <svg
                      className="absolute inset-0 -rotate-90"
                      viewBox="0 0 44 44"
                    >
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="4"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke={
                          match.confidence >= 75
                            ? '#10b981'
                            : match.confidence >= 50
                              ? '#f59e0b'
                              : '#94a3b8'
                        }
                        strokeWidth="4"
                        strokeDasharray={`${(match.confidence / 100) * 113} 113`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      className={`text-[10px] font-bold ${
                        match.confidence >= 75
                          ? 'text-emerald-600'
                          : match.confidence >= 50
                            ? 'text-amber-600'
                            : 'text-slate-400'
                      }`}
                    >
                      {match.confidence}%
                    </span>
                  </div>

                  {/* Match info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 line-clamp-1">
                        {match.title}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${confidenceColor(match.confidence)}`}
                      >
                        {match.confidence >= 75
                          ? 'Strong'
                          : match.confidence >= 50
                            ? 'Possible'
                            : 'Weak'}
                      </span>
                    </div>

                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {match.location}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 italic">
                      &ldquo;{match.reason}&rdquo;
                    </p>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{match.reporter}</span>
                      <span className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {match.timeAgo}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* AI disclaimer */}
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                🤖 Matches are generated by semantic similarity — always verify
                in person before claiming an item.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
