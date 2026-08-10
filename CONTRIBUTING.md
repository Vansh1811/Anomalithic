# Contributing to Anomalithic

Thanks for your interest in contributing! This guide covers everything you need to get set up, make a change, and open a pull request that passes CI on the first try.

## Prerequisites

- **Node.js** >= 20 (see `engines` in `package.json`)
- **pnpm** 10.33.0 (see `packageManager` in `package.json`)

## Setup

```bash
pnpm install
pnpm build
```

`pnpm build` uses Turbo, and packages depend on each other's `dist/` output, so you must build once before running `typecheck` or the CLI.

## The verification loop

Before opening a PR, run all four checks locally. These are exactly the four steps run in CI (`.github/workflows/ci.yml`), so a green local run means a green PR:

```bash
pnpm test        # vitest
pnpm typecheck    # tsc --noEmit across the workspace
pnpm lint         # biome
pnpm format       # biome
```

## Running it without an API key

You don't need a model API key to exercise the whole swarm — the built-in mock provider drives a full run offline:

```bash
node apps/cli/dist/index.js swarm -p mock "summarize the plan"
```

To use real models, copy `.env.example` to `.env` and add a key (e.g. `OPENROUTER_API_KEY` for the free router, or `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`).

## Repo layout

| Package | Role |
|---|---|
| `@anomalithic/impressions` | Signed thinking-impression trust anchor |
| `@anomalithic/runtime` | Agent loop, typed event bus, provider/tool interfaces |
| `@anomalithic/providers` | Free Models Router + OpenAI-compatible + Anthropic + Mock |
| `@anomalithic/tools` | Built-in fs / shell / web tools + registry |
| `@anomalithic/sessions` | Durable session store + permission rulesets |
| `@anomalithic/swarm` | Orchestrator + specialists; delegate / parallel / handoff |
| `@anomalithic/mcp` | MCP stdio client -> MCP tools as agent tools |
| `@anomalithic/server` | Local HTTP runtime API (SSE streaming) |
| `@anomalithic/sdk` | Typed client for the runtime API |
| `apps/cli` | `anomalithic` CLI - `run`, `swarm`, `serve`, `models` |
| `apps/web` | Next.js UI (swarm console + design system) |
| `apps/desktop` | Tauri desktop shell |

In short: `runtime` is the loop, `providers` are model adapters, `tools` are built-ins, `swarm` is orchestration, and `server`/`sdk` make up the local API.

## Code style

- Formatting and linting are enforced with [Biome](https://biomejs.dev/) (`biome.json`): double quotes, semicolons as needed, 110-column lines.
- Tests live alongside each package in `packages/*/test/**/*.test.ts`, per `vitest.config.ts`.

## Commit / PR expectations

- One logical change per PR.
- Add or update tests for any behaviour change.
- Reference the issue you're addressing in the PR description.

## Licensing

Contributions to the runtime packages and apps are made under Apache-2.0 (see `LICENSE`). See `LICENSING.md` for the boundary between the open-core runtime and the proprietary hosted components.
