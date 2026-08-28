const enabled = new URLSearchParams(location.search).get('proof') === '1';

if (enabled) {
  const style = document.createElement('style');
  style.textContent = `
    #webmcp-proof-panel{position:fixed;left:16px;bottom:16px;z-index:2147483647;width:min(390px,calc(100vw - 32px));background:#071019;border:1px solid #314458;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.42);color:#eef7ff;font:600 13px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:14px}
    #webmcp-proof-panel .proof-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
    #webmcp-proof-panel .proof-title{font:800 12px/1.2 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8ba6bf}
    #webmcp-proof-panel .proof-badge{padding:4px 8px;border-radius:999px;background:#102230;color:#74e6b8;font-size:11px}
    #webmcp-proof-panel .proof-grid{display:grid;grid-template-columns:1fr auto;gap:8px 12px;align-items:center}
    #webmcp-proof-panel .proof-label{color:#93a7b8}
    #webmcp-proof-panel .proof-value{font-weight:800;text-align:right}
    #webmcp-proof-panel .pass{color:#74e6b8}.warn{color:#ffd16b}.bad{color:#ff7b8d}
    #webmcp-proof-panel .proof-note{margin:10px 0 0;color:#778da1;font-weight:500;font-size:11px}
    #webmcp-proof-panel .proof-close{border:0;background:transparent;color:#8ba6bf;font:700 18px/1 sans-serif;cursor:pointer;padding:0 2px}
  `;
  document.head.append(style);

  const panel = document.createElement('section');
  panel.id = 'webmcp-proof-panel';
  panel.setAttribute('aria-label', 'WebMCP lifecycle proof');
  panel.innerHTML = `
    <div class="proof-head">
      <span class="proof-title">WebMCP lifecycle proof</span>
      <span id="proof-active" class="proof-badge">CHECKING</span>
      <button class="proof-close" type="button" aria-label="Close proof panel">×</button>
    </div>
    <div class="proof-grid">
      <span class="proof-label">Registered tools</span><span id="proof-count" class="proof-value">—</span>
      <span class="proof-label">bravo.create_purchase_order</span><span id="proof-purchase" class="proof-value">—</span>
      <span class="proof-label">bravo.get_order_status</span><span id="proof-status" class="proof-value">—</span>
      <span class="proof-label">Lifecycle state</span><span id="proof-state" class="proof-value">—</span>
    </div>
    <p id="proof-note" class="proof-note">This panel reads the browser's actual document.modelContext tool surface; it does not use the fallback demo state.</p>
  `;
  document.body.append(panel);
  panel.querySelector('.proof-close')?.addEventListener('click', () => panel.remove());

  const el = (id) => document.getElementById(id);
  const set = (id, text, cls = '') => {
    const node = el(id); if (!node) return;
    node.textContent = text;
    node.className = `proof-value ${cls}`.trim();
  };

  async function refreshProof() {
    const active = !!document.modelContext;
    const badge = el('proof-active');
    if (!badge) return;
    badge.textContent = active ? 'WEBMCP ACTIVE' : 'WEBMCP UNAVAILABLE';
    badge.className = `proof-badge ${active ? 'pass' : 'bad'}`;
    if (!active) {
      set('proof-count', '0', 'bad');
      set('proof-purchase', 'UNAVAILABLE', 'bad');
      set('proof-status', 'UNAVAILABLE', 'bad');
      set('proof-state', 'NO WEBMCP', 'bad');
      return;
    }
    try {
      const tools = await document.modelContext.getTools();
      const names = tools.map((t) => t.name);
      const purchase = names.includes('bravo.create_purchase_order');
      const status = names.includes('bravo.get_order_status');
      set('proof-count', String(names.length), names.length >= 15 ? 'pass' : 'warn');
      set('proof-purchase', purchase ? 'PRESENT' : 'ABSENT', purchase ? 'warn' : 'pass');
      set('proof-status', status ? 'PRESENT' : 'ABSENT', status ? 'pass' : 'warn');
      const state = status ? 'ORDERED' : purchase ? 'APPROVED' : names.length >= 15 ? 'PRE-APPROVAL' : 'LOADING';
      set('proof-state', state, state === 'LOADING' ? 'warn' : 'pass');
    } catch (error) {
      set('proof-count', 'ERROR', 'bad');
      set('proof-state', 'INSPECTOR ERROR', 'bad');
      const note = el('proof-note');
      if (note) note.textContent = error instanceof Error ? error.message : String(error);
    }
  }

  if (document.modelContext?.addEventListener) {
    document.modelContext.addEventListener('toolchange', () => queueMicrotask(refreshProof));
  }
  refreshProof();
  const timer = setInterval(refreshProof, 500);
  setTimeout(() => clearInterval(timer), 15000);
}
