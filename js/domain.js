export const mission = Object.freeze({
  sku: 'HLM-T2-ANSI',
  product: 'ANSI Z89.1 Type II safety helmets',
  quantity: 100,
  budget: 2500,
  deadline: 'Friday',
  substitutionsAllowed: false,
  humanApprovalRequired: true,
});

export const suppliers = Object.freeze({
  alpha: Object.freeze({ id: 'alpha', name: 'Alpha Industrial', initialTotal: 2470, floorTotal: 2350, deliveryDay: 'Friday', compliant: true, inventory: 620, accent: 'A' }),
  bravo: Object.freeze({ id: 'bravo', name: 'Bravo Safety Supply', initialTotal: 2440, floorTotal: 2325, deliveryDay: 'Friday', compliant: true, inventory: 410, accent: 'B' }),
  charlie: Object.freeze({ id: 'charlie', name: 'Charlie Works', initialTotal: 2390, floorTotal: 2290, deliveryDay: 'Monday', compliant: false, inventory: 900, accent: 'C' }),
});

export const supplierIds = Object.freeze(['alpha', 'bravo', 'charlie']);
export const desiredOffers = Object.freeze({ alpha: 2300, bravo: 2250, charlie: 2200 });

export function negotiate(policy, desiredTotal) {
  if (!Number.isFinite(desiredTotal) || desiredTotal <= 0) return { status: 'rejected', requestedTotal: desiredTotal, finalTotal: policy.initialTotal, reason: 'Invalid requested total.' };
  if (desiredTotal >= policy.initialTotal) return { status: 'accepted', requestedTotal: desiredTotal, finalTotal: policy.initialTotal, reason: 'Existing quote already meets or beats requested total.' };
  if (desiredTotal >= policy.floorTotal) return { status: 'accepted', requestedTotal: desiredTotal, finalTotal: desiredTotal, reason: 'Requested total is within supplier authority.' };
  return { status: 'countered', requestedTotal: desiredTotal, finalTotal: policy.floorTotal, reason: `Supplier counters at its authorized floor of $${policy.floorTotal}.` };
}

export function invokePolicy(supplierId, action, input = {}) {
  const p = suppliers[supplierId];
  if (!p) throw new Error('Unknown supplier.');
  switch (action) {
    case 'search_inventory': return { supplierId, sku: input.sku, requested: input.quantity, available: p.inventory, inStock: p.inventory >= Number(input.quantity), exactMatch: input.sku === mission.sku };
    case 'get_product_specs': return { supplierId, sku: input.sku, standard: 'ANSI Z89.1', type: 'Type II', substitutions: false };
    case 'request_quote': return { supplierId, total: p.initialTotal, currency: 'USD', deliveryDay: p.deliveryDay, validForMinutes: 15 };
    case 'counter_offer': return { supplierId, ...negotiate(p, Number(input.desiredTotal)) };
    case 'check_delivery': return { supplierId, requestedDeadline: input.deadline, deliveryDay: p.deliveryDay, compliant: p.compliant && String(input.deadline).toLowerCase() === 'friday' };
    default: throw new Error(`Unknown policy action: ${action}`);
  }
}

export function rankOffers(rows) {
  const eligible = Object.values(rows).filter((row) => row.eligible && Number.isFinite(row.negotiated));
  eligible.sort((a, b) => a.negotiated - b.negotiated);
  return eligible[0]?.supplierId ?? null;
}
