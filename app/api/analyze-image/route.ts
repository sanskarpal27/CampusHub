import { GoogleGenerativeAI } from '@google/generative-ai'
import { type NextRequest, NextResponse } from 'next/server'

// ── Types ──────────────────────────────────────────────────────────────────────
export type AnalysisResult = {
  title: string
  category:
    | 'Books & Textbooks'
    | 'Electronics'
    | 'Furniture'
    | 'Clothing'
    | 'Sports & Fitness'
    | 'Stationery'
    | 'Other'
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor'
  description: string
}

const ALLOWED_CATEGORIES = [
  'Books & Textbooks',
  'Electronics',
  'Furniture',
  'Clothing',
  'Sports & Fitness',
  'Stationery',
  'Other',
] as const

const ALLOWED_CONDITIONS = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Poor',
] as const

const SYSTEM_PROMPT = `You are a helpful campus marketplace assistant.
Your job is to analyze a product image and return a JSON object that helps a student list the item for sale.

Return ONLY a raw JSON object — no markdown fences, no explanation, just the JSON.

The object must have exactly these four keys:
- "title": a concise, specific product name (max 80 chars). Include brand, model, and key spec if visible.
- "category": MUST be exactly one of: "Books & Textbooks", "Electronics", "Furniture", "Clothing", "Sports & Fitness", "Stationery", "Other". No other values accepted.
- "condition": MUST be exactly one of: "New", "Like New", "Good", "Fair", "Poor". Estimate from visual wear.
- "description": exactly 2 sentences. First sentence states what the item is and its condition. Second sentence is a selling point for a student buyer.`

// Singleton client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  // ── 1. Parse and validate input ──────────────────────────────────────────
  let imageUrl: string
  try {
    const body = await request.json()
    imageUrl = (body?.imageUrl as string | undefined)?.trim() ?? ''
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON with an imageUrl field.' },
      { status: 400 }
    )
  }

  if (!imageUrl) {
    return NextResponse.json({ error: 'imageUrl is required.' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(imageUrl)
  } catch {
    return NextResponse.json({ error: 'imageUrl is not a valid URL.' }, { status: 400 })
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return NextResponse.json(
      { error: 'imageUrl must use http or https.' },
      { status: 400 }
    )
  }

  // ── 2. Download Image and Convert to Base64 ──────────────────────────────
  let base64Data = ''
  let mimeType = 'image/jpeg'
  try {
    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) {
      throw new Error(`Failed to fetch image: ${imageRes.statusText}`)
    }
    const arrayBuffer = await imageRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    base64Data = buffer.toString('base64')
    mimeType = imageRes.headers.get('content-type') || 'image/jpeg'
  } catch (err) {
    console.error('[analyze-image] Image download error:', err)
    return NextResponse.json(
      { error: 'Could not download the image from the provided URL.' },
      { status: 400 }
    )
  }

  // ── 3. Call Gemini Vision API (gemini-1.5-flash) ─────────────────────────
  let rawContent: string
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ])

    const response = await result.response
    rawContent = response.text()
  } catch (err) {
    console.error('[analyze-image] Gemini error:', err)
    const msg = err instanceof Error ? err.message : 'Vision API call failed.'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  // ── 4. Parse & validate the JSON ─────────────────────────────────────────
  let resultJSON: Partial<AnalysisResult>
  try {
    // Strip markdown fences if Gemini added them despite prompt
    const clean = rawContent
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim()
    resultJSON = JSON.parse(clean)
  } catch {
    console.error('[analyze-image] Model returned unparseable content:', rawContent)
    return NextResponse.json(
      { error: 'AI returned an unexpected format. Please try again.' },
      { status: 502 }
    )
  }

  // Coerce category and condition
  const category = ALLOWED_CATEGORIES.includes(resultJSON.category as never)
    ? resultJSON.category!
    : 'Other'

  const condition = ALLOWED_CONDITIONS.includes(resultJSON.condition as never)
    ? resultJSON.condition!
    : 'Good'

  const output: AnalysisResult = {
    title: (resultJSON.title ?? '').slice(0, 120),
    category,
    condition,
    description: (resultJSON.description ?? '').slice(0, 500),
  }

  // ── 5. Return to client ──────────────────────────────────────────────────
  return NextResponse.json(output)
}
