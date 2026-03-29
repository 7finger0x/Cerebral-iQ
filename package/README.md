<div align="center">

<br />

<img src="https://github.com/vibecheck-oss/vibecheck/raw/HEAD/packages/vscode-extension/images/vibecheck_logo_transparent_2x.png" alt="VibeCheck CLI" width="80" />

<br />

# VibeCheck CLI

### The trust layer for AI-generated code.

Catches phantom dependencies, ghost API routes, fake SDK methods, credential leaks, and silent failures — before they ship.

<br />

[![npm version](https://img.shields.io/npm/v/@vibecheck-ai/cli?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/@vibecheck-ai/cli)&nbsp;&nbsp;[![Downloads](https://img.shields.io/npm/dm/@vibecheck-ai/cli?style=for-the-badge&logo=npm&logoColor=white&color=333)](https://www.npmjs.com/package/@vibecheck-ai/cli)&nbsp;&nbsp;[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](../../LICENSE)

</div>

<br />

<p align="center">
  <img src="https://github.com/vibecheck-oss/vibecheck/raw/HEAD/docs/assets/cli-scan-demo.gif" alt="VibeCheck CLI scanning a project in real time" width="820" />
</p>

<br />

---

<br />

## Why VibeCheck?

Every AI coding tool — **Cursor, Copilot, Claude, Windsurf, ChatGPT** — produces code that compiles, passes lint, and looks correct. Then it breaks in production.

```
  fetch('/api/payments/confirm')          →  Endpoint never implemented. 404 in prod.
  catch (err) { }                         →  Error silently swallowed. Data lost.
  { revenue: 99999 }                      →  Hardcoded mock. Dashboard lies to users.
  STRIPE_SECRET_KEY in client bundle      →  Credential leaked to every browser.
```

Your linter says it's fine. TypeScript says it's fine. PR review says it's fine.

**VibeCheck catches what they miss.** 14 detection engines. One command. Zero config.

<br />

---

<br />

## Quick Start

```bash
# Scan your project (no install required)
npx @vibecheck-ai/cli scan .

# Or install globally
npm install -g @vibecheck-ai/cli
vibecheck scan .

# Shorthand alias
vc scan .
```

That's it. No config files. No API keys. No setup wizard.

### API compatibility

When you sign in and use **server-backed daily scan limits**, the CLI must be a **current release** (24.x or newer as of this major). The API rejects legacy clients without up-to-date scan metering headers. If you see `SCAN_CLIENT_UPGRADE_REQUIRED`, run `npm i -g @vibecheck-ai/cli@latest` (or use `npx @vibecheck-ai/cli@latest`).

<br />

<p align="center">
  <img src="https://github.com/vibecheck-oss/vibecheck/raw/HEAD/docs/assets/cli-quickstart.png" alt="VibeCheck CLI quick start output" width="720" />
</p>

<br />

---

<br />

## 14 Detection Engines

Every engine is purpose-built for a specific failure mode that traditional tools miss. These map to the engines registered by the CLI `FileRunner` (workspace engines + baseline registry).

| # | Engine | What it catches |
|:---:|:---|:---|
| 1 | **Undefined env vars** | `process.env` references not backed by your env / truthpack |
| 2 | **Ghost routes** | `fetch` and client calls to API paths with no handler |
| 3 | **Phantom dependencies** | Imports of packages not declared or not resolvable |
| 4 | **API hallucinations** | SDK or API usage that does not exist for your stack |
| 5 | **Hardcoded secrets** | Keys, tokens, and passwords committed to source |
| 6 | **Security vulnerabilities** | Injection, XSS, SSRF, weak crypto, and related OWASP-style issues |
| 7 | **Fake features** | Placeholder flags, empty handlers, mock data in prod paths |
| 8 | **Version mismatches** | APIs used in ways incompatible with installed package versions |
| 9 | **Logic gaps** | Contradictory or impossible control flow |
| 10 | **Error-handling gaps** | Swallowed errors, risky `try`/`catch` shape, unchecked async results |
| 11 | **Incomplete implementation** | Stubs, empty bodies, and unfinished paths |
| 12 | **Type contracts** | Types asserted vs actual JSON/API shape mismatches |
| 13 | **Security patterns** | Unprotected routes, CSRF, JWT misuse, redirects, CSP gaps |
| 14 | **Performance anti-patterns** | N+1 queries, sync I/O in async paths, fetch-in-render, and similar |

<br />

---

<br />

## Commands

### `vibecheck scan`

Scan a file or directory for all findings.

```bash
vibecheck scan .
vibecheck scan src/
vibecheck scan src/api.ts
```

| Flag | Default | Description |
|:---|:---:|:---|
| `--json` | — | Output findings as JSON |
| `--no-color` | — | Disable ANSI color output |
| `--threshold <n>` | `75` | Minimum confidence to include a finding (0–100) |

<details>
<summary><strong>Example output</strong></summary>

```
  VibeCheck Scan
  3 files · 5 findings · 412ms

  ──────────────────────────────────────────────────────

  src/lib/payments.ts
  ──────────────────────────────────────────────────────
  ✗  CRIT  CRED001  line 12   Stripe live secret key hardcoded
     Move to process.env.STRIPE_SECRET_KEY

  ✗  HIGH  SEC001   line 34   SQL injection: template literal in query
     Use parameterized queries

  src/api/routes.ts
  ──────────────────────────────────────────────────────
  ✗  CRIT  GRT001   line 8    Ghost route: /api/payments/confirm has no handler
     Closest match: /api/payment/confirm (did you mean this?)

  ──────────────────────────────────────────────────────
  5 findings  ·  2 critical  ·  2 high  ·  1 medium
```

</details>

<details>
<summary><strong>JSON output</strong> (<code>--json</code>)</summary>

```json
{
  "findings": [
    {
      "id": "...",
      "engine": "credentials",
      "severity": "critical",
      "ruleId": "CRED001",
      "file": "src/lib/payments.ts",
      "line": 12,
      "message": "Stripe live secret key hardcoded",
      "evidence": "const key = 'sk_live_abc123...'",
      "suggestion": "Move to process.env.STRIPE_SECRET_KEY",
      "confidence": 0.99
    }
  ],
  "meta": {
    "filesScanned": 3,
    "totalFindings": 5,
    "durationMs": 412
  }
}
```

</details>

<br />

### `vibecheck score`

Compute a **0–100 trust score** with letter grade and ship/no-ship verdict.

```bash
vibecheck score .
vibecheck score src/ --json
```

| Flag | Default | Description |
|:---|:---:|:---|
| `--json` | — | Output score as JSON |
| `--no-color` | — | Disable color |

<details>
<summary><strong>Example output</strong></summary>

```
  VibeCheck Trust Score
  3 files · 5 findings · 412ms

  [██████████████████░░░░░░░░░░░░]  72/100 (C)

  Verdict    REVIEW
  Mixed reliability. Manual review recommended before shipping.

  Findings   2 critical · 2 high · 1 other

  ────────────────────────────────────────────────────────

  Dimensions

    API Integrity         [████████████████░░░░]  80
    Dependency Safety     [██████████████░░░░░░]  70
    Env Coverage          [████████████████████]  100
    Contract Health       [████████████░░░░░░░░]  60

  ────────────────────────────────────────────────────────

  Score Reducers (3 total)

     -15  1 critical Hardcoded Secrets finding — blocks shipping (CRED001)
      -8  1 high Security Vulnerabilities finding (SEC001)
      -5  1 high Ghost Routes finding (GRT001)

  ────────────────────────────────────────────────────────
  ▲ Run vibecheck scan to review flagged issues before shipping.
```

</details>

<br />

### `vibecheck guard`

**CI gatekeeper.** Scan and exit with code 1 if the trust score is below threshold or critical findings exist.

```bash
vibecheck guard .
vibecheck guard . --threshold 80
vibecheck guard . --fail-on critical
vibecheck guard . --fail-on none   # Never fail, just report
```

| Flag | Default | Description |
|:---|:---:|:---|
| `--threshold <n>` | `70` | Minimum score to pass |
| `--fail-on <level>` | `critical` | Fail on: `critical`, `high`, `any`, `none` |
| `--json` | — | Output report as JSON |

| Exit Code | Meaning |
|:---:|:---|
| `0` | Passed — score above threshold, no blocking findings |
| `1` | Failed — score below threshold or critical finding found |
| `2` | Error — invalid arguments or scan error |

<br />

### `vibecheck roast`

Scan and deliver a **brutal, opinionated summary** of how AI-generated the code looks.

```bash
vibecheck roast .
vibecheck roast src/
```

<details>
<summary><strong>Example output</strong></summary>

```
  VibeCheck Roast
  ──────────────────────────────────────────────────────────

  Let me be direct: this codebase has AI fingerprints all over it.

  The Worst Offender
  src/lib/payments.ts — 3 findings, trust score 42

  Stats
  ┌─────────────────────────────────┐
  │  Trust Score     42/100   F    │
  │  Hallucinations  3             │
  │  Phantom Deps    1             │
  │  Hardcoded Creds 1             │
  │  Security Issues 2             │
  └─────────────────────────────────┘

  Hallucination density: 1 issue per 47 lines. That's a lot.

  ──────────────────────────────────────────────────────────
  Run vibecheck scan for the full breakdown.
```

</details>

<br />

### `vibecheck context`

**Intent-aware codebase intelligence.** Query your code by natural language, evolve from provenance, and get proactive context hints.

```bash
vibecheck context --evolve
vibecheck context --intent "authentication"
vibecheck context --intent "where do we handle auth" --semantic
vibecheck context --proactive --file packages/api/src/routes/auth.ts
```

| Flag | Description |
|:---|:---|
| `--evolve` | Learn from provenance (`edits.jsonl`); write co-edits, sequences, outcome scores to `learned.json` |
| `--intent <query>` | Query codebase by natural language → files, symbols |
| `--semantic` | Use embeddings for intent query (slower, finds conceptually related code) |
| `--proactive` | Proactive context for focused file |
| `--file <path>` | Focused file path (required with `--proactive`) |
| `--json` | Machine-readable output |

<br />

---

<br />

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/vibecheck.yml
name: VibeCheck
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx @vibecheck-ai/cli guard . --threshold 70
```

### Pre-commit Hook

```bash
# .husky/pre-commit
vibecheck guard . --fail-on critical
```

### package.json Scripts

```json
{
  "scripts": {
    "vibecheck": "vibecheck scan .",
    "vibecheck:guard": "vibecheck guard . --threshold 70",
    "vibecheck:score": "vibecheck score ."
  }
}
```

<br />

---

<br />

## Output Formats

All commands support `--json` for machine-readable output. The JSON schema is stable across patch versions.

<details>
<summary><strong>Finding schema</strong></summary>

```ts
interface Finding {
  id: string;
  engine: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  ruleId: string;
  category: string;
  file: string;
  line: number;
  column: number;
  message: string;
  evidence: string;       // the offending code snippet
  suggestion?: string;    // how to fix it
  confidence: number;     // 0.0–1.0
  autoFixable: boolean;
}
```

</details>

<details>
<summary><strong>SARIF export</strong></summary>

The underlying `FileRunner` supports SARIF 2.1.0 for GitHub Code Scanning integration. Use `--json` and pipe to a SARIF converter, or use the [GitHub Action](../action) which handles this automatically.

</details>

<br />

---

<br />

## Configuration

### Ignore Patterns

Create `.vibecheckignore` at your project root:

```
# Ignore generated files
src/generated/**

# Ignore specific file
src/legacy/old-api.ts

# Wildcards
**/*.test.ts
```

### Environment Variables

| Variable | Description |
|:---|:---|
| `NO_COLOR` | Disable color output (same as `--no-color`) |
| `VIBECHECK_THRESHOLD` | Default confidence threshold |
| `VIBECHECK_WORKSPACE` | Override workspace root detection |

### Shell Completion

```bash
# Bash
eval "$(vibecheck completion bash)"

# Zsh
eval "$(vibecheck completion zsh)"
```

<br />

---

<br />

## Available on 4 Surfaces

| Surface | Install | Use case |
|:---|:---|:---|
| **CLI** (you are here) | `npm i -g @vibecheck-ai/cli` | CI/CD pipelines, terminal workflows, scripting |
| **VS Code Extension** | [Marketplace](https://marketplace.visualstudio.com/items?itemName=Vibecheck-AI.vibecheck-AI) | Interactive scanning, sidebar dashboard, inline fixes |
| **MCP Server** | `npx @vibecheck-ai/mcp` | AI agent integration (Cursor, Claude, etc.) |
| **GitHub Action** | `vibecheck-ai/action@v2` | Pull request verification, deployment gating |

<br />

---

<br />

## Language Support

**TypeScript** &nbsp;·&nbsp; **JavaScript** &nbsp;·&nbsp; **React** &nbsp;·&nbsp; **Vue** &nbsp;·&nbsp; **Svelte** &nbsp;·&nbsp; **Next.js** &nbsp;·&nbsp; **Python** &nbsp;·&nbsp; **Go** &nbsp;·&nbsp; **Rust**

<br />

## Privacy & Security

- All scanning runs **locally on your machine**
- **Zero code is transmitted** — ever
- Works **fully offline** and in air-gapped environments
- [Open source](https://github.com/vibecheck-oss/vibecheck) — read every line

<br />

---

<br />

<div align="center">

### Build with AI. Ship with proof.

<br />

[Website](https://vibecheckai.dev) &nbsp;&nbsp;·&nbsp;&nbsp; [Documentation](https://docs.vibecheckai.dev) &nbsp;&nbsp;·&nbsp;&nbsp; [Discord](https://discord.gg/vibecheck) &nbsp;&nbsp;·&nbsp;&nbsp; [GitHub](https://github.com/vibecheck-oss/vibecheck)

<br />

<sub>MIT License &nbsp;·&nbsp; Copyright 2024–2026 VibeCheck AI</sub>

</div>
