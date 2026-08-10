<div align="center">

# ⬛ Anomalithic

### One open-core, model-agnostic **multi-agent** runtime to rule them all.

[Architecture notes](./ARCHITECTURE_NOTES.md) · [Audit](./AUDIT.md) · [Changelog](./CHANGELOG.md) · [Contributing](./CONTRIBUTING.md)

![License](https://img.shields.io/badge/license-Apache--2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Models](https://img.shields.io/badge/models-Free%20Router%20·%20Claude%20·%20GPT%20·%20Gemini%20·%20Ollama-c2603a)
![Tests](https://img.shields.io/badge/tests-41%20passing-4caf7d)

</div>

---

Anomalithic is a premium harness around **any** model: a swarm of specialists, real
tools, durable sessions, MCP, and a **trace you can watch think**. An Orchestrator
plans and delegates; specialists run in parallel, call tools, and hand off; every
thinking window mints a **signed impression** (the trust anchor for a thinking-time
ad layer, kept as a placeholder in v1).

> **v0.2.0 — greenfield rebuild.** This is a from-scratch rewrite (superseding releases through v0.1.4). Architecture and UI
> are informed by two references (both MIT): **OpenSwarm** (orchestrator + specialists,
> SendMessage/Handoff) and **opencode** (typed tool contract, subagent-as-child-session,
> one-runtime-many-surfaces). See [ARCHITECTURE_NOTES.md](./ARCHITECTURE_NOTES.md).

## ✦ What works today

- **Provider-agnostic agent loop** — gather → think → act → observe, with agent-defined
  thinking windows that mint signed impressions on any model.
- **Free Models Router** — zero-cost default that routes around rate-limited free
  OpenRouter models; plus Anthropic, OpenAI, Gemini, Ollama, and a Mock provider.
- **Multi-agent swarm** — an Orchestrator + 8 specialists (Researcher, Coder, Analyst,
  Writer, Slides, Docs, Image, Video) with `delegate`, `delegate_parallel`, and `handoff`.
- **Real tools** — path-confined fs, guarded shell, web_fetch, plus **MCP** servers
  exposed as agent tools (official MCP SDK).
- **Durable sessions** + permission rulesets (subagent narrowing).
- **Local runtime API** — `serve` streams the trace as SSE; a typed **SDK** consumes it.
- **Premium UI** — a Next.js web app (live swarm console, design system, motion) and a
  Tauri desktop shell rendering the same UI.

## ✦ Packages

| Package | Role |
|---|---|
| `@anomalithic/impressions` | Signed thinking-impression trust anchor |
| `@anomalithic/runtime` | Agent loop, typed event bus, provider/tool interfaces |
| `@anomalithic/providers` | Free Models Router + OpenAI-compatible + Anthropic + Mock |
| `@anomalithic/tools` | Built-in fs / shell / web tools + registry |
| `@anomalithic/sessions` | Durable session store + permission rulesets |
| `@anomalithic/swarm` | Orchestrator + specialists; delegate / parallel / handoff |
| `@anomalithic/mcp` | MCP stdio client → MCP tools as agent tools |
| `@anomalithic/server` | Local HTTP runtime API (SSE streaming) |
| `@anomalithic/sdk` | Typed client for the runtime API |
| `apps/cli` | `anomalithic` CLI — `run`, `swarm`, `serve`, `models` |
| `apps/web` | Premium Next.js UI (swarm console + design system) |
| `apps/desktop` | Tauri desktop shell |

## ✦ Quickstart

```bash
pnpm install
pnpm build

# Offline demo — no key needed (mock provider drives a full swarm):
node apps/cli/dist/index.js swarm -p mock "summarize the plan"

# Real models — copy .env.example to .env and add a key:
cp .env.example .env          # OPENROUTER_API_KEY for the free router, or ANTHROPIC/OPENAI/...
node apps/cli/dist/index.js swarm "Research MCP and write a 3-sentence explainer"

# One agent, one shot:
node apps/cli/dist/index.js run "explain MCP in one sentence"
```

### The premium UI

```bash
node apps/cli/dist/index.js serve     # runtime API on :4517
pnpm --filter @anomalithic/web dev    # web console on :4520
```

Open <http://localhost:4520/console>, give the Orchestrator a goal, and watch the swarm
delegate, call tools, and synthesize — streamed live.

## ✦ Develop

```bash
pnpm build       # build all packages (turbo + tsup)
pnpm test        # vitest — 41 tests
pnpm typecheck   # tsc --noEmit across the workspace
pnpm lint        # biome
```

## ✦ License

**Open-core.** The runtime packages, apps, and desktop shell are Apache-2.0
(see [LICENSE](./LICENSE)); the future hosted ad marketplace / payout wallet remain
proprietary ([LICENSING.md](./LICENSING.md)).

<div align="center"><sub>Built in the open.</sub></div>
