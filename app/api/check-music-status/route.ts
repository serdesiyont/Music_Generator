import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // First check our callback endpoint for completed tasks
    const callbackResponse = await fetch(
      `${process.env.VERCEL_URL || "http://localhost:3000"}/api/music-callback?taskId=${taskId}`,
    )

    if (callbackResponse.ok) {
      const callbackData = await callbackResponse.json()

      if (callbackData.code === 200 && callbackData.data && callbackData.data.callbackType === "complete") {
        const songs = callbackData.data.data
        if (songs && songs.length > 0) {
          const song = songs[0] // Take the first generated song
          return NextResponse.json({
            status: "completed",
            audioUrl: song.audio_url,
            imageUrl: song.image_url,
            title: song.title,
            duration: song.duration,
            filename: `${song.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`,
          })
        }
      }
    }

    // If not found in callback, try direct API status check (if available)
    if (!process.env.SUNO_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Fallback to direct status check if the API supports it
    const myHeaders = new Headers()
    myHeaders.append("Authorization", `Bearer ${process.env.SUNO_API_KEY}`)
    myHeaders.append("Accept", "application/json")

    try {
      const response = await fetch(`https://apibox.erweima.ai/api/v1/status/${taskId}`, {
        method: "GET",
        headers: myHeaders,
      })

      if (response.ok) {
        const result = await response.json()

        if (result.code === 200 && result.data && result.data.callbackType === "complete") {
          const songs = result.data.data
          if (songs && songs.length > 0) {
            const song = songs[0]
            return NextResponse.json({
              status: "completed",
              audioUrl: song.audio_url,
              imageUrl: song.image_url,
              title: song.title,
              duration: song.duration,
              filename: `${song.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`,
            })
          }
        }
      }
    } catch (directApiError) {
      console.log("Direct API status check not available, relying on callback")
    }

    // Still processing
    return NextResponse.json({
      status: "processing",
      message: "Music is still being generated...",
    })
  } catch (error) {
    console.error("Error checking music status:", error)
    return NextResponse.json({ error: "Failed to check music generation status" }, { status: 500 })
  }
}
