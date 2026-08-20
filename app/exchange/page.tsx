import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Plus,
  SlidersHorizontal,
  Heart,
  BookOpen,
  Cpu,
  Sofa,
  ShoppingBag,
  Sparkles,
  Tag,
  MapPin,
} from 'lucide-react'
import { createServerClient } from '@/utils/supabase/server'

export const metadata: Metadata = {
  title: 'Campus Exchange',
  description: 'Buy and sell second-hand items on campus.',
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Item = {
  id: string
  title: string
  description: string | null
  price: number | null
  category: string
  condition: string
  status: string
  location: string | null
  seller_name: string | null
  image_urls: string[]
  created_at: string
}

// ── Static sidebar data ────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All Items', value: null, icon: ShoppingBag },
  { label: 'Books & Textbooks', value: 'Books & Textbooks', icon: BookOpen },
  { label: 'Electronics', value: 'Electronics', icon: Cpu },
  { label: 'Furniture', value: 'Furniture', icon: Sofa },
]

const CONDITION_COLORS: Record<string, string> = {
  New: 'bg-emerald-100 text-emerald-700',
  'Like New': 'bg-teal-100 text-teal-700',
  Good: 'bg-sky-100 text-sky-700',
  Fair: 'bg-amber-100 text-amber-700',
  Poor: 'bg-red-100 text-red-700',
}

// ── Placeholder gradient thumbnails ───────────────────────────────────────────
const GRADIENTS = [
  'from-indigo-400 to-violet-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-emerald-500',
  'from-sky-400 to-blue-500',
  'from-fuchsia-400 to-purple-500',
]



// ── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, index }: { item: Item; index: number }) {
  const gradient = GRADIENTS[index % GRADIENTS.length]
  const conditionClass =
    CONDITION_COLORS[item.condition] ?? 'bg-slate-100 text-slate-600'
  const isReserved = item.status === 'reserved'

  return (
    <Link href={`/exchange/${item.id}`} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Thumbnail */}
      <div
        className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden`}
      >
        {item.image_urls.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_urls[0]}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl opacity-30">📦</span>
        )}

        {/* Condition badge */}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${conditionClass}`}
        >
          {item.condition === 'Like New' ? 'Used – Like New' : `Used – ${item.condition}`}
        </span>

        {/* Status ribbon */}
        {isReserved && (
          <span className="absolute right-0 top-4 bg-amber-500 px-3 py-0.5 text-[11px] font-bold text-white shadow">
            Reserved
          </span>
        )}

        {/* Favourite button */}
        <button
          aria-label="Save to favourites"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white hover:text-rose-500"
        >
          <Heart className="h-4 w-4 text-slate-400 transition group-hover:text-slate-600" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 group-hover:text-indigo-700">
            {item.title}
          </h3>
        </div>

        {item.location && (
          <p className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            {item.location}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-indigo-600">
            {item.price != null
              ? `₹${item.price.toLocaleString('en-IN')}`
              : 'Free'}
          </span>
          <span className="text-xs text-slate-400">{item.seller_name}</span>
        </div>
      </div>
    </Link>
  )
}

// ── Page (Server Component) ───────────────────────────────────────────────────
export default async function ExchangePage({
  searchParams,
}: PageProps<'/exchange'>) {
  const params = await searchParams
  const activeCategory =
    typeof params?.category === 'string' ? params.category : null

  // Fetch from Supabase
  let items: Item[] = []
  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(24)

    if (activeCategory) {
      query = query.eq('category', activeCategory)
    }

    const { data, error } = await query
    if (error) throw error
    items = (data as Item[]) ?? []
  } catch (error) {
    console.error('Failed to load items', error)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Campus Exchange
          </h1>
          <p className="mt-1 text-slate-500">
            Buy and sell second-hand items with fellow students.
          </p>
        </div>
        <Link
          href="/exchange/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      <div className="flex gap-8">
        {/* ── Sidebar ── */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Categories
            </p>
            {CATEGORIES.map(({ label, value, icon: Icon }) => {
              const isActive = value === activeCategory
              const href =
                value == null ? '/exchange' : `/exchange?category=${encodeURIComponent(value)}`
              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}
                  />
                  {label}
                </Link>
              )
            })}

            <hr className="my-3 border-slate-100" />

            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <Sparkles className="h-3.5 w-3.5" />
              Condition
            </p>
            {['New', 'Like New', 'Good', 'Fair'].map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                {c}
              </label>
            ))}

            <hr className="my-3 border-slate-100" />

            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <Tag className="h-3.5 w-3.5" />
              Max Price
            </p>
            <div className="px-3">
              <input
                type="range"
                min={0}
                max={50000}
                defaultValue={50000}
                className="w-full accent-indigo-600"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>₹0</span>
                <span>₹50,000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Grid ── */}
        <section className="flex-1">
          <p className="mb-4 text-sm text-slate-500">
            Showing{' '}
            <span className="font-medium text-slate-700">{items.length}</span>{' '}
            {activeCategory ? `results in "${activeCategory}"` : 'listings'}
          </p>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
              <span className="text-5xl">📭</span>
              <p className="text-lg font-semibold text-slate-700">
                No listings yet
              </p>
              <p className="text-sm text-slate-400">
                Be the first to list something!
              </p>
              <Link
                href="/exchange/new"
                className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Create a Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item, i) => (
                <ItemCard key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
