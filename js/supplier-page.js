import { suppliers } from './domain.js';
import { hasWebMCP, registerSupplierTools, resolveBuyerOrigin } from './webmcp.js';

const root=document.querySelector('#supplier-root');
const supplierId=root?.dataset.supplier;
const p=suppliers[supplierId];
let registration=null;
function render(status){root.innerHTML=`<span class="status-pill ${hasWebMCP()?'active':'fallback'}">${hasWebMCP()?'WEBMCP ACTIVE':'FALLBACK'}</span><div class="supplier-monogram large">${p.accent}</div><h1>${p.name}</h1><p>${status}</p><dl><div><dt>Inventory</dt><dd>${p.inventory}</dd></div><div><dt>Delivery</dt><dd>${p.deliveryDay}</dd></div><div><dt>Quote floor</dt><dd>$${p.floorTotal}</dd></div></dl>`;}
render('Registering supplier capabilities…');
try{registration=await registerSupplierTools(supplierId);render(registration.supported?'WebMCP tools active':'Fallback route ready');}catch(error){render(`Registration error: ${error instanceof Error?error.message:'unknown'}`);}
window.addEventListener('message',async(event)=>{
  const buyerOrigin=resolveBuyerOrigin();
  if(event.origin!==buyerOrigin||!registration)return;
  const data=event.data||{};if(data.type!=='opendeal:approval'||data.supplierId!==supplierId)return;
  if(data.ordered)await registration.markOrdered();else await registration.approvePurchase(Boolean(data.approved));
});
window.addEventListener('beforeunload',()=>registration?.dispose());
