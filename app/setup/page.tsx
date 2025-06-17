"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExternalLink, Key, Copy, CreditCard, CheckCircle, Info } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function SetupPage() {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Environment variable copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            API Setup Guide
          </h1>
          <p className="text-gray-600">Configure your API keys to start generating verses and music</p>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Updated Implementation:</strong> We've simplified the music generation to use the standard Suno API
            without callbacks for better reliability.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Google Gemini API Setup
              </CardTitle>
              <CardDescription>For generating verses with Gemini AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Required Environment Variable:</h4>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                  <span>GOOGLE_GENERATIVE_AI_API_KEY=your-api-key</span>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard("GOOGLE_GENERATIVE_AI_API_KEY")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Setup Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to Google AI Studio</li>
                  <li>Sign in with your Google account</li>
                  <li>Click "Get API Key" in the left sidebar</li>
                  <li>Create a new API key or use an existing one</li>
                  <li>Copy the API key</li>
                  <li>Add it to your environment variables</li>
                </ol>
              </div>

              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Free Tier Available:</strong> Google Gemini API offers a generous free tier. If you hit
                  limits:
                  <ul className="mt-2 space-y-1">
                    <li>• Check your usage in Google AI Studio</li>
                    <li>• Wait for daily reset (midnight PT)</li>
                    <li>• Enable billing for higher limits</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="https://aistudio.google.com/app/apikey" target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Get Gemini API Key
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="https://aistudio.google.com/app/usage" target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Check API Usage
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Suno API Setup
              </CardTitle>
              <CardDescription>For generating music from verses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Required Environment Variable:</h4>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                  <span>SUNO_API_KEY=your-suno-api-key</span>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard("SUNO_API_KEY")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Simplified API:</strong> We now use the standard Suno API endpoint with simple mode:
                  <ul className="mt-2 space-y-1">
                    <li>• No callback URL required</li>
                    <li>• Direct response with audio</li>
                    <li>• 400 character prompt limit</li>
                    <li>• Automatic verse trimming if needed</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-semibold">Setup Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Visit SunoAPI.org</li>
                  <li>Sign up for an account</li>
                  <li>Get your API key from the dashboard</li>
                  <li>Add the key to your environment variables</li>
                  <li>Test with a simple verse</li>
                </ol>
              </div>

              <Button asChild className="w-full">
                <Link href="https://docs.sunoapi.org" target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Suno API Docs
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Request Format</CardTitle>
            <CardDescription>How the music generation request is structured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {`POST https://apibox.erweima.ai/api/v1/generate

Headers:
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer <your-suno-api-key>

Body:
{
  "prompt": "Your verse text here (max 400 chars)",
  "customMode": false,
  "instrumental": false
}`}
              </pre>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Simple Mode Benefits:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Only prompt required - no style or title needed</li>
                  <li>• Faster processing with direct response</li>
                  <li>• Recommended for first-time users</li>
                  <li>• Automatic optimization by Suno AI</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Instructions</CardTitle>
            <CardDescription>How to set environment variables in different platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Vercel</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Add environment variables in your Vercel dashboard under Settings → Environment Variables
                </p>
                <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                  <div>GOOGLE_GENERATIVE_AI_API_KEY</div>
                  <div>SUNO_API_KEY</div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Netlify</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Set environment variables in Site settings → Environment variables
                </p>
                <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                  <div>GOOGLE_GENERATIVE_AI_API_KEY</div>
                  <div>SUNO_API_KEY</div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Local Development</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Create a <code>.env.local</code> file in your project root:
                </p>
                <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                  <div>GOOGLE_GENERATIVE_AI_API_KEY=your_key</div>
                  <div>SUNO_API_KEY=your_key</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/">Start Creating Music</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
