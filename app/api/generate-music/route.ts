import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { verse, idea, sessionId, model = "V4" } = await request.json()

    if (!verse) {
      return NextResponse.json({ error: "Verse is required" }, { status: 400 })
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Check if API key is configured
    if (!process.env.SUNO_API_KEY) {
      return NextResponse.json(
        {
          error: "Music generation API key not configured. Please set SUNO_API_KEY environment variable.",
          type: "config_error",
        },
        { status: 500 },
      )
    }

    // Trim verse to API limit
    const musicPrompt = verse.length > 400 ? verse.substring(0, 397) + "..." : verse

    // Get the base URL for the callback
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? request.headers.get("host")
          ? `https://${request.headers.get("host")}`
          : "https://your-app.vercel.app"
        : "http://localhost:3000"

    console.log("=== SUNO API DEBUG ===")
    console.log("Base URL:", baseUrl)
    console.log("Session ID:", sessionId)
    console.log("Model:", model)
    console.log("Prompt length:", musicPrompt.length)
    console.log("Prompt:", musicPrompt)

    // Include all required parameters
    const requestBody = {
      prompt: musicPrompt,
      model: model, // Required: V3_5, V4, or V4_5
      customMode: false,
      instrumental: false, // Required: true for instrumental, false for vocals
      callBackUrl: `${baseUrl}/api/music-callback?sessionId=${sessionId}`,
    }

    console.log("Request body:", JSON.stringify(requestBody, null, 2))

    const response = await fetch("https://apibox.erweima.ai/api/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log("Response status:", response.status)

    const responseText = await response.text()
    console.log("Raw response:", responseText)

    if (!response.ok) {
      console.error("Music API error:", response.status, responseText)

      if (response.status === 401) {
        return NextResponse.json(
          {
            error: "Invalid API key. Please check your music generation API key configuration.",
            type: "auth_error",
            debug: { status: response.status, response: responseText },
          },
          { status: 401 },
        )
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please wait a moment and try again.",
            type: "rate_limit",
            debug: { status: response.status, response: responseText },
          },
          { status: 429 },
        )
      }

      return NextResponse.json(
        {
          error: `Music generation failed: ${responseText}`,
          type: "service_error",
          debug: { status: response.status, response: responseText },
        },
        { status: response.status },
      )
    }

    let result
    try {
      result = JSON.parse(responseText)
      console.log("Parsed response:", JSON.stringify(result, null, 2))
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError)
      return NextResponse.json(
        {
          error: "Invalid response format from music generation service",
          type: "parse_error",
          debug: { response: responseText },
        },
        { status: 500 },
      )
    }

    // Handle the Suno API response format: { code, msg, data }
    console.log("=== RESPONSE ANALYSIS ===")
    console.log("Response code:", result.code)
    console.log("Response message:", result.msg)
    console.log("Response data:", result.data)

    // Check if the request was successful
    if (result.code === 200) {
      // Success - music generation started
      if (result.data && result.data.task_id) {
        console.log("Task ID found:", result.data.task_id)

        return NextResponse.json({
          taskId: result.data.task_id,
          status: "processing",
          message: "Music generation started. You'll be notified when it's ready.",
          sessionId: sessionId,
          callbackUrl: `${baseUrl}/api/music-callback?sessionId=${sessionId}`,
          model: model,
        })
      }

      // If immediate response with audio (unlikely but possible)
      if (result.data && result.data.audio_url) {
        return NextResponse.json({
          audioUrl: result.data.audio_url,
          imageUrl: result.data.image_url,
          filename: `generated-music-${Date.now()}.mp3`,
          title: result.data.title || "Generated Music",
          duration: result.data.duration,
          status: "completed",
        })
      }

      // Success but unexpected data format
      return NextResponse.json({
        taskId: result.data?.task_id || "unknown",
        status: "processing",
        message: "Music generation started. You'll be notified when it's ready.",
        sessionId: sessionId,
        debug: { fullResponse: result },
      })
    } else {
      // API returned an error
      console.error("Suno API error:", result.code, result.msg)

      return NextResponse.json(
        {
          error: `Suno API error: ${result.msg}`,
          type: "api_error",
          debug: { code: result.code, message: result.msg, data: result.data },
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("=== CATCH BLOCK ERROR ===")
    console.error("Error generating music:", error)

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Unable to connect to music generation service. Please check your internet connection.",
          type: "network_error",
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred while generating music.",
        type: "generic_error",
        debug: { errorMessage: error.message },
      },
      { status: 500 },
    )
  }
}
