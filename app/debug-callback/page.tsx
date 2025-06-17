"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Music, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DebugCallback() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const [callbackLogs, setCallbackLogs] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Generate a test session ID
    const testSessionId = `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(testSessionId)
  }, [])

  const startPolling = () => {
    if (!sessionId) return

    setIsPolling(true)
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ws-notify?sessionId=${sessionId}`)
        if (response.ok) {
          const notification = await response.json()
          if (notification.type && notification.data) {
            setNotifications((prev) => [...prev, { ...notification, timestamp: new Date().toISOString() }])
            toast({
              title: "Notification Received!",
              description: `Type: ${notification.type}`,
            })
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
      }
    }, 2000)

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval)
      setIsPolling(false)
    }, 300000)

    return () => clearInterval(interval)
  }

  const stopPolling = () => {
    setIsPolling(false)
  }

  const simulateCallback = async () => {
    if (!sessionId) return

    try {
      // Simulate a Suno callback with completed music
      const mockCallbackData = {
        code: 200,
        msg: "success",
        data: {
          callbackType: "complete",
          data: [
            {
              audio_url: "https://example.com/test-music.mp3",
              image_url: "https://example.com/test-image.jpg",
              title: "Test Generated Music",
              duration: 180,
              id: "test-song-123",
            },
          ],
        },
      }

      const response = await fetch(`/api/music-callback?sessionId=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockCallbackData),
      })

      if (response.ok) {
        toast({
          title: "Callback Simulated",
          description: "Mock callback data sent successfully",
        })
      } else {
        toast({
          title: "Callback Failed",
          description: "Failed to send mock callback",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Simulation error:", error)
    }
  }

  const checkCallbackLogs = async () => {
    try {
      // This would check server logs - for now we'll simulate
      const mockLogs = [
        {
          timestamp: new Date().toISOString(),
          type: "callback_received",
          sessionId: sessionId,
          data: "Mock callback log entry",
        },
      ]
      setCallbackLogs(mockLogs)
    } catch (error) {
      console.error("Error checking logs:", error)
    }
  }

  const testDirectNotification = async () => {
    if (!sessionId) return

    try {
      // Directly store a notification
      const response = await fetch("/api/ws-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type: "music_complete",
          data: {
            data: [
              {
                audio_url: "https://cdn1.suno.ai/test-audio.mp3",
                image_url: "https://cdn1.suno.ai/test-image.jpg",
                title: "Direct Test Music",
                duration: 120,
              },
            ],
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Direct Notification Stored",
          description: "Check if polling picks it up",
        })
      }
    } catch (error) {
      console.error("Direct notification error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Debug Callback System</h1>
          <p className="text-gray-600">Debug why completed music isn't showing up</p>
        </div>

        {sessionId && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Debug Session:</strong> {sessionId}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Polling</CardTitle>
              <CardDescription>Test the real-time notification system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={startPolling} disabled={isPolling} className="flex-1">
                  {isPolling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Polling...
                    </>
                  ) : (
                    "Start Polling"
                  )}
                </Button>
                <Button onClick={stopPolling} disabled={!isPolling} variant="outline">
                  Stop
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Received Notifications:</h4>
                <div className="bg-gray-100 p-3 rounded-lg max-h-40 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">No notifications received yet</p>
                  ) : (
                    notifications.map((notif, index) => (
                      <div key={index} className="text-xs mb-2 p-2 bg-white rounded">
                        <div className="font-semibold">{notif.type}</div>
                        <div className="text-gray-500">{notif.timestamp}</div>
                        <pre className="text-xs mt-1">{JSON.stringify(notif.data, null, 2)}</pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Callback Testing</CardTitle>
              <CardDescription>Test callback reception and processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={simulateCallback} className="w-full">
                <Music className="w-4 h-4 mr-2" />
                Simulate Suno Callback
              </Button>

              <Button onClick={testDirectNotification} variant="outline" className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Test Direct Notification
              </Button>

              <Button onClick={checkCallbackLogs} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Callback Logs
              </Button>

              {callbackLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Callback Logs:</h4>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    {callbackLogs.map((log, index) => (
                      <div key={index} className="text-xs mb-2">
                        <div className="font-semibold">{log.type}</div>
                        <div className="text-gray-500">{log.timestamp}</div>
                        <div>{log.data}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>If music is completed on Suno's side but not showing:</strong>
                <ol className="mt-2 space-y-1 list-decimal list-inside">
                  <li>Check if Suno is calling our callback URL correctly</li>
                  <li>Verify the callback endpoint is receiving data</li>
                  <li>Ensure notifications are being stored properly</li>
                  <li>Confirm polling is picking up stored notifications</li>
                  <li>Check if the UI is updating when notifications arrive</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Check Callback URL</h4>
                <p className="text-gray-600">
                  Verify Suno can reach:
                  <br />
                  <code className="text-xs bg-gray-100 p-1 rounded">
                    {typeof window !== "undefined" ? window.location.origin : "your-domain"}/api/music-callback
                  </code>
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">2. Check Server Logs</h4>
                <p className="text-gray-600">
                  Look for:
                  <br />• "MUSIC CALLBACK RECEIVED"
                  <br />• "Successfully stored notification"
                  <br />• Any error messages
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">3. Manual Check</h4>
                <p className="text-gray-600">
                  If callback fails:
                  <br />• Check Suno dashboard for completed tasks
                  <br />• Copy audio URL manually
                  <br />• Use direct API status check
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
