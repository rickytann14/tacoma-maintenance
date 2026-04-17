function toggleOnetimeCheck() {
  // let the checkbox toggle naturally, then sync UI
  setTimeout(() => {
    const isOnetime = document.getElementById('ci_onetime').checked;
    document.getElementById('intervalField').classList.toggle('hidden', isOnetime);
    if (isOnetime) document.getElementById('ci_interval').value = '';
  }, 0);
}

function openCustomModal(editId) {
  editingCustomId = editId || null;
  const existing = editId ? customItems.find(i => i.id === editId) : null;
  const rec = editId ? (records[editId] || {}) : {};
  const isOnetime = existing ? !existing.interval : false;
  document.getElementById('modalTitle').textContent = editId ? 'Edit Custom Item' : 'Add Custom Item';
  document.getElementById('ci_name').value = existing?.name || '';
  document.getElementById('ci_pn').value = existing?.pn || '';
  document.getElementById('ci_onetime').checked = isOnetime;
  document.getElementById('intervalField').classList.toggle('hidden', isOnetime);
  document.getElementById('ci_interval').value = existing?.interval || '';
  document.getElementById('ci_miles').value = rec.lastMiles || '';
  document.getElementById('ci_date').value = rec.lastDate || new Date().toISOString().split('T')[0];
  document.getElementById('customModal').classList.add('open');
  setTimeout(() => document.getElementById('ci_name').focus(), 50);
}

function closeCustomModal() {
  document.getElementById('customModal').classList.remove('open');
  editingCustomId = null;
}

function saveCustomItem() {
  const name = document.getElementById('ci_name').value.trim();
  if (!name) { document.getElementById('ci_name').focus(); return; }
  const pn = document.getElementById('ci_pn').value.trim();
  const isOnetime = document.getElementById('ci_onetime').checked;
  const intervalVal = document.getElementById('ci_interval').value;
  const interval = (!isOnetime && intervalVal) ? parseInt(intervalVal) : null;
  const milesVal = document.getElementById('ci_miles').value;
  const milesInt = milesVal ? parseInt(milesVal) : null;
  const date = document.getElementById('ci_date').value;

  if (editingCustomId) {
    const idx = customItems.findIndex(i => i.id === editingCustomId);
    if (idx > -1) customItems[idx] = { ...customItems[idx], name, pn, interval };
  } else {
    const id = 'custom_' + Date.now();
    customItems.push({ id, name, pn, interval });
    // log initial record if miles provided
    if (milesInt) {
      records[id] = { lastMiles: milesInt, lastDate: date, history: [{ miles: milesInt, date }] };
    }
  }

  // update record miles/date if provided (for edits too)
  if (editingCustomId && milesInt) {
    if (!records[editingCustomId]) records[editingCustomId] = {};
    records[editingCustomId].lastMiles = milesInt;
    records[editingCustomId].lastDate = date;
  }

  save();
  closeCustomModal();
  renderAll();
}

function deleteCustomItem(id, e) {
  e.stopPropagation();
  if (!confirm('Remove this custom item and all its history?')) return;
  customItems = customItems.filter(i => i.id !== id);
  delete records[id];
  save();
  renderAll();
}

