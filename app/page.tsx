"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Loader2,
  Music,
  Download,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Settings,
  Clock,
  ExternalLink,
  Copy,
  AlertCircle,
  CheckCircle,
  Info,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMusicNotifications } from "@/hooks/use-music-notifications"
import Link from "next/link"

type WorkflowState = "input" | "generating-verse" | "verse-review" | "generating-music" | "music-ready" | "music-error"

interface MusicData {
  audioUrl: string
  imageUrl?: string
  filename: string
  title?: string
  duration?: number
}

export default function VerseMusicGenerator() {
  const [state, setState] = useState<WorkflowState>("input")
  const [idea, setIdea] = useState("")
  const [verse, setVerse] = useState("")
  const [musicData, setMusicData] = useState<MusicData | null>(null)
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [musicError, setMusicError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("V4")
  const [isInstrumental, setIsInstrumental] = useState(false)
  const { toast } = useToast()

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  }, [])

  // Handle music generation notifications
  const handleMusicNotification = useCallback(
    (notification: any) => {
      console.log("Received music notification:", notification)

      if (notification.type === "music_complete") {
        const data = notification.data

        // Handle different response formats
        let songs = []
        if (data.data && Array.isArray(data.data)) {
          songs = data.data
        } else if (Array.isArray(data)) {
          songs = data
        } else if (data.audio_url) {
          songs = [data]
        }

        if (songs.length > 0) {
          const song = songs[0]
          setMusicData({
            audioUrl: song.audio_url,
            imageUrl: song.image_url,
            filename: `${song.title?.replace(/[^a-zA-Z0-9]/g, "_") || "generated-music"}.mp3`,
            title: song.title,
            duration: song.duration,
          })
          setState("music-ready")
          setTaskId(null)

          toast({
            title: "Music generated successfully!",
            description: "Your verse has been transformed into music.",
          })
        } else {
          setMusicError("Music generation completed but no audio was returned.")
          setState("music-error")
          setTaskId(null)
        }
      }
    },
    [toast],
  )

  const { stopPolling } = useMusicNotifications(
    state === "generating-music" ? sessionId : null,
    handleMusicNotification,
  )

  // Check if APIs are configured
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await fetch("/api/check-setup")
        const data = await response.json()
        setSetupComplete(data.configured)
      } catch (error) {
        setSetupComplete(false)
      }
    }
    checkSetup()
  }, [])

  const handleApiError = (error: any, data: any) => {
    const errorType = data?.type || "generic_error"

    switch (errorType) {
      case "quota_error":
        toast({
          title: "API Quota Exceeded",
          description:
            "Your Google Gemini API quota has been exceeded. Please check your billing settings or try again later.",
          variant: "destructive",
        })
        break
      case "rate_limit":
        setIsRateLimited(true)
        toast({
          title: "Rate Limit Exceeded",
          description: "Please wait a moment before trying again.",
          variant: "destructive",
        })
        setTimeout(() => setIsRateLimited(false), 60000)
        break
      case "auth_error":
        toast({
          title: "Authentication Error",
          description: "Please check your API key configuration.",
          variant: "destructive",
        })
        break
      default:
        toast({
          title: "Error generating verse",
          description: data?.error || error.message || "Please try again later.",
          variant: "destructive",
        })
    }
  }

  const handleMusicError = (error: any, data: any) => {
    const errorType = data?.type || "generic_error"

    switch (errorType) {
      case "auth_error":
        setMusicError("Invalid API key. Please check your music generation API key configuration.")
        break
      case "rate_limit":
        setMusicError("Rate limit exceeded. Please wait a moment and try again.")
        break
      case "network_error":
        setMusicError("Unable to connect to the music generation service. Please check your internet connection.")
        break
      case "config_error":
        setMusicError("Music generation API key is not configured. Please check your environment variables.")
        break
      default:
        setMusicError(data?.error || "Music generation failed. Please try again.")
    }

    setState("music-error")
    stopPolling()
  }

  const generateVerse = async () => {
    if (!idea.trim()) {
      toast({
        title: "Please enter an idea",
        description: "We need your creative idea to generate a verse!",
        variant: "destructive",
      })
      return
    }

    if (idea.length > 500) {
      toast({
        title: "Idea too long",
        description: "Please keep your idea under 500 characters.",
        variant: "destructive",
      })
      return
    }

    setState("generating-verse")
    setRetryCount(0)

    try {
      const response = await fetch("/api/generate-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      })

      const data = await response.json()

      if (!response.ok) {
        handleApiError(new Error(data.error), data)
        setState("input")
        return
      }

      setVerse(data.verse)
      setState("verse-review")
    } catch (error: any) {
      handleApiError(error, {})
      setState("input")
    }
  }

  const regenerateVerse = async () => {
    setState("generating-verse")
    setRetryCount((prev) => prev + 1)

    try {
      const response = await fetch("/api/generate-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, regenerate: true }),
      })

      const data = await response.json()

      if (!response.ok) {
        handleApiError(new Error(data.error), data)
        setState("verse-review")
        return
      }

      setVerse(data.verse)
      setState("verse-review")
    } catch (error: any) {
      handleApiError(error, {})
      setState("verse-review")
    }
  }

  const generateMusic = async () => {
    if (!sessionId) {
      toast({
        title: "Session Error",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      })
      return
    }

    setState("generating-music")
    setMusicError(null)
    setTaskId(null)

    try {
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verse,
          idea,
          sessionId,
          model: selectedModel,
          instrumental: isInstrumental,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        handleMusicError(new Error(data.error), data)
        return
      }

      if (data.status === "processing") {
        setTaskId(data.taskId)
        toast({
          title: "Music generation started",
          description: `Using Suno ${selectedModel} model. This may take 2-5 minutes.`,
        })
      } else if (data.status === "completed") {
        // Immediate completion (unlikely but possible)
        setMusicData({
          audioUrl: data.audioUrl,
          imageUrl: data.imageUrl,
          filename: data.filename,
          title: data.title,
          duration: data.duration,
        })
        setState("music-ready")

        toast({
          title: "Music generated successfully!",
          description: "Your verse has been transformed into music.",
        })
      }
    } catch (error: any) {
      handleMusicError(error, {})
    }
  }

  const copyVerse = () => {
    navigator.clipboard.writeText(verse)
    toast({
      title: "Verse copied!",
      description: "The verse has been copied to your clipboard.",
    })
  }

  const downloadAudio = () => {
    if (musicData?.audioUrl) {
      const link = document.createElement("a")
      link.href = musicData.audioUrl
      link.download = musicData.filename || "generated-music.mp3"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const startOver = () => {
    stopPolling()
    setState("input")
    setIdea("")
    setVerse("")
    setMusicData(null)
    setRetryCount(0)
    setIsRateLimited(false)
    setMusicError(null)
    setTaskId(null)
    // Generate new session ID
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  }

  const retryMusic = () => {
    setMusicError(null)
    generateMusic()
  }

  // Show setup warning if APIs are not configured
  if (setupComplete === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Verse to Music Generator
            </h1>
            <p className="text-gray-600">Transform your ideas into verses, then into beautiful music</p>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              API configuration required. Please set up your Google Gemini and Suno API keys to use this application.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Setup Required
              </CardTitle>
              <CardDescription>Configure your API keys to start generating music</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                This application requires API keys from Google Gemini (for verse generation) and Suno API (for music
                generation).
              </p>
              <Button asChild className="w-full">
                <Link href="/setup">
                  <Settings className="w-4 h-4 mr-2" />
                  View Detailed Setup Instructions
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show loading while checking setup
  if (setupComplete === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Verse to Music Generator
          </h1>
          <p className="text-gray-600">Transform your ideas into verses, then into beautiful music</p>
        </div>

        {/* Session info for debugging */}
        {sessionId && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Session: {sessionId.split("_")[2]} • Model: Suno {selectedModel} •{" "}
              {isInstrumental ? "Instrumental" : "With Vocals"} • Real-time notifications enabled
            </AlertDescription>
          </Alert>
        )}

        {/* Rate limit warning */}
        {isRateLimited && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Rate limit reached. Please wait a moment before generating another verse.
            </AlertDescription>
          </Alert>
        )}

        {state === "input" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Share Your Idea
              </CardTitle>
              <CardDescription>Tell us about your creative idea and we'll turn it into a verse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idea">Your Creative Idea</Label>
                <Textarea
                  id="idea"
                  placeholder="e.g., A lonely astronaut floating in space, dreaming of home..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="min-h-[100px]"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">{idea.length}/500 characters</div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Tip:</strong> If you encounter quota errors, try visiting{" "}
                  <Link href="https://aistudio.google.com" target="_blank" className="text-blue-600 hover:underline">
                    Google AI Studio <ExternalLink className="w-3 h-3 inline" />
                  </Link>{" "}
                  to check your API usage and billing settings.
                </AlertDescription>
              </Alert>

              <Button onClick={generateVerse} className="w-full" disabled={isRateLimited || !idea.trim()}>
                {isRateLimited ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Please Wait...
                  </>
                ) : (
                  "Generate Verse"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {state === "generating-verse" && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-lg font-medium">Crafting your verse...</p>
              <p className="text-sm text-gray-600">Gemini AI is working its magic</p>
              {retryCount > 0 && <p className="text-xs text-gray-500">Attempt {retryCount + 1}</p>}
            </CardContent>
          </Card>
        )}

        {state === "verse-review" && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Verse</CardTitle>
              <CardDescription>How does this verse capture your idea?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg relative">
                <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed">{verse}</pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={copyVerse}
                  title="Copy verse"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {verse.length > 400 && (
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Note:</strong> Your verse is {verse.length} characters. It will be trimmed to 400 characters
                    for music generation.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-select">Suno AI Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="V3_5">Suno V3.5 (Faster)</SelectItem>
                        <SelectItem value="V4">Suno V4 (Balanced)</SelectItem>
                        <SelectItem value="V4_5">Suno V4.5 (Best Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instrumental-toggle">Music Type</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="instrumental-toggle" checked={isInstrumental} onCheckedChange={setIsInstrumental} />
                      <div className="flex items-center gap-2">
                        {isInstrumental ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        <span className="text-sm">{isInstrumental ? "Instrumental" : "With Vocals"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Settings:</strong> V4.5 offers the best quality but may take longer. Instrumental mode
                    creates music without vocals, perfect for background music.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button onClick={generateMusic} className="flex-1">
                    <Music className="w-4 h-4 mr-2" />I Love It! Make Music
                  </Button>
                  <Button onClick={regenerateVerse} variant="outline" disabled={isRateLimited}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {isRateLimited ? "Wait..." : "Try Again"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {state === "generating-music" && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-lg font-medium">Creating your music...</p>
              <p className="text-sm text-gray-600">
                Suno AI {selectedModel} is composing your {isInstrumental ? "instrumental" : "vocal"} song
              </p>
              {taskId && <p className="text-xs text-gray-500">Task ID: {taskId}</p>}
              <p className="text-xs text-gray-400">This may take 2-5 minutes • You'll be notified when ready</p>
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                Real-time notifications active
              </div>
            </CardContent>
          </Card>
        )}

        {state === "music-error" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Music Generation Failed
              </CardTitle>
              <CardDescription>We encountered an issue generating your music</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed mb-4">{verse}</pre>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{musicError}</AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button onClick={retryMusic} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={copyVerse} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Verse
                </Button>
                <Button onClick={startOver} variant="outline">
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {state === "music-ready" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Your Music is Ready!
              </CardTitle>
              <CardDescription>Listen to your verse transformed into music</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed mb-4">{verse}</pre>

                {/* Show album art if available */}
                {musicData?.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={musicData.imageUrl || "/placeholder.svg"}
                      alt="Generated album art"
                      className="w-32 h-32 rounded-lg object-cover mx-auto"
                    />
                  </div>
                )}

                {musicData?.audioUrl && (
                  <audio controls className="w-full">
                    <source src={musicData.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}

                {musicData?.duration && (
                  <p className="text-xs text-gray-500 mt-2">
                    Duration: {Math.floor(musicData.duration / 60)}:
                    {Math.floor(musicData.duration % 60)
                      .toString()
                      .padStart(2, "0")}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={downloadAudio} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Music
                </Button>
                <Button onClick={startOver} variant="outline">
                  Create Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
