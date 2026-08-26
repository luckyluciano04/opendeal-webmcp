# OpenDeal Execution Plan — Scope Frozen

## North-star demo

One human buyer delegates bounded procurement authority to an agent. The agent discovers and negotiates with three supplier web contexts through WebMCP, rejects the cheapest offer because it violates a hard delivery constraint, stops at a human financial-approval gate, then executes one authorized purchase. The actual supplier capability surface changes with authority.

## Scope lock

### Must ship
- Buyer mission and deterministic three-supplier market
- Real WebMCP feature detection via `document.modelContext`
- Supplier tool registration + discovery + execution
- Human-gated dynamic `create_purchase_order` registration
- One-time purchase capability removal + `get_order_status` replacement
- Real tool inspector
- Deterministic rule-based negotiation and hard-constraint ranking
- Audit ledger
- Normal-browser fallback that never claims WebMCP is active
- Public live URL, public repository, recognized open-source license, <3 minute video

### Explicitly out of scope
- Real payments
- User authentication
- Persistent database
- LLM API calls
- General-purpose marketplace
- Seller onboarding
- Arbitrary product categories
- Real supplier APIs
- Multi-user collaboration
- Mobile-native app
- Analytics or growth tooling

No out-of-scope item is added unless a must-ship item is complete, verified, and the addition directly raises a judging criterion without adding demo risk.

## Gates

| Gate | Exit condition | Status |
|---|---|---|
| G0 — Deterministic core | Domain invariants and WebMCP lifecycle unit tests pass | COMPLETE |
| G1 — Provenance | Dedicated private GitHub repo exists and challenge-period commits are recorded | COMPLETE |
| G2 — Private deployment | Buyer + supplier routes available at a non-publicized HTTPS URL | NEXT |
| G3 — Real WebMCP | Tested in a WebMCP-capable browser; inspector sees real tools; dynamic purchase lifecycle verified | PENDING |
| G4 — Cross-origin composition | Separate supplier origins only if G3 is stable; explicit buyer allowlist + `exposedTo` verified | PENDING |
| G5 — Judge hardening | End-to-end demo passes 10 consecutive runs with zero state or tool-lifecycle failures | PENDING |
| G6 — Publication | Public repo + license + live URL + README + architecture notes frozen | PENDING |
| G7 — Submission | Public <3 minute video and Devpost fields submitted with buffer | PENDING |

## Daily roadmap

### Aug 26 — Foundation and private deployment
- Security hardening and provenance commit.
- Dedicated private GitHub repository `opendeal-webmcp`.
- Transfer challenge code without modifying any older project.
- Deploy privately/unlisted.
- Verify normal-browser fallback end-to-end.

### Aug 27 — WebMCP truth test
- Test in ChatGPT in-app browser and/or supported Chrome test environment.
- Verify initial supplier tools are discoverable.
- Prove `bravo.create_purchase_order` is absent before approval.
- Approve; prove the purchase tool appears.
- Execute; prove purchase tool disappears and order-status appears.
- Capture evidence screenshots/recording for internal QA.

### Aug 28 — Cross-origin composition
- Only after G3 passes.
- Move Alpha, Bravo, Charlie to distinct origins/subdomains or independent deploys.
- Pin buyer origin in `allowedBuyerOrigins` on each supplier.
- Verify iframe Permissions Policy configuration and `exposedTo` behavior.
- If cross-origin introduces instability that cannot be eliminated quickly, revert to the stable architecture rather than jeopardize submission reliability.

### Aug 29 — UX + security + judge comprehension
- Tighten live-market rationale and capability state visualization.
- Add visible before/after tool-diff moment around human approval.
- Run input-boundary and authorization-negative tests.
- Verify no supplier can create a PO without the exact approved amount/token.

### Aug 30 — Feature freeze
- No new product features after this point.
- Run ten consecutive complete demos.
- Repair only P0/P1 defects or issues that materially affect scoring.

### Aug 31 — Submission assets
- Confirm recognized open-source license.
- Make repository public only when ready for judging/publication.
- Finalize README, architecture diagram, setup instructions, and explicit WebMCP explanation.

### Sep 1 — Video
- Record multiple takes of the <3 minute demo.
- Select the clearest one, not the flashiest one.
- Confirm text and tool names remain readable at 1080p.

### Sep 2 — Submission dry run
- Fill every Devpost field.
- Test live URL from a clean browser session.
- Test public repo without authenticated GitHub access.
- Test video privacy/public settings.
- Final regression; freeze commit SHA.

### Sep 3 — Submit with buffer
- Treat 1:00 p.m. PDT as the hard deadline unless the official rules are amended.
- Target final submission no later than 10:30 a.m. PDT.
- No code changes after final submission unless a critical availability defect is discovered and the rules permit updating.

## Acceptance tests

1. A normal browser explicitly shows `WebMCP: FALLBACK DEMO`.
2. A WebMCP-capable browser shows `WebMCP: ACTIVE` only when `document.modelContext` exists.
3. Inspector is populated from real `getTools()` results, not a hard-coded list.
4. Before approval, `bravo.create_purchase_order` is absent.
5. Charlie's negotiated $2,290 offer is rejected because Monday violates Friday.
6. Bravo wins at $2,325.
7. The workflow stops at `AWAITING_APPROVAL` until a human action.
8. Approval scope is exact: $2,325 + `OD-APPROVED-1047`.
9. After order, `create_purchase_order` is absent and `get_order_status` is present.
10. Order summary is OD-1047, Bravo, $2,325, Friday, CONFIRMED, $175 under budget.

## Decision discipline

- Reliability outranks extra features.
- WebMCP behavior must be real when labeled real.
- No claim enters the submission unless reproduced or cited.
- Any protocol/API assumption must be checked against the current spec before final submission.
- If a feature cannot be verified, label it as unverified or remove it.
