import type { RuntimeEvent } from "@anomalithic/runtime"

export interface AgentInfo {
  name: string
  description: string
  role: string
  color?: string
  toolNames?: string[]
}

export interface RunInput {
  prompt: string
  provider?: string
  model?: string
}

export interface SwarmInput {
  goal: string
  provider?: string
  model?: string
}

/** Reads an SSE response body, invoking `onEvent` for each parsed RuntimeEvent. */
async function consumeSSE(res: Response, onEvent: (event: RuntimeEvent) => void): Promise<void> {
  if (!res.body) throw new Error(`No response body (HTTP ${res.status})`)
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let nl = buf.indexOf("\n")
    while (nl !== -1) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      nl = buf.indexOf("\n")
      if (!line.startsWith("data:")) continue
      try {
        onEvent(JSON.parse(line.slice(5).trim()) as RuntimeEvent)
      } catch {
        // ignore malformed frames
      }
    }
  }
}

/** Reads a short diagnostic snippet from a non-ok response body, without throwing
 * if the body has already been consumed or isn't readable. */
async function readErrorDetail(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 200)
  } catch {
    return ""
  }
}

/** GETs a JSON endpoint, throwing a descriptive error on a non-2xx response instead of
 * silently parsing whatever body came back (which may not even be valid JSON). */
async function getJson<T>(path: string, root: string): Promise<T> {
  const res = await fetch(`${root}${path}`)
  if (!res.ok) {
    const detail = await readErrorDetail(res)
    throw new Error(`GET ${path} failed: HTTP ${res.status}${detail ? ` - ${detail}` : ""}`)
  }
  return (await res.json()) as T
}

/** Typed client for the Anomalithic runtime server. Used by the web and desktop apps. */
export function createClient(baseUrl = "http://127.0.0.1:4517") {
  const root = baseUrl.replace(/\/$/, "")
  async function postStream(
    path: string,
    body: unknown,
    onEvent: (e: RuntimeEvent) => void,
    signal?: AbortSignal,
  ) {
    const res = await fetch(`${root}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal,
    })
    if (!res.ok) {
      const detail = await readErrorDetail(res)
      throw new Error(`POST ${path} failed: HTTP ${res.status}${detail ? ` - ${detail}` : ""}`)
    }
    await consumeSSE(res, onEvent)
  }
  return {
    async health(): Promise<{ ok: boolean; version?: string }> {
      return getJson<{ ok: boolean; version?: string }>("/health", root)
    },
    async agents(): Promise<AgentInfo[]> {
      const data = await getJson<{ agents: AgentInfo[] }>("/agents", root)
      return data.agents
    },
    async sessions(): Promise<unknown[]> {
      const data = await getJson<{ sessions: unknown[] }>("/sessions", root)
      return data.sessions
    },
    run(input: RunInput, onEvent: (e: RuntimeEvent) => void, signal?: AbortSignal): Promise<void> {
      return postStream("/run", input, onEvent, signal)
    },
    swarm(input: SwarmInput, onEvent: (e: RuntimeEvent) => void, signal?: AbortSignal): Promise<void> {
      return postStream("/swarm", input, onEvent, signal)
    },
  }
}

export type AnomalithicClient = ReturnType<typeof createClient>
export type { RuntimeEvent }
