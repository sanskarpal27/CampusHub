'use client'

import { useActionState, useState } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  CalendarDays,
  Tag,
  FileText,
  User,
  Phone,
  ImagePlus,
  Loader2,
  Upload,
  AlertCircle,
} from 'lucide-react'
import { createReport, type ReportActionState } from '@/app/actions/reports'

const CATEGORIES = [
  'Electronics',
  'Keys',
  'ID Card',
  'Bag',
  'Water Bottle',
  'Clothing',
  'Books',
  'Wallet',
  'Jewellery',
  'Sports Equipment',
  'Other',
]

// ── Shared field styles ──────────────────────────────────────────────────────
const input =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  )
}

// ── Toggle switch ────────────────────────────────────────────────────────────
function TypeToggle({
  value,
  onChange,
}: {
  value: 'lost' | 'found'
  onChange: (v: 'lost' | 'found') => void
}) {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-1">
      {(['lost', 'found'] as const).map((t) => {
        const isActive = value === t
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
              isActive
                ? t === 'lost'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'lost' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {t === 'lost' ? 'I Lost Something' : 'I Found Something'}
          </button>
        )
      })}
    </div>
  )
}

// ── Image preview ─────────────────────────────────────────────────────────────
function ImageUploadArea() {
  const [preview, setPreview] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  return (
    <div>
      <FieldLabel>
        <span className="flex items-center gap-2">
          <ImagePlus className="h-3.5 w-3.5 text-slate-400" />
          Photo (optional)
        </span>
      </FieldLabel>
      <label
        htmlFor="image-upload"
        className="flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-indigo-300 hover:bg-indigo-50"
        style={{ minHeight: preview ? 0 : 140 }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ImagePlus className="h-8 w-8 text-slate-300" />
            <p className="text-xs font-medium text-slate-500">
              Click to upload a photo
            </p>
            <p className="text-[11px] text-slate-400">PNG, JPG · max 10 MB</p>
          </div>
        )}
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
        />
      </label>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const router = useRouter()
  const sp = use(searchParams)
  const initialType: 'lost' | 'found' =
    sp.type === 'found' ? 'found' : 'lost'

  const [reportType, setReportType] = useState<'lost' | 'found'>(initialType)
  const [state, formAction, isPending] = useActionState<
    ReportActionState,
    FormData
  >(createReport, {})

  const accent =
    reportType === 'lost'
      ? { ring: 'ring-rose-200', bg: 'bg-rose-500 hover:bg-rose-600' }
      : { ring: 'ring-indigo-200', bg: 'bg-indigo-600 hover:bg-indigo-700' }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Lost &amp; Found
      </button>

      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
        Post a Report
      </h1>
      <p className="mb-8 text-slate-500">
        Fill in the details below and our AI will look for possible matches.
      </p>

      {/* Type toggle */}
      <div className="mb-8">
        <TypeToggle value={reportType} onChange={setReportType} />
      </div>

      <form action={formAction} className="space-y-6">
        {/* Hidden type field */}
        <input type="hidden" name="type" value={reportType} />

        {/* Error banner */}
        {state.error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {state.error}
          </div>
        )}

        {/* Title */}
        <div>
          <FieldLabel>
            <span className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Item Title <span className="text-red-400">*</span>
            </span>
          </FieldLabel>
          <input
            id="report-title"
            name="title"
            type="text"
            required
            maxLength={120}
            placeholder={
              reportType === 'lost'
                ? 'e.g. Blue water bottle, Apple AirPods...'
                : 'e.g. Found keys near cafeteria...'
            }
            className={input}
          />
        </div>

        {/* Category + Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>
              <span className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                Category <span className="text-red-400">*</span>
              </span>
            </FieldLabel>
            <select
              id="report-category"
              name="category"
              required
              className={`${input} appearance-none`}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>
              <span className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                Date {reportType === 'lost' ? 'Lost' : 'Found'}
              </span>
            </FieldLabel>
            <input
              id="report-date"
              name="date_occurred"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              className={input}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <FieldLabel>
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {reportType === 'lost' ? 'Location Last Seen' : 'Where Found'}
            </span>
          </FieldLabel>
          <input
            id="report-location"
            name="location"
            type="text"
            placeholder="e.g. Library 2nd Floor, Student Union, Parking Lot B…"
            className={input}
          />
        </div>

        {/* Description */}
        <div>
          <FieldLabel>
            <span className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Description
            </span>
          </FieldLabel>
          <textarea
            id="report-description"
            name="description"
            rows={4}
            placeholder="Describe the item in detail — colour, brand, distinguishing marks…"
            className={`${input} resize-none`}
          />
        </div>

        {/* Image upload */}
        <ImageUploadArea />

        {/* Reporter info */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Your Contact Info (optional — shown only to matched parties)
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>
                <span className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Your Name
                </span>
              </FieldLabel>
              <input
                id="report-name"
                name="reporter_name"
                type="text"
                placeholder="e.g. Riya Sharma"
                className={input}
              />
            </div>
            <div>
              <FieldLabel>
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  Contact (email or phone)
                </span>
              </FieldLabel>
              <input
                id="report-contact"
                name="contact_info"
                type="text"
                placeholder="Hidden from public"
                className={input}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            id="submit-report-btn"
            type="submit"
            disabled={isPending}
            className={`flex items-center justify-center gap-2 rounded-xl px-8 py-2.5 text-sm font-semibold text-white shadow-sm ring-2 ${accent.ring} ${accent.bg} transition disabled:opacity-60`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
