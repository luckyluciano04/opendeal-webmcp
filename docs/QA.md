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
- Production Netlify deployment: PENDING
- Real Chrome/ChatGPT WebMCP validation: PENDING

## Spec compatibility correction — 2026-08-26

During a fresh compatibility audit against Chrome's WebMCP Imperative API documentation (last updated 2026-08-20) and the WebMCP Community Group draft (2026-08-19), we identified that `document.modelContext.executeTool()` requires tool input arguments as a valid JSON string.

The initial test double accepted a JavaScript object directly, masking that browser-level incompatibility. Production code was corrected to call `JSON.stringify(input ?? {})`, and the lifecycle test double now rejects non-string execution input. The test exercises the production `executeTool` wrapper so this contract cannot silently regress.

## Release gates

Do not submit until all of the following are true:

1. Netlify production URL returns all buyer and supplier routes successfully.
2. WebMCP tool discovery works in a supported client.
3. The full mission executes through real WebMCP tool calls.
4. Purchase capability is verified absent before approval and present only after approval.
5. Ten consecutive clean end-to-end judge-path runs pass.
6. Demo video is recorded from the verified production build.
7. Repository is made public and independently accessible without authentication.
