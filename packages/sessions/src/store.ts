import { randomUUID } from "node:crypto"
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { Message } from "@anomalithic/runtime"
import type { Ruleset } from "./permission.js"

export interface Session {
  id: string
  parentId?: string
  agent?: string
  title: string
  createdAt: number
  updatedAt: number
  messages: Message[]
  permission: Ruleset
}

export interface CreateSessionInput {
  parentId?: string
  agent?: string
  title?: string
  permission?: Ruleset
  messages?: Message[]
}

/** Wall-clock now, isolated so it can be stubbed in tests. */
const now = () => Date.now()

/** Matches a bare UUID (the only shape `randomUUID()` ever produces for session ids). */
const SAFE_ID = /^[a-zA-Z0-9-]+$/

/**
 * File-backed session store: one JSON file per session under `dir`. Durable and
 * resumable — sessions survive restarts, which is what the orchestrator relies on
 * for multi-hour runs and subagent child sessions.
 */
export class SessionStore {
  constructor(private readonly dir: string) {}

  private path(id: string): string {
    if (!SAFE_ID.test(id)) {
      throw new Error(`Invalid session id: ${id}`)
    }
    return join(this.dir, `${id}.json`)
  }

  async create(input: CreateSessionInput = {}): Promise<Session> {
    await mkdir(this.dir, { recursive: true })
    const ts = now()
    const session: Session = {
      id: randomUUID(),
      parentId: input.parentId,
      agent: input.agent,
      title: input.title ?? "Untitled session",
      createdAt: ts,
      updatedAt: ts,
      messages: input.messages ?? [],
      permission: input.permission ?? [],
    }
    await this.save(session)
    return session
  }

  async get(id: string): Promise<Session | undefined> {
    try {
      return JSON.parse(await readFile(this.path(id), "utf8")) as Session
    } catch {
      return undefined
    }
  }

  async save(session: Session): Promise<void> {
    await mkdir(this.dir, { recursive: true })
    session.updatedAt = now()
    await writeFile(this.path(session.id), JSON.stringify(session, null, 2), "utf8")
  }

  async appendMessages(id: string, messages: Message[]): Promise<Session> {
    const session = await this.get(id)
    if (!session) throw new Error(`Unknown session: ${id}`)
    session.messages.push(...messages)
    await this.save(session)
    return session
  }

  async list(): Promise<Session[]> {
    let files: string[]
    try {
      files = await readdir(this.dir)
    } catch {
      return []
    }
    const out: Session[] = []
    for (const f of files) {
      if (!f.endsWith(".json")) continue
      const s = await this.get(f.slice(0, -5))
      if (s) out.push(s)
    }
    return out.sort((a, b) => b.updatedAt - a.updatedAt)
  }
}
