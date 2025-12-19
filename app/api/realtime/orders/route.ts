import { registerSender } from "@/lib/realtime"
import { Logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const encoder = new TextEncoder()

  let closed = false

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: unknown) => {
        if (closed) return
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
      }

      const unregister = registerSender((event) => send(event))

      send({ type: "connected", ts: Date.now() })

      const keepAlive = setInterval(() => {
        if (closed) return
        controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`))
      }, 15000)

      const cleanup = () => {
        if (closed) return
        closed = true
        clearInterval(keepAlive)
        unregister()
        try {
          controller.close()
        } catch (err) {
          Logger.error("SSE controller close error", { err })
        }
      }

      request.signal.addEventListener("abort", cleanup)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
