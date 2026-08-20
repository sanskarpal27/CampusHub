'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  Sparkles,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Wand2,
  ImagePlus,
  Tag,
  DollarSign,
  MapPin,
  User,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { createListing, type ActionState } from '@/app/actions/exchange'

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Books & Textbooks',
  'Electronics',
  'Furniture',
  'Clothing',
  'Sports & Fitness',
  'Stationery',
  'Other',
]

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

// ── Mock AI analysis results (cycles through these per upload) ────────────────
const AI_SUGGESTIONS = [
  {
    title: 'HP 14 Laptop – Intel Core i5, 8GB RAM, 512GB SSD',
    category: 'Electronics',
    condition: 'Good',
    description:
      'Lightly used HP laptop in good working condition. Ideal for college assignments and programming. Minor cosmetic wear on palm rest. Charger and original box included.',
  },
  {
    title: 'Introduction to Algorithms – CLRS (4th Edition)',
    category: 'Books & Textbooks',
    condition: 'Like New',
    description:
      'Classic algorithms textbook in near-perfect condition. Used for one semester only. No writing or highlights inside. Perfect for CS and Engineering students.',
  },
  {
    title: 'IKEA MICKE Study Desk – White, 73cm',
    category: 'Furniture',
    condition: 'Good',
    description:
      'Sturdy study desk with a small cable outlet. A few minor surface scratches not visible during use. Easy to disassemble for transport. Great for hostel rooms.',
  },
]

// ── Types ─────────────────────────────────────────────────────────────────────
type AiState = 'idle' | 'analyzing' | 'ready'
type Suggestion = (typeof AI_SUGGESTIONS)[0]

// ── Sub-components ─────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  )
}

function InputClass(extra = '') {
  return `w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 ${extra}`
}

function AiSuggestionBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
          {label}
        </p>
        <p className="mt-0.5 text-xs font-medium text-slate-700">{value}</p>
      </div>
    </div>
  )
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default function NewListingPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createListing,
    {}
  )

  // AI simulation state
  const [aiState, setAiState] = useState<AiState>('idle')
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [uploadCount, setUploadCount] = useState(0)

  // Controlled fields (pre-filled by AI)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [description, setDescription] = useState('')

  const [, startTransition] = useTransition()

  // Mock image analysis flow
  function handleUploadClick() {
    if (aiState === 'analyzing') return
    setAiState('analyzing')

    startTransition(() => {
      setTimeout(() => {
        const pick = AI_SUGGESTIONS[uploadCount % AI_SUGGESTIONS.length]
        setSuggestion(pick)
        setTitle(pick.title)
        setCategory(pick.category)
        setCondition(pick.condition)
        setDescription(pick.description)
        setAiState('ready')
        setUploadCount((n) => n + 1)
      }, 2200)
    })
  }

  const uploaderLabel =
    aiState === 'idle'
      ? 'Upload a photo to auto-fill details'
      : aiState === 'analyzing'
        ? 'Analyzing your image with AI…'
        : 'Image analyzed! Review & edit below'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Back link ── */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Exchange
      </button>

      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
        New Listing
      </h1>
      <p className="mb-8 text-slate-500">
        Upload a photo and let our AI assistant fill in the details for you.
      </p>

      {/* ── AI Smart Listing Assistant ── */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-indigo-100 bg-white/60 px-6 py-4 backdrop-blur-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
            <Wand2 className="h-4 w-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Smart Listing Assistant
            </p>
            <p className="text-xs text-slate-500">
              Powered by AI · Auto-fills title, category &amp; description
            </p>
          </div>
          <span className="ml-auto rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Beta
          </span>
        </div>

        {/* Upload area */}
        <div className="p-6">
          <button
            type="button"
            id="upload-image-btn"
            onClick={handleUploadClick}
            disabled={aiState === 'analyzing'}
            className={`relative flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
              aiState === 'ready'
                ? 'border-emerald-300 bg-emerald-50'
                : aiState === 'analyzing'
                  ? 'border-indigo-300 bg-indigo-50 opacity-80'
                  : 'border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50'
            }`}
          >
            {aiState === 'analyzing' ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <p className="text-sm font-semibold text-indigo-700">
                  Analyzing with AI…
                </p>
                <p className="text-xs text-slate-400">
                  Detecting category, condition &amp; description
                </p>
              </>
            ) : aiState === 'ready' ? (
              <>
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-700">
                  Analysis complete!
                </p>
                <p className="text-xs text-slate-500">
                  Click to analyze a different image
                </p>
              </>
            ) : (
              <>
                <ImagePlus className="h-10 w-10 text-indigo-400" />
                <p className="text-sm font-semibold text-slate-700">
                  Upload Image
                </p>
                <p className="text-xs text-slate-400">
                  PNG, JPG or WEBP · Max 10 MB
                </p>
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            {uploaderLabel}
          </p>

          {/* AI Suggestions Review */}
          {aiState === 'ready' && suggestion && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <p className="text-xs font-semibold text-slate-700">
                  AI Suggestions · Review &amp; edit in the form below
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <AiSuggestionBadge label="Category" value={suggestion.category} />
                <AiSuggestionBadge label="Condition" value={suggestion.condition} />
                <AiSuggestionBadge
                  label="Title"
                  value={
                    suggestion.title.length > 32
                      ? suggestion.title.slice(0, 32) + '…'
                      : suggestion.title
                  }
                />
              </div>
              <p className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
                ✏️ &nbsp;The fields below have been pre-filled. Review and make any edits before publishing.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Listing Form ── */}
      <form action={formAction} className="space-y-6">
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
              Title <span className="text-red-500">*</span>
            </span>
          </FieldLabel>
          <input
            id="listing-title"
            name="title"
            type="text"
            required
            maxLength={120}
            placeholder="e.g. HP 14 Laptop, CLRS Textbook…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={InputClass(
              aiState === 'ready' ? 'border-emerald-300 bg-emerald-50' : ''
            )}
          />
        </div>

        {/* Category + Condition */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>
              <span className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                Category <span className="text-red-500">*</span>
              </span>
            </FieldLabel>
            <select
              id="listing-category"
              name="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={InputClass(
                `appearance-none ${aiState === 'ready' ? 'border-emerald-300 bg-emerald-50' : ''}`
              )}
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
                <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                Condition <span className="text-red-500">*</span>
              </span>
            </FieldLabel>
            <select
              id="listing-condition"
              name="condition"
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={InputClass(
                `appearance-none ${aiState === 'ready' ? 'border-emerald-300 bg-emerald-50' : ''}`
              )}
            >
              <option value="">Select condition…</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
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
            id="listing-description"
            name="description"
            rows={4}
            placeholder="Describe the item's condition, what's included, any defects…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={InputClass(
              `resize-none ${aiState === 'ready' ? 'border-emerald-300 bg-emerald-50' : ''}`
            )}
          />
        </div>

        {/* Price + Location */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>
              <span className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                Price (₹)
              </span>
            </FieldLabel>
            <input
              id="listing-price"
              name="price"
              type="number"
              min={0}
              step={1}
              placeholder="Leave blank if free"
              className={InputClass()}
            />
          </div>

          <div>
            <FieldLabel>
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Location
              </span>
            </FieldLabel>
            <input
              id="listing-location"
              name="location"
              type="text"
              placeholder="e.g. Hostel Block C, Library…"
              className={InputClass()}
            />
          </div>
        </div>

        {/* Seller name */}
        <div>
          <FieldLabel>
            <span className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-slate-400" />
              Your Name
            </span>
          </FieldLabel>
          <input
            id="listing-seller-name"
            name="seller_name"
            type="text"
            placeholder="e.g. Bhaskar R."
            className={InputClass()}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            id="publish-listing-btn"
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Publish Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
