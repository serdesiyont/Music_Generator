"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Bell, Music, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TestNotifications() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const { toast } = useToast()

  const startTest = () => {
    const newSessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    setIsListening(true)

    // Simulate a notification after 10 seconds
    setTimeout(() => {
      simulateNotification(newSessionId)
    }, 10000)

    toast({
      title: "Test Started",
      description: "Simulating music generation... notification in 10 seconds",
    })
  }

  const simulateNotification = async (sessionId: string) => {
    try {
      // Store a test notification
      await fetch("/api/ws-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type: "music_complete",
          data: {
            data: [
              {
                audio_url: "https://example.com/test-audio.mp3",
                image_url: "https://example.com/test-image.jpg",
                title: "Test Generated Music",
                duration: 180,
              },
            ],
          },
        }),
      })

      // Check if notification was stored
      const response = await fetch(`/api/ws-notify?sessionId=${sessionId}`)
      if (response.ok) {
        const notification = await response.json()
        if (notification.type) {
          toast({
            title: "🎵 Test Notification Received!",
            description: "The notification system is working correctly.",
          })
          setIsListening(false)
        }
      }
    } catch (error) {
      console.error("Test failed:", error)
      toast({
        title: "Test Failed",
        description: "There was an error testing the notification system.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Test Notification System</h1>
          <p className="text-gray-600">Verify that music completion notifications work correctly</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Test
            </CardTitle>
            <CardDescription>Test the real-time notification system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!sessionId && (
              <Button onClick={startTest} className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Start Notification Test
              </Button>
            )}

            {sessionId && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Session:</strong> {sessionId.split("_")[2]}
                  <br />
                  {isListening ? "⏳ Waiting for notification..." : "✅ Test completed!"}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold">How Notifications Work:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 🔄 System polls every 2 seconds for updates</li>
                <li>• 📞 Suno API calls our callback when music is ready</li>
                <li>• 🔔 Toast notification appears automatically</li>
                <li>• 🎵 Audio player and download button appear</li>
                <li>• ⚡ No page refresh needed - updates in real-time</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What You'll See When Music is Ready:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Music className="h-4 w-4" />
              <AlertDescription>
                <strong>Toast Notification:</strong> "Music generated successfully! Your verse has been transformed into
                music."
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Music Player Interface:</h4>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4" />
                    <span className="font-medium">Your Music is Ready!</span>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-sm mb-2">[Your generated verse will appear here]</div>
                  <div className="bg-gray-200 p-2 rounded text-sm mb-2">[Audio Player Controls]</div>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Download Music
                    </Button>
                    <Button size="sm" variant="outline">
                      Create Another
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