function renderCustomItem(item) {
  const rec = records[item.id] || {};
  const history = Array.isArray(rec.history) ? rec.history : [];
  const isOnetime = !item.interval;

  let status = 'unknown';
  let rem = null;
  let prog = 0;

  if (!isOnetime && miles !== null) {
    const lastDone = rec.lastMiles || 0;
    rem = (lastDone + item.interval) - miles;
    prog = Math.min(100, Math.max(0, ((miles - lastDone) / item.interval) * 100));
    if (rem <= 0) status = 'overdue';
    else if (rem <= 1500) status = 'soon';
    else status = 'ok';
  } else if (isOnetime) {
    status = rec.lastMiles ? 'ok' : 'unknown';
  }

  let remHtml = `<div class="row-rem"><div class="row-rem-lbl">—</div></div>`;
  if (!isOnetime && rem !== null) {
    const cls = status === 'ok' ? '' : status;
    const estDate = getEstDueDate(rem);
    remHtml = `<div class="row-rem">
      <div class="row-rem-num ${cls}">${rem<=0?'−':''}${fmt(rem)}</div>
      <div class="row-rem-lbl">${rem<=0?'mi overdue':'mi remaining'}</div>
      ${estDate ? `<div class="row-rem-est">${estDate}</div>` : ''}
    </div>`;
  } else if (isOnetime && rec.lastMiles) {
    remHtml = `<div class="row-rem"><div class="row-rem-lbl" style="text-align:right">@ ${rec.lastMiles.toLocaleString()} mi</div></div>`;
  }

  const intStr = isOnetime ? 'One-time' : `Every ${(item.interval/1000).toFixed(item.interval < 10000 ? 1 : 0)}K`;

  return `
    <div class="item-row" id="row-${item.id}" onclick="toggle('${item.id}')">
      <div class="status-stripe s-${status}"></div>
      <div class="row-body">
        <div class="row-left">
          <div class="row-name">${item.name} ${isOnetime ? '<span class="tag-onetime">one-time</span>' : ''}</div>
          <div class="row-meta">${intStr}</div>
        </div>
        <div class="row-right">
          ${remHtml}
          <svg class="chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6l4 4 4-4"/></svg>
        </div>
      </div>
    </div>
    <div class="item-expand" id="exp-${item.id}">
      <div class="expand-grid">
        <div>
          <label class="exp-label">Last done (miles)</label>
          <input class="exp-input" type="number" placeholder="e.g. 3891"
            value="${rec.lastMiles||''}"
            onchange="updateRec('${item.id}','lastMiles',this.value)"
            onclick="event.stopPropagation()">
        </div>
        <div>
          <label class="exp-label">Date done</label>
          <input class="exp-input" type="date"
            value="${rec.lastDate || new Date().toISOString().split('T')[0]}"
            onchange="updateDateRec('${item.id}',this.value)"
            onclick="event.stopPropagation()">
        </div>
        <div>
          <label class="exp-label">Part / Notes</label>
          <div class="exp-note">${item.pn || '—'}</div>
        </div>
      </div>
      <div style="margin-top:12px;display:flex;align-items:center;gap:8px">
        ${!isOnetime ? `<button class="btn-done" onclick="markDone('${item.id}');event.stopPropagation()">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 8.5l4 4 7-7"/></svg>
          Mark done at current mileage
        </button>` : `<button class="btn-done" onclick="markDone('${item.id}');event.stopPropagation()">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 8.5l4 4 7-7"/></svg>
          Log at current mileage
        </button>`}
        <button class="btn-delete-item" onclick="openCustomModal('${item.id}');event.stopPropagation()" title="Edit">✎ Edit</button>
        <button class="btn-delete-item" onclick="deleteCustomItem('${item.id}',event)" title="Delete">× Remove</button>
      </div>
      <textarea class="notes-input" id="notes-input-${item.id}" placeholder="Optional notes (shop, parts, cost…)" onclick="event.stopPropagation()" rows="2"></textarea>
      ${history.length > 0 ? `
      <div class="history-section">
        <div class="history-label">History</div>
        <div class="history-list">
          ${history.map((e, i) => `
            <div class="history-entry">
              <div class="history-entry-left">
                <div class="history-mi">${(e.miles ?? 0).toLocaleString()} mi</div>
                <div class="history-date">${e.date || ''}</div>
                ${e.notes ? `<div class="history-notes">${e.notes}</div>` : ''}
              </div>
              <button class="history-delete" onclick="deleteHistory('${item.id}',${i},event)">×</button>
            </div>`).join('')}
        </div>
      </div>` : `<div class="history-section"><div class="history-label">History</div><div class="history-empty">No entries yet.</div></div>`}
    </div>`;
}

function renderCustomList() {
  const list = document.getElementById('list-custom');
  if (customItems.length === 0) {
    list.innerHTML = '';
    return;
  }
  list.innerHTML = customItems.map(renderCustomItem).join('');
  // auto-expand overdue custom items
  customItems.forEach(item => {
    if (!item.interval) return;
    const rec = records[item.id] || {};
    if (miles !== null) {
      const lastDone = rec.lastMiles || 0;
      const rem = (lastDone + item.interval) - miles;
      if (rem <= 0) {
        document.getElementById('exp-' + item.id)?.classList.add('open');
        document.getElementById('row-' + item.id)?.classList.add('open');
      }
    }
  });
}
