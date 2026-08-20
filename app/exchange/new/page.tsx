'use client'

import { useActionState, useState, useRef } from 'react'
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
  X,
  CloudUpload,
} from 'lucide-react'
import { createListing, type ActionState } from '@/app/actions/exchange'
import { createClient } from '@/utils/supabase/client'
import type { AnalysisResult } from '@/app/api/analyze-image/route'

// ── Constants ─────────────────────────────────────────────────────────────────
const BUCKET = 'campushub-images'
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

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

// ── Types ─────────────────────────────────────────────────────────────────────
type UploadState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'analyzing' }
  | { status: 'done'; publicUrl: string; localPreview: string; aiError?: string }
  | { status: 'error'; message: string }

// ── Sub-components ─────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  )
}

function inputCls(extra = '') {
  return `w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 ${extra}`
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

// ── Main component ─────────────────────────────────────────────────────────────
export default function NewListingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createListing,
    {}
  )

  // Upload + AI state
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' })
  const [suggestion, setSuggestion] = useState<AnalysisResult | null>(null)

  // Controlled form fields (pre-filled by Vision API)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [description, setDescription] = useState('')

  // ── Storage upload → Vision API ──────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset so the same file can be reselected after an error
    e.target.value = ''

    if (file.size > MAX_FILE_BYTES) {
      setUploadState({ status: 'error', message: 'File exceeds 10 MB limit.' })
      return
    }

    const localPreview = URL.createObjectURL(file)
    setUploadState({ status: 'uploading' })

    try {
      // ── Step 1: Upload to Supabase Storage ────────────────────────────────
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      const folder = user?.id ?? 'anon'
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `listings/${folder}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

      // ── Step 2: Call Vision API ────────────────────────────────────────────
      setUploadState({ status: 'analyzing' })

      const analysisRes = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: publicUrl }),
      })

      if (!analysisRes.ok) {
        // Analysis failed — still keep the uploaded image, just skip auto-fill
        const errBody = await analysisRes.json().catch(() => ({}))
        const aiError = (errBody as { error?: string }).error ?? 'AI analysis failed.'
        setUploadState({ status: 'done', publicUrl, localPreview, aiError })
        return
      }

      const analysis = (await analysisRes.json()) as AnalysisResult

      // ── Step 3: Populate form fields ───────────────────────────────────────
      setSuggestion(analysis)
      setTitle(analysis.title)
      setCategory(analysis.category)
      setCondition(analysis.condition)
      setDescription(analysis.description)

      setUploadState({ status: 'done', publicUrl, localPreview })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please retry.'
      setUploadState({ status: 'error', message: msg })
    }
  }

  function clearImage() {
    if (uploadState.status === 'done') {
      URL.revokeObjectURL(uploadState.localPreview)
    }
    setUploadState({ status: 'idle' })
    setSuggestion(null)
  }

  const aiReady =
    uploadState.status === 'done' ||
    uploadState.status === 'analyzing'

  const publicUrl =
    uploadState.status === 'done' ? uploadState.publicUrl : ''

  const localPreview =
    uploadState.status === 'done' ? uploadState.localPreview : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back */}
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

      {/* ── Smart Listing Assistant ── */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-sm">
        {/* Panel header */}
        <div className="flex items-center gap-3 border-b border-indigo-100 bg-white/60 px-6 py-4 backdrop-blur-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
            <Wand2 className="h-4 w-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Smart Listing Assistant
            </p>
            <p className="text-xs text-slate-500">
              Upload a photo · Image stored in Supabase · AI auto-fills details
            </p>
          </div>
          <span className="ml-auto rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Beta
          </span>
        </div>

        <div className="p-6">
          {/* ── Upload zone ── */}
          {uploadState.status === 'done' && localPreview ? (
            /* Preview after successful upload */
            <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={localPreview}
                alt="Uploaded preview"
                className="h-56 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-3 bg-emerald-50 px-4 py-2.5">
                <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Uploaded to Supabase Storage
                </span>
                <button
                  type="button"
                  onClick={clearImage}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-white hover:text-rose-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* Drop-zone / upload trigger */
            <label
              htmlFor="image-file-input"
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                uploadState.status === 'uploading' ||
                uploadState.status === 'analyzing'
                  ? 'border-indigo-300 bg-indigo-50 opacity-80 cursor-wait'
                  : uploadState.status === 'error'
                    ? 'border-red-300 bg-red-50'
                    : 'border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50'
              }`}
            >
              {uploadState.status === 'uploading' && (
                <>
                  <CloudUpload className="h-10 w-10 animate-bounce text-indigo-400" />
                  <p className="text-sm font-semibold text-indigo-700">
                    Uploading to Supabase Storage…
                  </p>
                  <p className="text-xs text-slate-400">
                    Please wait
                  </p>
                </>
              )}

              {uploadState.status === 'analyzing' && (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                  <p className="text-sm font-semibold text-indigo-700">
                    Analyzing with AI…
                  </p>
                  <p className="text-xs text-slate-400">
                    Detecting category, condition &amp; description
                  </p>
                </>
              )}

              {uploadState.status === 'error' && (
                <>
                  <AlertCircle className="h-10 w-10 text-red-400" />
                  <p className="text-sm font-semibold text-red-700">
                    {uploadState.message}
                  </p>
                  <p className="text-xs text-slate-500">
                    Click to try again
                  </p>
                </>
              )}

              {uploadState.status === 'idle' && (
                <>
                  <ImagePlus className="h-10 w-10 text-indigo-400" />
                  <p className="text-sm font-semibold text-slate-700">
                    Click to upload a photo
                  </p>
                  <p className="text-xs text-slate-400">
                    PNG, JPG or WEBP · Max 10 MB
                  </p>
                </>
              )}

              {/* Hidden real file input */}
              <input
                id="image-file-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={
                  uploadState.status === 'uploading' ||
                  uploadState.status === 'analyzing'
                }
                onChange={handleFileChange}
              />
            </label>
          )}

          {/* AI analysis error (image uploaded OK but Vision API failed) */}
          {uploadState.status === 'done' && uploadState.aiError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>
                <strong>AI analysis unavailable:</strong> {uploadState.aiError}{' '}
                You can still fill in the details manually and publish.
              </span>
            </div>
          )}

          {/* AI Suggestions Review panel */}
          {uploadState.status === 'done' && suggestion && (
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
              <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                ✏️&nbsp; The fields below have been pre-filled. Review and edit
                before publishing.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Listing form ── */}
      <form action={formAction} className="space-y-6">
        {/*
          Pass the public Storage URL as a hidden field.
          The Server Action reads this — never accepting file blobs or raw
          binary data, which keeps the action boundary clean.
        */}
        <input type="hidden" name="image_url" value={publicUrl} />

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
            className={inputCls(aiReady ? 'border-emerald-300 bg-emerald-50' : '')}
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
              className={inputCls(
                `appearance-none ${aiReady ? 'border-emerald-300 bg-emerald-50' : ''}`
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
              className={inputCls(
                `appearance-none ${aiReady ? 'border-emerald-300 bg-emerald-50' : ''}`
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
            className={inputCls(
              `resize-none ${aiReady ? 'border-emerald-300 bg-emerald-50' : ''}`
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
              className={inputCls()}
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
              className={inputCls()}
            />
          </div>
        </div>

        {/* Seller name — shown only when not authenticated */}
        <div>
          <FieldLabel>
            <span className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-slate-400" />
              Display Name
            </span>
          </FieldLabel>
          <input
            id="listing-seller-name"
            name="seller_name"
            type="text"
            placeholder="e.g. Bhaskar R. (defaults to your email prefix)"
            className={inputCls()}
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
            disabled={isPending || uploadState.status === 'uploading' || uploadState.status === 'analyzing'}
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
