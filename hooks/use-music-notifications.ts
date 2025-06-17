"use client"

import { useEffect, useRef } from "react"

interface MusicNotification {
  type: string
  data: any
  timestamp: number
}

export function useMusicNotifications(
  sessionId: string | null,
  onNotification: (notification: MusicNotification) => void,
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(false)

  useEffect(() => {
    if (!sessionId || isPollingRef.current) return

    isPollingRef.current = true

    const pollForNotifications = async () => {
      try {
        const response = await fetch(`/api/ws-notify?sessionId=${sessionId}`)
        if (response.ok) {
          const notification = await response.json()
          if (notification.type && notification.data) {
            onNotification(notification)
          }
        }
      } catch (error) {
        console.error("Error polling for notifications:", error)
      }
    }

    // Poll every 2 seconds
    intervalRef.current = setInterval(pollForNotifications, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isPollingRef.current = false
    }
  }, [sessionId, onNotification])

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isPollingRef.current = false
  }

  return { stopPolling }
}
