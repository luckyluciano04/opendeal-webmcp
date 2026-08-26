# OpenDeal Threat Model

## Security objective

Demonstrate bounded browser-agent authority without allowing a buyer-origin hint, malformed tool input, or replayed approval to expand financial authority.

## Trust boundaries

1. **Buyer UI** — controls mission state and explicit human approval.
2. **Supplier iframe/origin** — owns supplier policy and WebMCP tool registrations.
3. **Browser WebMCP implementation** — discovers and executes registered tools.
4. **Cross-window messaging** — carries lifecycle signals and observability events.
5. **Agent** — may invoke only the capabilities the browser exposes; it is not trusted to manufacture approval.

## Controls implemented

- Strict numeric/string bounds on tool inputs.
- `additionalProperties: false` in schemas.
- Exact purchase amount and approval token checks.
- Purchase tool absent until explicit approval.
- One-time purchase registration scoped to `AbortController`.
- Purchase registration removed after order; read-only order-status registration replaces it.
- UI escaping for tool-returned text.
- No secrets, credentials, remote execution, payment processor, or persistence.
- `postMessage` events are origin-checked.
- A cross-origin `buyerOrigin` query parameter is **not trusted by itself**: a supplier accepts it only when the origin is explicitly present in `window.OPENDEAL_CONFIG.allowedBuyerOrigins`.

## Known demo limitation

The approval token is deterministic because the challenge demo is intentionally stateless and reproducible. A production system would replace it with a short-lived, server-issued, single-use authorization artifact bound to buyer identity, supplier, amount, line items, expiry, and transaction nonce.

## Cross-origin deployment rule

Never deploy a supplier with an open/wildcard buyer allowlist. Configure exactly the intended buyer origin on each supplier deployment. If cross-origin behavior cannot be verified in the target WebMCP browser, do not claim it in the final demonstration.
