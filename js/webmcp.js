import { mission, suppliers, invokePolicy } from './domain.js';

export const hasWebMCP = () => !!document.modelContext;

function numberInput(value, field, min = 0, max = 1_000_000) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new TypeError(`${field} must be a finite number between ${min} and ${max}.`);
  return value;
}
function stringInput(value, field, max = 120) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new TypeError(`${field} is invalid.`);
  return value.replace(/[<>]/g, '').trim();
}
export function resolveBuyerOrigin() {
  const raw = new URLSearchParams(location.search).get('buyerOrigin');
  if (!raw) return location.origin;
  try {
    const candidate = new URL(raw);
    if (!/^https?:$/.test(candidate.protocol)) return location.origin;
    if (candidate.origin === location.origin) return location.origin;
    const allowed = Array.isArray(window.OPENDEAL_CONFIG?.allowedBuyerOrigins)
      ? window.OPENDEAL_CONFIG.allowedBuyerOrigins
      : [];
    return allowed.includes(candidate.origin) ? candidate.origin : location.origin;
  } catch {
    return location.origin;
  }
}

function notifyBuyer(supplierId, tool, result) {
  if (window.parent === window) return;
  window.parent.postMessage({ type: 'opendeal:tool-result', supplierId, tool, result }, resolveBuyerOrigin());
}
function wrap(supplierId, action, validator) {
  return async (input = {}) => {
    validator?.(input);
    const result = invokePolicy(supplierId, action, input);
    notifyBuyer(supplierId, `${supplierId}.${action}`, result);
    return result;
  };
}
function baseTools(supplierId) {
  const p = suppliers[supplierId];
  const n = (action) => `${supplierId}.${action}`;
  return [
    { name:n('search_inventory'), title:`${p.name}: Search inventory`, description:'Check exact-match inventory for a requested SKU and quantity.', inputSchema:{type:'object',additionalProperties:false,properties:{sku:{type:'string'},quantity:{type:'number',minimum:1,maximum:10000}},required:['sku','quantity']}, annotations:{readOnlyHint:true}, execute:wrap(supplierId,'search_inventory',(i)=>{stringInput(i.sku,'sku');numberInput(i.quantity,'quantity',1,10000);}) },
    { name:n('get_product_specs'), title:`${p.name}: Product specs`, description:'Return product specifications for compliance checking.', inputSchema:{type:'object',additionalProperties:false,properties:{sku:{type:'string'}},required:['sku']}, annotations:{readOnlyHint:true}, execute:wrap(supplierId,'get_product_specs',(i)=>stringInput(i.sku,'sku')) },
    { name:n('request_quote'), title:`${p.name}: Request quote`, description:'Return a deterministic quote for the requested exact quantity.', inputSchema:{type:'object',additionalProperties:false,properties:{sku:{type:'string'},quantity:{type:'number',minimum:1,maximum:10000}},required:['sku','quantity']}, execute:wrap(supplierId,'request_quote',(i)=>{stringInput(i.sku,'sku');numberInput(i.quantity,'quantity',1,10000);}) },
    { name:n('counter_offer'), title:`${p.name}: Counter offer`, description:'Negotiate total price within deterministic supplier pricing authority.', inputSchema:{type:'object',additionalProperties:false,properties:{desiredTotal:{type:'number',minimum:1,maximum:1000000}},required:['desiredTotal']}, execute:wrap(supplierId,'counter_offer',(i)=>numberInput(i.desiredTotal,'desiredTotal',1,1000000)) },
    { name:n('check_delivery'), title:`${p.name}: Check delivery`, description:'Check whether the quoted order can arrive by the required deadline.', inputSchema:{type:'object',additionalProperties:false,properties:{deadline:{type:'string'}},required:['deadline']}, annotations:{readOnlyHint:true}, execute:wrap(supplierId,'check_delivery',(i)=>stringInput(i.deadline,'deadline')) },
  ];
}

