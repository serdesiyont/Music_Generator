import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Check if required environment variables are set
    const hasGemini = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    const hasSuno = !!process.env.SUNO_API_KEY

    const configured = hasGemini && hasSuno

    return NextResponse.json({
      configured,
      services: {
        gemini: hasGemini,
        suno: hasSuno,
      },
    })
  } catch (error) {
    return NextResponse.json({
      configured: false,
      services: {
        gemini: false,
        suno: false,
      },
    })
  }
}
