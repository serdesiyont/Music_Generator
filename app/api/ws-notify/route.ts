import { type NextRequest, NextResponse } from "next/server"

// In-memory store for active connections (in production, use Redis)
const activeConnections = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { sessionId, type, data } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    // Store the notification for the session
    activeConnections.set(sessionId, {
      type,
      data,
      timestamp: Date.now(),
    })

    console.log(`Stored notification for session ${sessionId}:`, type)

    return NextResponse.json({ status: "stored" })
  } catch (error) {
    console.error("Error storing notification:", error)
    return NextResponse.json({ error: "Failed to store notification" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 })
  }

  const notification = activeConnections.get(sessionId)
  if (notification) {
    // Remove the notification after retrieving it
    activeConnections.delete(sessionId)
    return NextResponse.json(notification)
  }

  return NextResponse.json({ status: "no_notification" })
}
