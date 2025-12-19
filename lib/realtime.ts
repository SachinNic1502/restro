export type RealtimeEventType = "order_created" | "order_updated" | "order_status_updated"

export type RealtimeEvent<T = unknown> = {
  type: RealtimeEventType
  ts: number
  data: T
}

type SendFn = (event: RealtimeEvent) => void

type GlobalState = {
  senders: Set<SendFn>
}

function getState(): GlobalState {
  const g = globalThis as any
  if (!g.__rms_realtime_state) {
    g.__rms_realtime_state = { senders: new Set<SendFn>() } satisfies GlobalState
  }
  return g.__rms_realtime_state as GlobalState
}

export function registerSender(send: SendFn) {
  const state = getState()
  state.senders.add(send)
  return () => {
    state.senders.delete(send)
  }
}

export function publishRealtime<T>(type: RealtimeEventType, data: T) {
  const state = getState()
  const evt: RealtimeEvent<T> = { type, ts: Date.now(), data }
  for (const send of state.senders) {
    try {
      send(evt as RealtimeEvent)
    } catch {
      state.senders.delete(send)
    }
  }
}
