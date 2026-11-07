# 🛡️ FinSec Sentinel
> **Real-Time FinOps Circuit Breaker & DLP Credential Shield for Multi-Agent Cloud Workloads.**

Built for the **AWS MSP AI Hackathon 2026**, **FinSec Sentinel** is a lightweight, deterministic governance proxy that sits between autonomous IT/MSP agents and cloud foundation models (such as **Amazon Bedrock**). It solves the two most expensive production failures in enterprise agent deployments: **runaway agent loops that explode cloud bills** and **accidental credential exfiltration in debugging prompts**.

🔗 **Live Interactive Console:** [https://teteumgbh.github.io/finsec-sentinel/](https://teteumgbh.github.io/finsec-sentinel/)

## 🚨 The Enterprise MSP Problem
Managed Service Providers (MSPs) deploying autonomous Tier-1, SecOps, and DevOps agents face two critical operational risks:
1. **FinOps Runaway Loops:** Two agents stuck in a confirmation ping-pong or a retry storm against a failing RDS/API endpoint can burn hundreds of thousands of tokens in minutes.
2. **SecOps Credential Leakage:** Autonomous debugging agents routinely scrape stacktraces, `.env` dumps, and Terraform states containing live `AKIA...` IAM keys, Bearer JWTs, or PEM private keys and forward them to external LLM contexts.

## 🧠 3-Layer Deterministic Governance Architecture
1. **Layer 1 — SecOps DLP Credential Shield:** Scans outbound agent payloads in sub-millisecond time to block AWS IAM keys, Bearer tokens, and RSA/PEM private keys before they leave the VPC/client boundary.
2. **Layer 2 — FinOps Loop Circuit Breaker:** Detects repetitive semantic step signatures (`>=3` identical retry/confirmation cycles) and trips the circuit breaker before runaway horizons (180–250 steps) drain cloud budgets.
3. **Layer 3 — CloudWatch & Log Boilerplate Pruner:** Strips redundant timestamps, debug trace IDs, and `HealthCheck OK` noise from legitimate operational prompts before billing tokens on AWS Bedrock.

## 📊 Empirical 7-Scenario MSP Benchmark (300 Iterations / Scenario)
The production function (`inspectAgentTraffic`) was extracted from `index.html` and executed across **300 iterations per scenario** (2,100 total executions), using AWS Bedrock Claude 3.5 Sonnet pricing (`$0.003 / 1K input tokens`, `$0.015 / 1K output tokens`, deterministic estimator `1 token = 4 chars`, `250 output tokens/step`). Every figure below is the executed output; the raw log is committed as `benchmark-raw-log.json`.

| Scenario | Sentinel Status | Input Payload (chars) | Sent to Cloud (chars) | Unchecked Billable Tokens | Actual Billed Tokens | USD Saved / Incident | Median Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Clean Ticket Triage (1 step)** | `GREEN_FORWARDED` | 162 | 118 | 291 | 280 | $0.00003 | 0.0059 ms |
| **2. AWS IAM Key Leak (1 step)** | `RED_DLP_BLOCK` | 171 | 0 | 293 | 0 | $0.00388 | 0.0014 ms |
| **3. Agent Ping-Pong Loop (250 steps)** | `AMBER_LOOP_KILLED` | 132 | 0 | 70,750 | 0 | $0.96225 | 0.0019 ms |
| **4. Bearer JWT Leak (1 step)** | `RED_DLP_BLOCK` | 169 | 0 | 293 | 0 | $0.00388 | 0.0020 ms |
| **5. Recursive Retry Storm (180 steps)** | `AMBER_LOOP_KILLED` | 143 | 0 | 51,480 | 0 | $0.69444 | 0.0020 ms |
| **6. Verbose CloudWatch Dump (1 step)** | `GREEN_FORWARDED` | 163 | 63 | 291 | 266 | $0.00007 | 0.0032 ms |
| **7. Private RSA Key in State (1 step)** | `RED_DLP_BLOCK` | 129 | 0 | 283 | 0 | $0.00385 | 0.0010 ms |

### Measured Benchmark Totals
- **Single-Pass Input Character Reduction:** `1,069 chars evaluated` -> `181 chars sent` (**83.1% measured input character reduction**).
- **Total Billable Token Reduction (with Loop Horizons):** `123,681 unchecked tokens` -> `546 billed tokens` (**99.6% token reduction** across the incident batch).
- **Direct Cloud Cost Saved per 7-Incident Batch:** **$1.6684 USD** (**$1,668.40 USD saved** per 1,000 operational incident cycles).
- **Secret / Credential Leak Block Rate:** `3 / 3` (100% of tested IAM, JWT, and RSA secrets intercepted).
- **Runaway Loop Containment:** `2 / 2` (100% of multi-step loops halted).
- **Governance Filter Median Latency:** `0.0010 ms – 0.0059 ms` per scenario.

## 🔬 Methodology & Engineering Caveats
1. **Pricing & Token Model:** Cost savings are computed deterministically from character counts (`Math.ceil(chars / 4)`) and explicit loop horizon multipliers (`250` and `180` steps) using standard public Amazon Bedrock Claude 3.5 Sonnet rates. The 250 output tokens/step is a stated modeling assumption of the benchmark, applied identically to the protected and unprotected arms.
2. **Scope of DLP Detection:** Regex signatures validate deterministic interception of structured secrets (`AKIA...`, `eyJ...`, PEM headers). Arbitrary unstructured PII requires pairing with Amazon Macie or Bedrock Guardrails in production.
3. **Verification Note:** During design review, hand-counted character totals for the scenario strings differed slightly from the shipped strings (6 of 7 strings, by 1–13 chars). All figures published here come from executing the shipped code itself — never from hand counts — and the raw execution log is committed to this repository (`benchmark-raw-log.json`) for audit.
4. **Execution Environment:** Latency medians were measured via automated Node.js extraction (300 iterations/scenario). Live browser telemetry on target MSP hardware is scheduled for Phase 2 verification.

## 🚀 Quick Start (Zero Dependencies)
1. Open the live deployment at [https://teteumgbh.github.io/finsec-sentinel/](https://teteumgbh.github.io/finsec-sentinel/) or open `index.html` locally in any modern browser.
2. Click **⚡ Run 7-Scenario MSP Benchmark** to watch the circuit breaker and DLP shield process the full incident batch, or load any scenario and click **🛡️ Inspect via FinSec Sentinel**.

## 📄 License
MIT License — Created by Matheus Filipe Ferreira Lima (`@teteumgbh`).
