import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    if (!process.env.SUNO_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    console.log("=== MANUAL MUSIC STATUS CHECK ===")
    console.log("Task ID:", taskId)

    // Try to check the status directly with Suno API
    const response = await fetch(`https://apibox.erweima.ai/api/v1/status/${taskId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
      },
    })

    console.log("Status check response:", response.status)

    const responseText = await response.text()
    console.log("Raw status response:", responseText)

    if (!response.ok) {
      return NextResponse.json({
        error: `Status check failed: ${responseText}`,
        taskId: taskId,
        status: response.status,
      })
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      return NextResponse.json({
        error: "Invalid response format",
        rawResponse: responseText,
      })
    }

    console.log("Parsed status result:", JSON.stringify(result, null, 2))

    // Handle the response
    if (result.code === 200 && result.data) {
      // Check if it's completed
      if (result.data.status === "completed" || result.data.callbackType === "complete") {
        const songs = result.data.data || result.data.songs || []
        if (songs.length > 0) {
          const song = songs[0]
          return NextResponse.json({
            status: "completed",
            audioUrl: song.audio_url,
            imageUrl: song.image_url,
            title: song.title,
            duration: song.duration,
            taskId: taskId,
          })
        }
      }

      // Still processing
      return NextResponse.json({
        status: "processing",
        message: "Music is still being generated...",
        taskId: taskId,
        progress: result.data.progress || "unknown",
      })
    }

    return NextResponse.json({
      status: "unknown",
      message: "Unable to determine status",
      rawResponse: result,
      taskId: taskId,
    })
  } catch (error: any) {
    console.error("Manual status check error:", error)
    return NextResponse.json({
      error: error.message,
      taskId: request.body?.taskId || "unknown",
    })
  }
}
