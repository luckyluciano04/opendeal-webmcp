import assert from 'node:assert/strict';

class FakeModelContext extends EventTarget {
  constructor(){ super(); this.tools = new Map(); }
  async registerTool(tool, options={}) {
    if (this.tools.has(tool.name)) throw new Error(`duplicate ${tool.name}`);
    this.tools.set(tool.name, tool);
    options.signal?.addEventListener('abort', () => {
      this.tools.delete(tool.name);
      this.dispatchEvent(new Event('toolchange'));
    }, { once: true });
    this.dispatchEvent(new Event('toolchange'));
  }
  async getTools(){
    return [...this.tools.values()].map(t => ({
      name:t.name,title:t.title,description:t.description,
      annotations:t.annotations,origin:'https://supplier.test',
      _tool:t
    }));
  }
  async executeTool(registered, input={}) {
    const live = this.tools.get(registered.name);
    if (!live) throw new Error('tool unavailable');
    const result = await live.execute(input, { signal: new AbortController().signal });
    return JSON.stringify(result);
  }
}

const context = new FakeModelContext();
globalThis.document = { modelContext: context };
globalThis.location = { search:'', origin:'https://supplier.test' };
globalThis.window = { parent:null };
globalThis.window.parent = globalThis.window;

const { registerSupplierTools, resolveBuyerOrigin } = await import('../js/webmcp.js');

location.search='?buyerOrigin=https%3A%2F%2Fbuyer.example';
window.OPENDEAL_CONFIG={allowedBuyerOrigins:[]};
assert.equal(resolveBuyerOrigin(),'https://supplier.test','untrusted buyerOrigin hint must be rejected');
window.OPENDEAL_CONFIG={allowedBuyerOrigins:['https://buyer.example']};
assert.equal(resolveBuyerOrigin(),'https://buyer.example','explicitly allowlisted buyer origin should be accepted');
location.search='';
const reg = await registerSupplierTools('bravo');
assert.equal(reg.supported, true);
let names = (await context.getTools()).map(t=>t.name).sort();
assert.equal(names.length, 5);
assert.equal(names.includes('bravo.create_purchase_order'), false);

await reg.approvePurchase(true);
names = (await context.getTools()).map(t=>t.name).sort();
assert.equal(names.length, 6);
assert.equal(names.includes('bravo.create_purchase_order'), true);

const purchase = (await context.getTools()).find(t=>t.name==='bravo.create_purchase_order');
const raw = await context.executeTool(purchase,{approvedTotal:2325,approvalToken:'OD-APPROVED-1047'});
const result = JSON.parse(raw);
assert.equal(result.poId,'OD-1047');
assert.equal(result.total,2325);

await reg.markOrdered();
names = (await context.getTools()).map(t=>t.name).sort();
assert.equal(names.includes('bravo.create_purchase_order'), false);
assert.equal(names.includes('bravo.get_order_status'), true);
assert.equal(names.length, 6);

reg.dispose();
assert.equal((await context.getTools()).length, 0);
console.log('webmcp lifecycle: PASS');
