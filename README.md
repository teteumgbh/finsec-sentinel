# 🛡️ FinSec Sentinel
> **Real-Time FinOps Circuit Breaker & DLP Credential Shield for Multi-Agent Cloud Workloads.**
> FinSec Sentinel v1.2 — Deterministic Intent Reachability & FinOps Firewall (Migrated to #BuildHybridAI / Firebase AI Logic Architecture)

**FinSec Sentinel** is a lightweight, deterministic governance proxy that sits between autonomous IT/MSP agents and cloud foundation models. It solves the two most expensive production failures in enterprise agent deployments: **runaway agent loops that explode cloud bills** and **accidental credential exfiltration in debugging prompts**. Originally engineered for the **AWS MSP AI Hackathon** (Nov 7, 2026) and migrated on Nov 9, 2026 to the **Google / Firebase #BuildHybridAI Hackathon 2026**, where its cloud stage is priced and routed as **Gemini Flash via Firebase AI Logic** (the Nov 7 Bedrock baseline is preserved in Appendix A).

🔗 **Live Interactive Console:** [https://teteumgbh.github.io/finsec-sentinel/](https://teteumgbh.github.io/finsec-sentinel/)

🔗 **Sibling project — The Safe Latch (A Trava):** the same deterministic core (on-device gate + L2.5 Intent Reachability Graph + live audit ledger) aimed at voice/browser agents, also entered in #BuildHybridAI. Repo: [github.com/teteumgbh/the-safe-latch](https://github.com/teteumgbh/the-safe-latch) · Live: [teteumgbh.github.io/the-safe-latch](https://teteumgbh.github.io/the-safe-latch/)

## ☁️ v1.3 — Real Firebase AI Logic Stage 2 (Nov 13, 2026)

Stage 2 is no longer framing: `index.html` now carries a real Firebase AI Logic integration (ES module importing `firebase-app` / `firebase-ai` from the gstatic CDN, SDK v11.10.0; `initAIGateway()` + `forwardToCloud()` / `invokeFirebaseAiStage2()`), designed by Jim (Gemini) and built/measured by Muse.

- It fires **only** after the local gate's `GREEN_FORWARDED` verdict (DLP + loop breaker + pruning + task-to-tool reachability all passed), sending exactly the pruned payload the gate measured — the page reconstructs the pruned payload and verifies its length against the inspection's measured `sentChars` before any send; a mismatch records `CLOUD_INFERENCE_SKIPPED (PAYLOAD_MISMATCH)` and sends nothing.
- `CLOUD_INFERENCE_SUCCESS` is written to the exportable audit ledger **only after a real `generateContent()` response**, keyed by the inspection's FNV-1a commitment hash. Every other outcome is `CLOUD_INFERENCE_SKIPPED` with its reason.
- **Honest-fallback by design:** if the SDK or the project config fails, the page shows a "Modo Local Apenas" badge and Stage 1 keeps deciding alone, fully functional. Pre-publish verification (Nov 13) found the bundled project config does **not** authenticate (Gemini API REST check returned `API_KEY_INVALID`), so v1.3 claims **no live cloud call** until a verified Firebase project config is supplied — the wiring, the guards and the audit events are real and unit-tested with a stubbed SDK; the cloud simply stays off until its key is.
- The deterministic Stage-1 engine and its benchmark are untouched and re-measured after the integration: **10 scenarios × 300 iterations, all pass; original-7 totals identical (1,069 → 181 chars; 123,681 → 546 billable tokens; US$ 0.4172 saved per 7-incident batch at Gemini 3.8 Flash rates)**. The Stage-2 gateway's default model is standardized to `gemini-3.8-flash` (per Jim's reconciliation, 2026-11-13), the same model this project's published cost figures are priced on (US$ 0.75 / US$ 3.75 per 1M).

## 🚨 The Enterprise MSP Problem
Managed Service Providers (MSPs) deploying autonomous Tier-1, SecOps, and DevOps agents face two critical operational risks:
1. **FinOps Runaway Loops:** Two agents stuck in a confirmation ping-pong or a retry storm against a failing RDS/API endpoint can burn hundreds of thousands of tokens in minutes.
2. **SecOps Credential Leakage:** Autonomous debugging agents routinely scrape stacktraces, `.env` dumps, and Terraform states containing live `AKIA...` IAM keys, Bearer JWTs, or PEM private keys and forward them to external LLM contexts.

## 🧠 3-Layer Deterministic Governance Architecture
1. **Layer 1 — SecOps DLP Credential Shield:** Scans outbound agent payloads in sub-millisecond time to block AWS IAM keys, Bearer tokens, and RSA/PEM private keys before they leave the VPC/client boundary.
2. **Layer 2 — FinOps Loop Circuit Breaker:** Detects repetitive semantic step signatures (`>=3` identical retry/confirmation cycles) and trips the circuit breaker before runaway horizons (180–250 steps) drain cloud budgets.
3. **Layer 3 — Log Boilerplate Pruner:** Strips redundant timestamps, debug trace IDs, and `HealthCheck OK` noise from legitimate operational prompts before billing tokens on the cloud model (Gemini Flash via Firebase AI Logic).

## 📊 Empirical 7-Scenario Benchmark (300 Iterations / Scenario)
The production function (`inspectAgentTraffic`) was extracted from `index.html` and executed across **300 iterations per scenario** (2,100 total executions), using Gemini 3.8 Flash pricing via Firebase AI Logic (`$0.75 / 1M input tokens`, `$3.75 / 1M output tokens`, deterministic estimator `1 token = 4 chars`, `250 output tokens/step`). Every figure below is the executed output; the raw log is committed as `benchmark-raw-log.json`.

| Scenario | Sentinel Status | Input Payload (chars) | Sent to Cloud (chars) | Unchecked Billable Tokens | Actual Billed Tokens | USD Saved / Incident | Median Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Clean Ticket Triage (1 step)** | `GREEN_FORWARDED` | 162 | 118 | 291 | 280 | $0.0000 | 0.0034 ms |
| **2. AWS IAM Key Leak (1 step)** | `RED_DLP_BLOCK` | 171 | 0 | 293 | 0 | $0.0010 | 0.0010 ms |
| **3. Agent Ping-Pong Loop (250 steps)** | `AMBER_LOOP_KILLED` | 132 | 0 | 70,750 | 0 | $0.2406 | 0.0014 ms |
| **4. Bearer JWT Leak (1 step)** | `RED_DLP_BLOCK` | 169 | 0 | 293 | 0 | $0.0010 | 0.0014 ms |
| **5. Recursive Retry Storm (180 steps)** | `AMBER_LOOP_KILLED` | 143 | 0 | 51,480 | 0 | $0.1736 | 0.0007 ms |
| **6. Verbose CloudWatch Dump (1 step)** | `GREEN_FORWARDED` | 163 | 63 | 291 | 266 | $0.0000 | 0.0023 ms |
| **7. Private RSA Key in State (1 step)** | `RED_DLP_BLOCK` | 129 | 0 | 283 | 0 | $0.0010 | 0.0007 ms |

### Measured Benchmark Totals
- **Single-Pass Input Character Reduction:** `1,069 chars evaluated` -> `181 chars sent` (**83.1% measured input character reduction**).
- **Total Billable Token Reduction (with Loop Horizons):** `123,681 unchecked tokens` -> `546 billed tokens` (**99.6% token reduction** across the incident batch).
- **Direct Cloud Cost Saved per 7-Incident Batch:** **$0.4172 USD** (**$417.20 USD saved** per 1,000 operational incident cycles, at Gemini Flash rates).
- **Secret / Credential Leak Block Rate:** `3 / 3` (100% of tested IAM, JWT, and RSA secrets intercepted).
- **Runaway Loop Containment:** `2 / 2` (100% of multi-step loops halted).
- **Governance Filter Median Latency:** `0.0007 ms – 0.0034 ms` per scenario (re-measured Nov 9, 2026).

## 🔬 Methodology & Engineering Caveats
1. **Pricing & Token Model:** Cost savings are computed deterministically from character counts (`Math.ceil(chars / 4)`) and explicit loop horizon multipliers (`250` and `180` steps) using Google Gemini API rates for Gemini 3.8 Flash (`$0.75 / 1M` input, `$3.75 / 1M` output — verified Nov 9, 2026; this is an introductory rate scheduled by Google to rise to `$1.50 / $7.50` on Jan 1, 2027). The 250 output tokens/step is a stated modeling assumption of the benchmark, applied identically to the protected and unprotected arms.
2. **Scope of DLP Detection:** Regex signatures validate deterministic interception of structured secrets (`AKIA...`, `eyJ...`, PEM headers). Arbitrary unstructured PII requires pairing with a dedicated DLP/PII service in production.
3. **Verification Note:** During design review, hand-counted character totals for the scenario strings differed slightly from the shipped strings (6 of 7 strings, by 1–13 chars). All figures published here come from executing the shipped code itself — never from hand counts — and the raw execution log is committed to this repository (`benchmark-raw-log.json`) for audit.
4. **Execution Environment:** Latency medians were measured via automated Node.js extraction (300 iterations/scenario). Live browser telemetry on target hardware is scheduled for Phase 2 verification.

## 🚀 Quick Start (Zero Dependencies)
1. Open the live deployment at [https://teteumgbh.github.io/finsec-sentinel/](https://teteumgbh.github.io/finsec-sentinel/) or open `index.html` locally in any modern browser.
2. Click **⚡ Run 10-Scenario Benchmark** to watch the circuit breaker and DLP shield process the full incident batch, or load any scenario and click **🛡️ Inspect via FinSec Sentinel**.

## 📄 License
MIT License — Created by Matheus Filipe Ferreira Lima (`@teteumgbh`).

## v1.2 — Task-to-Tool Reachability + Live Audit Trail (Nov 9, 2026)

Ported from The Safe Latch v1.2, same Gatekeeper pattern: *every claim is checked
by code, not by another model.* A new deterministic layer **L2.5** —
`verifyTaskToolReachability(taskScope, agentTrace)` (module by Jim, integrated
and measured by Muse) — runs on the forward path after the DLP shield and the
loop breaker, and proves that every AWS tool call in the agent trace is
reachable from the original task scope:

- **PROVEN_REACHABLE** — tool family authorized by the task AND infrastructure
  destination (AWS region, environment prod/staging/dev, host, S3 bucket)
  inside the task's scope.
- **BLOCKED_UNREACHABLE → RED_UNREACHABLE** — a tool call whose family has no
  root in the task scope (e.g. the task says "analyze the bill" and the agent
  tries `iam:AttachRolePolicy` with `AdministratorAccess`). The v1.0 DLP does
  not catch this — it carries no key, token or PEM — the reachability graph does.
- **ESCALATED_TO_STAGE_2** — family authorized but the trace binds a concrete
  environment/host the task never named (task: "provision the homologation
  instance"; trace: `ec2:RunInstances` in **prod**). Flagged in the audit
  record and forwarded for strict Stage 2 FinOps policy inspection.

Destination scope compares only real infrastructure destinations — generic
business nouns in the task text are not destinations (the Muse correction
validated first in The Safe Latch v1.2).

Every inspection also emits an **audit record** (stages, citations with exact
character spans, FNV-1a commitment hash) rendered in the new **Live Audit
Trail** panel — exportable as `audit-ledger.json`, Gatekeeper-ledger style.
One integrator correction, disclosed: Jim's `SECRET_EXTRACTION` pattern shipped
with a stray space after the pipe (`aws_secret_access_key| printenv`) that could
never match; the space was removed, everything else is his module byte-for-byte.
(The audit renderer reused from The Safe Latch gained badge colors for the
Sentinel statuses.)

### Executed benchmark (Node harness, exact engine bytes from `index.html`, 300 iterations/scenario)

| Check | Result |
|---|---|
| Original 7 scenarios — regression vs v1.0 | **IDENTICAL**: 1,069 → 181 chars (83.1%), 123,681 → 546 billable tokens (99.6%), US$0.4172 saved per batch at Gemini Flash rates (US$1.6684 at the Nov 7 Bedrock baseline — Appendix A) |
| S8 In-scope FinOps query (`ce:GetCostAndUsage`, us-east-1) | **PROVEN_REACHABLE 300/300** |
| S9 Privilege escalation outside task scope | **BLOCKED_UNREACHABLE 300/300** (final `RED_UNREACHABLE`) |
| S10 Ambiguous environment (prod) | **ESCALATED_TO_STAGE_2 300/300** |
| All 10 scenarios | 1,373 → 353 chars (74.3%); 124,508 → 1,090 tokens (99.1%); US$0.4182 saved per batch at Gemini Flash rates (US$1.6722 at the Bedrock baseline — Appendix A) |
| Latency | L2.5 step median ~0.009–0.012 ms; full pipeline medians 0.0007–0.0133 ms |

Reproduce: `node benchmark-v1.2.mjs` (writes `benchmark-raw-log.json` and a
single-pass `audit-ledger.json`).

## Appendix A — AWS MSP / Bedrock Baseline (Nov 7, 2026)

The original benchmark, as published when FinSec Sentinel was built for the AWS MSP AI Hackathon, priced on Amazon Bedrock Claude 3.5 Sonnet (`$0.003 / 1K input tokens`, `$0.015 / 1K output tokens`). Preserved verbatim — history is recorded, not erased. (The original `benchmark-raw-log.json` is preserved in this repository's git history.)

| Scenario | Sentinel Status | Input Payload (chars) | Sent to Cloud (chars) | Unchecked Billable Tokens | Actual Billed Tokens | USD Saved / Incident | Median Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Clean Ticket Triage (1 step)** | `GREEN_FORWARDED` | 162 | 118 | 291 | 280 | $0.00003 | 0.0059 ms |
| **2. AWS IAM Key Leak (1 step)** | `RED_DLP_BLOCK` | 171 | 0 | 293 | 0 | $0.00388 | 0.0014 ms |
| **3. Agent Ping-Pong Loop (250 steps)** | `AMBER_LOOP_KILLED` | 132 | 0 | 70,750 | 0 | $0.96225 | 0.0019 ms |
| **4. Bearer JWT Leak (1 step)** | `RED_DLP_BLOCK` | 169 | 0 | 293 | 0 | $0.00388 | 0.0020 ms |
| **5. Recursive Retry Storm (180 steps)** | `AMBER_LOOP_KILLED` | 143 | 0 | 51,480 | 0 | $0.69444 | 0.0020 ms |
| **6. Verbose CloudWatch Dump (1 step)** | `GREEN_FORWARDED` | 163 | 63 | 291 | 266 | $0.00007 | 0.0032 ms |
| **7. Private RSA Key in State (1 step)** | `RED_DLP_BLOCK` | 129 | 0 | 283 | 0 | $0.00385 | 0.0010 ms |

Baseline totals: `1,069 -> 181 chars` (83.1%); `123,681 -> 546 tokens` (99.6%); **$1.6684 saved per 7-incident batch** ($1,668.40 per 1,000 cycles); DLP block 3/3; loop containment 2/2.

## Appendix B — #BuildHybridAI / Firebase AI Logic Handoff (Nov 9, 2026)

Migration record. On Nov 9, 2026 the AWS MSP AI Hackathon's eligibility rules (Official Rules §3: entrants must be employed by / authorized to act for an AWS Partner Network organization) closed that competition to this solo entrant, and the team re-aimed FinSec Sentinel at the **#BuildHybridAI Hackathon** alongside The Safe Latch.

What changed — and only this:
- The engine's two pricing constants (`INPUT_RATE_PER_1K`, `OUTPUT_RATE_PER_1K`) were swapped from the Bedrock baseline to **Gemini 3.8 Flash** rates (`$0.00075 / $0.00375` per 1K tokens), and the panel's framing (badge, subtitle, telemetry labels, migration banner) was updated. No logic, scenario, threshold or verdict changed.
- The harness regression check was re-based to the Gemini USD figure, with the Bedrock figure kept in its comment.

Identity proof (executed, `node benchmark-v1.2.mjs`, 300 iterations/scenario): **all 10 scenarios PASS 300/300**; character and token figures are **identical** to the Bedrock-priced runs — original 7: `1,069 -> 181 chars`, `123,681 -> 546 tokens`; all 10: `1,373 -> 353 chars`, `124,508 -> 1,090 tokens`. Only the USD column moved, by exactly ×0.25 (both Gemini Flash rates are one quarter of the Bedrock baseline rates): **$0.4172 saved per 7-incident batch** and **$0.4182 across all 10 scenarios**.
