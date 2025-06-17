"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Music, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ManualCheck() {
  const [taskId, setTaskId] = useState("")
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const checkStatus = async () => {
    if (!taskId.trim()) {
      toast({
        title: "Task ID Required",
        description: "Please enter a task ID to check",
        variant: "destructive",
      })
      return
    }

    setChecking(true)
    setResult(null)

    try {
      const response = await fetch("/api/check-music-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: taskId.trim() }),
      })

      const data = await response.json()
      setResult(data)

      if (data.status === "completed") {
        toast({
          title: "Music Found!",
          description: "Your music is ready to play",
        })
      }
    } catch (error: any) {
      setResult({
        error: error.message,
        status: "error",
      })
    } finally {
      setChecking(false)
    }
  }

  const downloadAudio = () => {
    if (result?.audioUrl) {
      const link = document.createElement("a")
      link.href = result.audioUrl
      link.download = `${result.title || "music"}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Manual Music Check</h1>
          <p className="text-gray-600">Check the status of your music generation manually</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Check Music Status</CardTitle>
            <CardDescription>Enter your task ID to check if music is ready</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskId">Task ID</Label>
              <Input
                id="taskId"
                placeholder="Enter your task ID from music generation"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
              />
            </div>

            <Button onClick={checkStatus} disabled={checking} className="w-full">
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Check Status
                </>
              )}
            </Button>

            {result && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>Status:</strong> {result.status}
                    {result.message && (
                      <>
                        <br />
                        <strong>Message:</strong> {result.message}
                      </>
                    )}
                  </AlertDescription>
                </Alert>

                {result.status === "completed" && result.audioUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        Your Music is Ready!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.title && <p className="font-semibold">{result.title}</p>}

                      {result.imageUrl && (
                        <img
                          src={result.imageUrl || "/placeholder.svg"}
                          alt="Album art"
                          className="w-32 h-32 rounded-lg object-cover mx-auto"
                        />
                      )}

                      <audio controls className="w-full">
                        <source src={result.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>

                      <Button onClick={downloadAudio} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Music
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Full Response:</h4>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Where to Find Your Task ID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">Your task ID should be displayed when music generation starts:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
              <li>Look for "Task ID: xxx" in the loading screen</li>
              <li>Check browser console logs for "Task ID found"</li>
              <li>Check server logs for the task ID in the API response</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
