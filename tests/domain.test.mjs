import assert from 'node:assert/strict';
import { suppliers, negotiate, rankOffers } from '../js/domain.js';
assert.equal(negotiate(suppliers.alpha,2300).finalTotal,2350);
assert.equal(negotiate(suppliers.bravo,2250).finalTotal,2325);
assert.equal(negotiate(suppliers.charlie,2200).finalTotal,2290);
assert.equal(rankOffers({alpha:{supplierId:'alpha',eligible:true,negotiated:2350},bravo:{supplierId:'bravo',eligible:true,negotiated:2325},charlie:{supplierId:'charlie',eligible:false,negotiated:2290}}),'bravo');
console.log('domain invariants: PASS');
