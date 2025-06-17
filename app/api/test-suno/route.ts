import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("=== SUNO API TEST WITH ALL REQUIRED PARAMS ===")

    if (!process.env.SUNO_API_KEY) {
      return NextResponse.json({
        error: "SUNO_API_KEY not configured",
        configured: false,
      })
    }

    // Get the base URL for callback
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? request.headers.get("host")
          ? `https://${request.headers.get("host")}`
          : "https://your-app.vercel.app"
        : "http://localhost:3000"

    const testSessionId = `test_${Date.now()}`
    const testPrompt = "A simple test song about happiness"

    // Include all required parameters
    const requestBody = {
      prompt: testPrompt,
      model: "V4", // Required: V3_5, V4, or V4_5
      customMode: false,
      instrumental: false, // Required: true for instrumental, false for vocals
      callBackUrl: `${baseUrl}/api/music-callback?sessionId=${testSessionId}`,
    }

    console.log("Test request:", JSON.stringify(requestBody, null, 2))

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

    let parsedResponse
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (e) {
      parsedResponse = { raw: responseText, parseError: e.message }
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      rawResponse: responseText,
      parsedResponse: parsedResponse,
      requestSent: requestBody,
      callbackUrl: `${baseUrl}/api/music-callback?sessionId=${testSessionId}`,
      requiredParams: {
        prompt: "✓ Included",
        model: "✓ Included (V4)",
        customMode: "✓ Included (false)",
        instrumental: "✓ Included (false)",
        callBackUrl: "✓ Included",
      },
    })
  } catch (error: any) {
    console.error("Test error:", error)
    return NextResponse.json({
      error: error.message,
      success: false,
    })
  }
}
