import { useEffect, useRef, useState } from "react"

export function useEventSource(url: string, onMessage: (event: MessageEvent) => void) {
  const [status, setStatus] = useState<"connecting" | "open" | "closed" | "error">("connecting")
  const esRef = useRef<EventSource | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const backoffRef = useRef(1000)

  const connect = () => {
    if (esRef.current) esRef.current.close()
    setStatus("connecting")
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => {
      setStatus("open")
      backoffRef.current = 1000
    }

    es.onmessage = (event) => {
      onMessage(event)
    }

    es.onerror = () => {
      setStatus("error")
      es.close()
      const delay = backoffRef.current
      backoffRef.current = Math.min(backoffRef.current * 2, 30000)
      retryTimeoutRef.current = setTimeout(connect, delay)
    }
  }

  useEffect(() => {
    connect()
    return () => {
      if (esRef.current) esRef.current.close()
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [url])

  return status
}