export async function registerSupplierTools(supplierId) {
  const context = document.modelContext;
  if (!context) return { supported:false, approvePurchase:async()=>{}, markOrdered:async()=>{}, dispose:()=>{} };
  const baseController = new AbortController();
  let purchaseController = null;
  let statusController = null;
  let purchaseRegistered = false;
  let statusRegistered = false;
  const exposedTo = resolveBuyerOrigin() === location.origin ? undefined : [resolveBuyerOrigin()];
  for (const tool of baseTools(supplierId)) await context.registerTool(tool, { signal: baseController.signal, ...(exposedTo ? { exposedTo } : {}) });
  const p = suppliers[supplierId];

  const purchaseTool = {
    name:`${supplierId}.create_purchase_order`, title:`${p.name}: Create purchase order`,
    description:'Create one purchase order after explicit human approval for this exact offer.',
    inputSchema:{type:'object',additionalProperties:false,properties:{approvedTotal:{type:'number',minimum:1,maximum:1000000},approvalToken:{type:'string',minLength:1,maxLength:80}},required:['approvedTotal','approvalToken']},
    execute:async(input={})=>{
      const approvedTotal=numberInput(input.approvedTotal,'approvedTotal',1,1000000); const approvalToken=stringInput(input.approvalToken,'approvalToken',80);
      if(supplierId!=='bravo') throw new Error('Only the selected supplier may create this purchase order.');
      if(approvedTotal!==2325||approvalToken!=='OD-APPROVED-1047') throw new Error('Approval scope mismatch.');
      const result={supplierId,poId:'OD-1047',total:2325,currency:'USD',deliveryDay:'Friday',status:'CONFIRMED'};
      notifyBuyer(supplierId,`${supplierId}.create_purchase_order`,result); return result;
    }
  };
  const statusTool = {
    name:`${supplierId}.get_order_status`, title:`${p.name}: Order status`, description:'Return the status of the confirmed OpenDeal purchase order.',
    inputSchema:{type:'object',additionalProperties:false,properties:{poId:{type:'string'}},required:['poId']}, annotations:{readOnlyHint:true},
    execute:async(input={})=>{const poId=stringInput(input.poId,'poId',40);const result={supplierId,poId,status:poId==='OD-1047'?'CONFIRMED':'UNKNOWN',deliveryDay:p.deliveryDay};notifyBuyer(supplierId,`${supplierId}.get_order_status`,result);return result;}
  };
  return {
    supported:true,
    approvePurchase:async(approved)=>{
      if(approved&&!purchaseRegistered){purchaseController=new AbortController();await context.registerTool(purchaseTool,{signal:purchaseController.signal,...(exposedTo?{exposedTo}:{})});purchaseRegistered=true;}
      if(!approved&&purchaseRegistered){purchaseController?.abort();purchaseRegistered=false;}
    },
    markOrdered:async()=>{
      if(purchaseRegistered){purchaseController?.abort();purchaseRegistered=false;}
      if(!statusRegistered){statusController=new AbortController();await context.registerTool(statusTool,{signal:statusController.signal,...(exposedTo?{exposedTo}:{})});statusRegistered=true;}
    },
    dispose:()=>{baseController.abort();purchaseController?.abort();statusController?.abort();}
  };
}

export function supplierOrigins(urls) {
  const origins = new Set();
  for (const url of Object.values(urls)) { try { const origin = new URL(url, location.href).origin; if (origin !== location.origin) origins.add(origin); } catch {} }
  return [...origins];
}
export async function getToolsFromSuppliers(urls) {
  if (!document.modelContext) return [];
  const origins = supplierOrigins(urls);
  return document.modelContext.getTools(origins.length ? { fromOrigins: origins } : undefined);
}
export async function findTool(name, urls) {
  const tools = await getToolsFromSuppliers(urls); return tools.find((t)=>t.name===name);
}
export async function waitForTool(name, urls, timeoutMs=2500) {
  const start=Date.now();
  while(Date.now()-start<timeoutMs){const tool=await findTool(name,urls);if(tool)return tool;await new Promise(r=>setTimeout(r,80));}
  throw new Error(`Timed out waiting for WebMCP tool ${name}.`);
}
export async function executeTool(name,input,urls){if(!document.modelContext)throw new Error('WebMCP unavailable.');const tool=await waitForTool(name,urls);const raw=await document.modelContext.executeTool(tool,input);try{return JSON.parse(raw);}catch{return raw;}}
