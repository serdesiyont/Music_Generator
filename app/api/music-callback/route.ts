import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    console.log("=== MUSIC CALLBACK RECEIVED ===")
    console.log("Session ID:", sessionId)
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))

    if (!sessionId) {
      console.error("No session ID provided in callback")
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const callbackData = await request.json()
    console.log("Callback data:", JSON.stringify(callbackData, null, 2))

    // Send the completion data to the notification system
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "production"
          ? request.headers.get("host")
            ? `https://${request.headers.get("host")}`
            : "https://your-app.vercel.app"
          : "http://localhost:3000"

      const wsResponse = await fetch(`${baseUrl}/api/ws-notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          type: "music_complete",
          data: callbackData,
        }),
      })

      if (!wsResponse.ok) {
        console.error("Failed to notify WebSocket:", await wsResponse.text())
      } else {
        console.log("Successfully stored notification for session:", sessionId)
      }
    } catch (wsError) {
      console.error("Error notifying WebSocket:", wsError)
    }

    // Return success response to the Suno API
    return NextResponse.json({
      status: "received",
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error handling music callback:", error)
    return NextResponse.json(
      {
        error: "Failed to process callback",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Also handle GET requests for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  console.log("=== CALLBACK TEST GET REQUEST ===")
  console.log("Session ID:", sessionId)

  return NextResponse.json({
    message: "Callback endpoint is working",
    sessionId: sessionId,
    timestamp: new Date().toISOString(),
    method: "GET",
  })
}
