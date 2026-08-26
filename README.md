# OpenDeal — WebMCP Challenge 2026

**Agent-native negotiation for the open web.**

OpenDeal demonstrates bounded agent authority across multiple supplier web contexts. A buyer's agent can discover inventory, request quotes, negotiate deterministic pricing, verify delivery, rank offers against hard constraints, and prepare a transaction. Final purchase authority remains explicitly human-gated.

## Signature WebMCP behavior

This is not a confirmation modal pretending to be authorization. The actual capability surface changes:

1. Supplier search / specs / quote / negotiation / delivery tools are registered.
2. `bravo.create_purchase_order` is **absent** before approval.
3. The human approves the exact $2,325 offer.
4. Bravo dynamically registers `bravo.create_purchase_order` with an `AbortController`-scoped registration.
5. After successful execution, that purchase tool is unregistered and `bravo.get_order_status` is registered.

The implementation targets the August 2026 WebMCP draft API: `document.modelContext.registerTool()`, `getTools()`, `executeTool()`, `toolchange`, `exposedTo`, and `AbortController` lifecycle. It intentionally does not use the obsolete `navigator.modelContext` proposal.

## Deterministic scenario

- Mission: 100 ANSI Z89.1 Type II safety helmets
- Budget: $2,500
- Deadline: Friday
- Alpha floor: $2,350, Friday
- Bravo floor: $2,325, Friday
- Charlie floor: $2,290, Monday

Charlie is cheaper but violates the hard delivery constraint, so Bravo is the lowest compliant offer.

## Run locally

No build step or paid service is required.

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

For real WebMCP testing, use ChatGPT's in-app browser or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled. A normal browser runs an explicitly labeled **Demo Orchestrator** fallback and never claims WebMCP is active.

## Architecture

- `/` — buyer command center
- `/supplier/alpha/`, `/supplier/bravo/`, `/supplier/charlie/` — independent iframe-ready supplier contexts
- `js/webmcp.js` — current WebMCP registration, cross-origin exposure configuration, tool discovery/execution, dynamic purchase lifecycle
- `js/domain.js` — deterministic mission, supplier policies, negotiation and ranking
- `js/app.js` — visible state machine, audit ledger, human authorization gate, real-tool inspector

Deployment configuration lives in `js/config.js`. The buyer can point `OPENDEAL_CONFIG.supplierUrls` at distinct deployed origins. Cross-origin supplier URLs receive the buyer origin as a hint, but the supplier will trust that hint **only** when it is explicitly pinned in `OPENDEAL_CONFIG.allowedBuyerOrigins`. Supplier tools then use WebMCP `exposedTo`, while the buyer queries those origins through `getTools({ fromOrigins })`. Iframes declare `allow="tools"`. No wildcard buyer allowlist is permitted.

## Security posture

- strict bounded input validation inside WebMCP tools
- no secrets, payments, auth, remote code execution or third-party API dependency
- concise tool descriptions without embedded instructions
- explicit financial authorization scope
- one-time purchase capability
- escaped/sanitized display text
- deterministic outputs for reproducible judging
- cross-origin buyer hints are allowlisted rather than trusted directly

## Tests

```bash
npm test
```

## Execution documents

- `docs/EXECUTION.md` — scope lock, gates, daily roadmap, acceptance tests
- `docs/THREAT_MODEL.md` — trust boundaries, controls, known demo limitation
- `docs/DEMO_SCRIPT.md` — sub-three-minute judging narrative

## Publication checklist

Before submission: make this repository public, include a recognized open-source license, deploy the live app, test in a WebMCP-capable browser, record the <3 minute demo, and freeze the submitted repo/site during judging.
