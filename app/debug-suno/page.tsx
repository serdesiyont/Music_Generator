"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Bug, CheckCircle, XCircle } from "lucide-react"

export default function DebugSuno() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testSunoAPI = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-suno")
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        error: error.message,
        success: false,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Suno API Debug</h1>
          <p className="text-gray-600">Test and debug the Suno API integration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              API Test
            </CardTitle>
            <CardDescription>Test the Suno API with a simple request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testSunoAPI} disabled={testing} className="w-full">
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing API...
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4 mr-2" />
                  Test Suno API
                </>
              )}
            </Button>

            {result && (
              <div className="space-y-4">
                <Alert>
                  {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>
                    <strong>Status:</strong> {result.success ? "Success" : "Failed"}
                    {result.status && ` (HTTP ${result.status})`}
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Full Response:</h4>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                </div>

                {result.rawResponse && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Raw API Response:</h4>
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{result.rawResponse}</pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Invalid API Key (401)</h4>
              <p className="text-sm text-gray-600">
                • Check that SUNO_API_KEY is set correctly
                <br />• Verify the API key is valid and active
                <br />• Make sure there are no extra spaces or characters
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">2. Rate Limit (429)</h4>
              <p className="text-sm text-gray-600">
                • Wait before making another request
                <br />• Check your API plan limits
                <br />• Consider upgrading your plan
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">3. Invalid Request Format (400)</h4>
              <p className="text-sm text-gray-600">
                • Check the request body format
                <br />• Verify required fields are present
                <br />• Check prompt length limits
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">4. Service Unavailable (503)</h4>
              <p className="text-sm text-gray-600">
                • Suno API might be temporarily down
                <br />• Check Suno API status page
                <br />• Try again later
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
