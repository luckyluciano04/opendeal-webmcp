# OpenDeal — <3 Minute Judge Demo Script

## 0:00–0:15 — Thesis

“Websites are built for people to click. OpenDeal shows what the open web looks like when independent websites can expose bounded, structured capabilities directly to a user's agent.”

## 0:15–0:35 — Mission

Show the Agent Contract:
- 100 ANSI Z89.1 Type II helmets
- Friday delivery
- $2,500 maximum
- no substitutions
- final purchase requires human approval

Show `WebMCP: ACTIVE` and the real inspector.

## 0:35–1:05 — Discover + quote

Run the agent mission.

The agent searches all three suppliers, requests quotes, and checks delivery. Keep the inspector and audit ledger visible enough to establish that these are WebMCP tool calls.

## 1:05–1:35 — Negotiate + reason

Show negotiated results:
- Alpha: $2,350 / Friday
- Bravo: $2,325 / Friday
- Charlie: $2,290 / Monday

State: “Charlie is cheaper, but price cannot override the buyer's hard Friday constraint. Bravo is the lowest compliant offer.”

## 1:35–1:55 — Authority boundary

The state reaches `AWAITING APPROVAL` and stops.

Refresh inspector and point out that `bravo.create_purchase_order` does not exist.

State: “The UI isn't merely asking for confirmation. The financial capability itself is absent.”

## 1:55–2:20 — Dynamic capability

Click **Approve $2,325**.

Show the inspector/toolchange moment: `bravo.create_purchase_order` appears only after approval.

Execute the purchase. Show OD-1047 confirmed.

Refresh inspector: purchase disappears; `bravo.get_order_status` replaces it.

## 2:20–2:45 — Why this matters

Show the audit ledger and Agent Contract.

“OpenDeal demonstrates a capability-security model for agent commerce: independent sites expose structured tools, policy constrains negotiation, and human authority changes what the agent can actually do.”

## 2:45–2:58 — Close

“The future open web isn't one centralized AI marketplace. It's millions of independent websites safely becoming agent-operable. OpenDeal is the negotiation and authority pattern for that web.”
