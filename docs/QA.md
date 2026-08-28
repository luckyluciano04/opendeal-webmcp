# OpenDeal QA Gate

## Status

- Deterministic domain invariants: PASS
- WebMCP lifecycle simulation: PASS
- Untrusted buyer-origin rejection: PASS
- Explicit buyer-origin allowlist acceptance: PASS
- Purchase capability absent before approval: PASS
- Purchase capability registered after approval: PASS
- One-time purchase capability removed after order: PASS
- Order-status capability registered after order: PASS
- WebMCP `executeTool()` argument serialization contract: PASS after correction
- Production Netlify deployment: PASS
- Real Chrome WebMCP validation: PASS
- ChatGPT in-app browser WebMCP validation: PENDING
- Ten consecutive clean end-to-end judge-path runs: PENDING
- Demo video: PENDING
- Public repository accessibility: PENDING

## Real browser evidence — 2026-08-27

Validated on the production Netlify deployment in Google Chrome with WebMCP testing enabled. The application displayed `WebMCP: ACTIVE`, and the proof overlay read the browser's actual `document.modelContext` tool surface rather than fallback state.

Observed lifecycle history:

- LOADING: purchase capability ABSENT; order-status capability ABSENT
- PRE-APPROVAL: 15 tools; `bravo.create_purchase_order` ABSENT; `bravo.get_order_status` ABSENT
- APPROVED: 16 tools; `bravo.create_purchase_order` PRESENT; `bravo.get_order_status` ABSENT
- ORDERED: 16 tools; `bravo.create_purchase_order` ABSENT; `bravo.get_order_status` PRESENT

The final browser state also showed the mission in ORDERED state and retained WebMCP ACTIVE. This verifies that human approval changes the actual capability surface, the purchase capability is one-time, and the post-order observation capability replaces it after execution.

## Spec compatibility correction — 2026-08-26

During a fresh compatibility audit against Chrome's WebMCP Imperative API documentation (last updated 2026-08-20) and the WebMCP Community Group draft (2026-08-19), we identified that `document.modelContext.executeTool()` requires tool input arguments as a valid JSON string.

The initial test double accepted a JavaScript object directly, masking that browser-level incompatibility. Production code was corrected to call `JSON.stringify(input ?? {})`, and the lifecycle test double now rejects non-string execution input. The test exercises the production `executeTool` wrapper so this contract cannot silently regress.

## Release gates

Do not submit until all of the following are true:

1. Netlify production URL returns all buyer and supplier routes successfully. PASS
2. WebMCP tool discovery works in a supported client. PASS — Chrome
3. The full mission executes through real WebMCP tool calls. PASS — Chrome
4. Purchase capability is verified absent before approval, present after approval, then removed after execution while order-status appears. PASS — Chrome
5. Ten consecutive clean end-to-end judge-path runs pass. PENDING
6. Demo video is recorded from the verified production build. PENDING
7. Repository is made public and independently accessible without authentication. PENDING
