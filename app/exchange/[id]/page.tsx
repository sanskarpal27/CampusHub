import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createServerClient } from "@/utils/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { MessageSellerModal } from "@/components/MessageSellerModal"
import {
  ChevronLeft,
  MapPin,
  Tag,
  Package,
  Clock,
  ShieldCheck,
  User,
} from "lucide-react"

// Define types based on schema
type Item = {
  id: string
  title: string
  description: string | null
  price: number | null
  category: string
  condition: string
  status: string
  image_urls: string[]
  location: string | null
  seller_id: string
  seller_name: string | null
  created_at: string
}

const CONDITION_COLORS: Record<string, string> = {
  New: "bg-emerald-100 text-emerald-700",
  "Like New": "bg-teal-100 text-teal-700",
  Good: "bg-sky-100 text-sky-700",
  Fair: "bg-amber-100 text-amber-700",
  Poor: "bg-red-100 text-red-700",
}

export default async function ItemDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params
  const supabase = await createServerClient()
  
  // Get current user to check if they are the seller
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the item
  const { data: itemData, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !itemData) {
    notFound()
  }

  const item = itemData as Item
  const isOwnItem = user?.id === item.seller_id
  const conditionClass = CONDITION_COLORS[item.condition] ?? "bg-slate-100 text-slate-700"
  const isReserved = item.status === "reserved"
  const isSold = item.status === "sold"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Back button ── */}
      <div className="mb-6">
        <Link
          href="/exchange"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Exchange
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ══════════════════════════════════════════════════════
            Left Side — Image Gallery
        ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-sm">
            {item.image_urls.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_urls[0]}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-slate-300">
                <Package className="h-16 w-16 mb-2" />
                <span className="text-sm font-medium">No Image Available</span>
              </div>
            )}
            
            {/* Status Badges on Image */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {isReserved && (
                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  Reserved
                </span>
              )}
              {isSold && (
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  Sold
                </span>
              )}
            </div>
          </div>
          
          {/* Thumbnail Gallery (Placeholder for future) */}
          {item.image_urls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {item.image_urls.map((url, i) => (
                <div key={i} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-transparent bg-slate-50 hover:border-indigo-500 transition">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`${item.title} ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            Right Side — Details & Actions
        ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {item.title}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-indigo-600">
                {item.price != null ? `₹${item.price.toLocaleString("en-IN")}` : "Free"}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${conditionClass}`}
              >
                {item.condition}
              </span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <Tag className="h-3.5 w-3.5" />
                Category
              </span>
              <span className="text-sm font-medium text-slate-700">{item.category}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                Listed
              </span>
              <span className="text-sm font-medium text-slate-700">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
            </div>

            {item.location && (
              <div className="flex flex-col gap-1 sm:col-span-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </span>
                <span className="text-sm font-medium text-slate-700">{item.location}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-10 flex-1">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
              Description
            </h2>
            <div className="prose prose-slate prose-sm text-slate-600">
              {item.description ? (
                <p className="whitespace-pre-wrap leading-relaxed">{item.description}</p>
              ) : (
                <p className="italic text-slate-400">No description provided by the seller.</p>
              )}
            </div>
          </div>

          {/* Seller Card & Actions */}
          <div className="mt-auto border-t border-slate-100 pt-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                  {item.seller_name ? item.seller_name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.seller_name || "Unknown Seller"}</p>
                  <p className="flex items-center gap-1 text-xs text-emerald-600">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Student
                  </p>
                </div>
              </div>
            </div>

            {/* Message Action */}
            {!isSold ? (
              <MessageSellerModal 
                itemId={item.id} 
                sellerId={item.seller_id} 
                sellerName={item.seller_name || "the seller"} 
                isOwnItem={isOwnItem}
              />
            ) : (
              <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-500">
                This item has been sold.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
