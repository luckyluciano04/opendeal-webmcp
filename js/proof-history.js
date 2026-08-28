const proofMode = new URLSearchParams(location.search).get('proof') === '1';

if (proofMode && document.modelContext) {
  const history = [];
  let lastKey = '';

  function ensureHistoryHost() {
    const panel = document.getElementById('webmcp-proof-panel');
    if (!panel || document.getElementById('proof-history')) return;
    const host = document.createElement('div');
    host.id = 'proof-history';
    host.style.cssText = 'margin-top:12px;padding-top:10px;border-top:1px solid #203141;display:grid;gap:6px;max-height:150px;overflow:auto';
    const label = document.createElement('div');
    label.textContent = 'Observed lifecycle transitions';
    label.style.cssText = 'color:#8ba6bf;font:800 10px/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;margin-bottom:2px';
    host.append(label);
    panel.append(host);
    renderHistory();
  }

  function renderHistory() {
    const host = document.getElementById('proof-history');
    if (!host) return;
    host.querySelectorAll('[data-proof-event]').forEach((n) => n.remove());
    for (const item of history.slice(-8)) {
      const row = document.createElement('div');
      row.dataset.proofEvent = '1';
      row.style.cssText = 'display:grid;grid-template-columns:66px 1fr;gap:8px;color:#a9bdcd;font:600 10px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
      const time = document.createElement('span');
      time.textContent = item.time;
      time.style.color = '#657d91';
      const text = document.createElement('span');
      text.textContent = `${item.state} · tools ${item.count} · purchase ${item.purchase ? 'PRESENT' : 'ABSENT'} · status ${item.status ? 'PRESENT' : 'ABSENT'}`;
      if (item.state === 'ORDERED') text.style.color = '#74e6b8';
      else if (item.state === 'APPROVED') text.style.color = '#ffd16b';
      row.append(time, text);
      host.append(row);
    }
  }

  async function snapshot() {
    try {
      const tools = await document.modelContext.getTools();
      const names = tools.map((t) => t.name);
      const purchase = names.includes('bravo.create_purchase_order');
      const status = names.includes('bravo.get_order_status');
      const state = status ? 'ORDERED' : purchase ? 'APPROVED' : names.length >= 15 ? 'PRE-APPROVAL' : 'LOADING';
      const key = `${names.length}:${purchase}:${status}:${state}`;
      if (key === lastKey) return;
      lastKey = key;
      history.push({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        state,
        count: names.length,
        purchase,
        status
      });
      ensureHistoryHost();
      renderHistory();
    } catch {}
  }

  document.modelContext.addEventListener?.('toolchange', () => queueMicrotask(snapshot));
  const hostTimer = setInterval(ensureHistoryHost, 100);
  setTimeout(() => clearInterval(hostTimer), 5000);
  snapshot();
}
