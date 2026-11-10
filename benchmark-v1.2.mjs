// FinSec Sentinel v1.2 benchmark harness — extracts the EXACT pure engine bytes
// embedded in index.html (between the PURE_ENGINE markers) and runs every
// scenario 300 times, asserting zero regression on the 7 original v1.0
// scenarios and Jim's expected reachability verdicts on S8/S9/S10.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const begin = html.indexOf('/*__PURE_ENGINE_BEGIN__*/');
const end = html.indexOf('/*__PURE_ENGINE_END__*/');
if (begin < 0 || end < 0 || end <= begin) throw new Error('pure engine markers not found');
const engineSrc = html.slice(begin, end);

const factory = new Function(engineSrc + `
  return { scenarios, inspectAgentTraffic, verifyTaskToolReachability, LIVE_AUDIT_LEDGER };
`);
const { scenarios, inspectAgentTraffic, LIVE_AUDIT_LEDGER } = factory();

const ITER = 300;
const EXPECTED_STATUS = [
  'GREEN_FORWARDED', 'RED_DLP_BLOCK', 'AMBER_LOOP_KILLED', 'RED_DLP_BLOCK',
  'AMBER_LOOP_KILLED', 'GREEN_FORWARDED', 'RED_DLP_BLOCK',
  'GREEN_FORWARDED', 'RED_UNREACHABLE', 'GREEN_FORWARDED'
];

const results = [];
let allPass = true;

for (let i = 0; i < scenarios.length; i++) {
  const sc = scenarios[i];
  const statusCounts = {};
  const reachCounts = {};
  const lat = [];
  let reachStepLat = [];
  for (let k = 0; k < ITER; k++) {
    const r = inspectAgentTraffic(sc);
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    const rv = r.reachVerdict || 'N/A';
    reachCounts[rv] = (reachCounts[rv] || 0) + 1;
    lat.push(r.latencyMs);
    const st = r.auditRecord?.stages?.find(s => s.layer.includes('REACHABILITY'));
    if (st) reachStepLat.push(st.ms);
  }
  lat.sort((a, b) => a - b);
  reachStepLat.sort((a, b) => a - b);
  const median = a => a.length ? a[Math.floor(a.length / 2)] : null;

  const single = inspectAgentTraffic(sc);
  let pass = statusCounts[EXPECTED_STATUS[i]] === ITER;
  if (sc.expectedReach) {
    const want = sc.expectedReach === 'BLOCKED_UNREACHABLE' ? 'BLOCKED_UNREACHABLE' : sc.expectedReach;
    if (reachCounts[want] !== ITER) pass = false;
  }
  if (!pass) allPass = false;

  results.push({
    scenario: sc.name,
    expectedStatus: EXPECTED_STATUS[i],
    statusCounts,
    reachCounts,
    pass,
    charsIn: single.rawChars,
    charsSent: single.sentChars,
    rawBillableTokens: single.rawBillableTokens,
    sentBillableTokens: single.sentBillableTokens,
    savedUsd: Number(single.savedUsd.toFixed(4)),
    medianLatencyMs: median(lat),
    medianReachabilityStepMs: median(reachStepLat)
  });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${sc.name}  status=${JSON.stringify(statusCounts)} reach=${JSON.stringify(reachCounts)} chars ${single.rawChars}->${single.sentChars} tokens ${single.rawBillableTokens}->${single.sentBillableTokens} saved $${single.savedUsd.toFixed(4)} median ${median(lat)} ms reachStep ${median(reachStepLat)} ms`);
}

function totals(rows) {
  const t = rows.reduce((a, r) => ({
    charsIn: a.charsIn + r.charsIn,
    charsSent: a.charsSent + r.charsSent,
    rawBillableTokens: a.rawBillableTokens + r.rawBillableTokens,
    sentBillableTokens: a.sentBillableTokens + r.sentBillableTokens,
    savedUsd: a.savedUsd + r.savedUsd
  }), { charsIn: 0, charsSent: 0, rawBillableTokens: 0, sentBillableTokens: 0, savedUsd: 0 });
  t.savedUsd = Number(t.savedUsd.toFixed(4));
  t.charReductionPct = Number(((1 - t.charsSent / t.charsIn) * 100).toFixed(1));
  t.tokenReductionPct = Number(((1 - t.sentBillableTokens / t.rawBillableTokens) * 100).toFixed(1));
  return t;
}
const t7 = totals(results.slice(0, 7));
const t10 = totals(results);
console.log('\nOriginal 7 totals:', JSON.stringify(t7));
console.log('All 10 totals:   ', JSON.stringify(t10));

// Regression gate against the executed v1.0 benchmark
// Regression identity is defined on chars + tokens (price-independent). The USD
// baseline moved on Nov 9, 2026 with the #BuildHybridAI migration: the engine's
// price constants were swapped from AWS Bedrock Claude 3.5 Sonnet
// ($0.003/$0.015 per 1K) to Gemini 3.8 Flash ($0.00075/$0.00375 per 1K), so the
// original-7 saved figure moved $1.6684 -> $0.4172 (exactly x0.25: both rates
// are one quarter of the Bedrock baseline). See README Appendix A/B.
const regressionOk = t7.charsIn === 1069 && t7.charsSent === 181 && t7.rawBillableTokens === 123681 && t7.sentBillableTokens === 546 && Math.abs(t7.savedUsd - 0.4172) < 0.001;
console.log('v1.0 regression check (1069->181 chars, 123681->546 tokens, $0.4172 Gemini-priced; was $1.6684 Bedrock):', regressionOk ? 'IDENTICAL' : 'DIFFERS');
console.log('ALL SCENARIOS PASS:', allPass && regressionOk);

// Fresh single pass for the audit ledger artifact
LIVE_AUDIT_LEDGER.length = 0;
for (const sc of scenarios) inspectAgentTraffic(sc);
writeFileSync(new URL('./audit-ledger.json', import.meta.url), JSON.stringify({
  schema: 'finsec-sentinel-audit-ledger-v1.2',
  generatedAt: new Date().toISOString(),
  entriesCount: LIVE_AUDIT_LEDGER.length,
  entries: LIVE_AUDIT_LEDGER
}, null, 2));

writeFileSync(new URL('./benchmark-raw-log.json', import.meta.url), JSON.stringify({
  project: 'FinSec Sentinel',
  version: 'v1.2-task-tool-reachability',
  generatedAt: new Date().toISOString(),
  iterationsPerScenario: ITER,
  engine: 'exact bytes extracted from index.html pure-engine markers',
  allPass: allPass && regressionOk,
  v10RegressionIdentical: regressionOk,
  scenarios: results,
  totalsOriginal7: t7,
  totalsAll10: t10
}, null, 2));
console.log('Wrote audit-ledger.json and benchmark-raw-log.json');
