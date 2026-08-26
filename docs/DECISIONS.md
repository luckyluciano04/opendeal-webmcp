# OpenDeal Architecture Decisions

## ADR-001 — Zero-dependency static ESM for the challenge build

**Decision:** Use browser-native JavaScript modules, HTML, and CSS rather than requiring a framework build pipeline.

**Reason:** The challenge demo needs a small, auditable, deterministic client application. A package-install/build-chain failure adds risk without increasing WebMCP leverage or judge comprehension. The current implementation therefore runs with a static HTTP server and has no runtime third-party dependency.

**Tradeoff:** Less component abstraction than a React implementation. Accepted because the vertical slice is intentionally small and frozen.

## ADR-002 — Rules-based negotiation, never random or LLM-dependent

**Decision:** Supplier floors, quotes, delivery constraints, and counteroffers are deterministic domain policy.

**Reason:** A judging demo must reproduce the same economic outcome every run, and the technical point is WebMCP capability composition—not model stochasticity.

## ADR-003 — Human approval changes the actual capability surface

**Decision:** Do not register `create_purchase_order` until explicit human approval. Remove it after successful execution and replace it with a read-only order-status capability.

**Reason:** This is the core differentiation: authorization is expressed as browser-agent capability availability, not only as UI state.

## ADR-004 — Cross-origin hints are untrusted unless pinned

**Decision:** `buyerOrigin` may be passed as a routing hint, but supplier code accepts a cross-origin buyer only when it is present in the deployment's explicit `allowedBuyerOrigins` configuration.

**Reason:** A query parameter must not be allowed to grant tool exposure or approval-message trust.

## ADR-005 — Prove WebMCP first; add cross-origin composition second

**Decision:** Keep same-origin supplier routes as the baseline. Split origins only after the complete dynamic WebMCP lifecycle passes in the target browser.

**Reason:** Cross-origin composition raises ambition, but a broken live demo scores worse than a narrower, fully verified implementation. It is a gated enhancement, not a dependency of the core submission.
