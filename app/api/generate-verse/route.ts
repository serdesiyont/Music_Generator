import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

// Simple rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(ip: string): string {
  return `rate_limit_${ip}`
}

function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const maxRequests = 5 // 5 requests per minute

  const current = rateLimitStore.get(key)

  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }

  if (current.count >= maxRequests) {
    return { allowed: false, resetTime: current.resetTime }
  }

  current.count++
  rateLimitStore.set(key, current)
  return { allowed: true }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"

    // Check rate limit
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetTime! - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please wait ${resetIn} seconds before trying again.`,
          type: "rate_limit",
        },
        { status: 429 },
      )
    }

    // Check if required environment variable is set
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        {
          error: "Google Gemini API key missing. Please set GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
          type: "config_error",
        },
        { status: 500 },
      )
    }

    const { idea, regenerate } = await request.json()

    if (!idea) {
      return NextResponse.json(
        {
          error: "Idea is required",
          type: "validation_error",
        },
        { status: 400 },
      )
    }

    if (idea.length > 500) {
      return NextResponse.json(
        {
          error: "Idea is too long. Please keep it under 500 characters.",
          type: "validation_error",
        },
        { status: 400 },
      )
    }

    const prompt = regenerate
      ? `Create a different poetic verse based on this idea: "${idea}". Make it creative, emotional, and suitable for music. Focus on imagery, rhythm, and feeling. Make this version different from any previous attempts. Keep it between 4-8 lines.`
      : `Create a beautiful, poetic verse based on this idea: "${idea}". Make it creative, emotional, and suitable for music. Focus on imagery, rhythm, and feeling. The verse should be 4-8 lines long and have a good rhythm for singing.`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"), // Use flash model for better rate limits
      prompt,
      temperature: 0.8,
      maxTokens: 200, // Limit tokens to reduce costs
    })

    return NextResponse.json({ verse: text.trim() })
  } catch (error: any) {
    console.error("Error generating verse:", error)

    // Handle specific error types
    if (error.message?.includes("quota") || error.message?.includes("exceeded")) {
      return NextResponse.json(
        {
          error:
            "API quota exceeded. This could be due to:\n• Free tier limits reached\n• Billing not set up\n• Rate limits exceeded\n\nPlease check your Google AI Studio account and try again later.",
          type: "quota_error",
          suggestion: "Visit Google AI Studio to check your quota and billing settings.",
        },
        { status: 429 },
      )
    }

    if (error.message?.includes("API key")) {
      return NextResponse.json(
        {
          error: "Invalid API key. Please check your Google Gemini API key configuration.",
          type: "auth_error",
        },
        { status: 401 },
      )
    }

    if (error.message?.includes("rate limit") || error.message?.includes("429")) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment and try again.",
          type: "rate_limit",
        },
        { status: 429 },
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Failed to generate verse. Please try again in a few moments.",
        type: "generic_error",
      },
      { status: 500 },
    )
  }
}
