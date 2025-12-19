"use client"

import { useState, useCallback } from "react"

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useApi<T = any>(url: string, options: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const request = useCallback(
    async (method = "GET", body?: any) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
        options.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An error occurred")
        setError(error)
        options.onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [url, options],
  )

  const get = useCallback(() => request("GET"), [request])
  const post = useCallback((body: any) => request("POST", body), [request])
  const put = useCallback((body: any) => request("PUT", body), [request])
  const del = useCallback(() => request("DELETE"), [request])

  return { data, loading, error, get, post, put, delete: del, request }
}
