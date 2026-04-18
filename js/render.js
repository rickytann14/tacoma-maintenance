// ── HERO ──────────────────────────────────────────────────────────────────
function renderHero() {
  const grid = document.getElementById('dueGrid');
  const actionable = ITEMS
    .map(item => ({ item, rem: getRem(item), status: getStatus(item) }))
    .filter(x => x.rem !== null)
    .sort((a, b) => a.rem - b.rem)
    .slice(0, 6);

  if (!actionable.length) {
    grid.innerHTML = `<div class="hero-empty">Enter your <strong>odometer reading</strong> and log service dates below to see what's coming up.</div>`;
    renderDueAtNext();
    return;
  }

  grid.innerHTML = actionable.map(({ item, rem, status }, i) => `
    <div class="due-card ${status}" style="animation-delay:${i*0.05}s">
      <div class="due-card-head">
        <div class="due-card-name">${item.name}</div>
        <span class="pill ${status}">${status === 'overdue' ? 'Overdue' : status === 'soon' ? 'Due soon' : 'OK'}</span>
      </div>
      <div>
        <div class="due-card-num ${status}">${rem <= 0 ? '−' : ''}${fmt(rem)}</div>
        <div class="due-card-sublabel">${rem <= 0 ? 'miles overdue' : 'miles remaining'}</div>
        ${getEstDueDate(rem) ? `<div class="due-card-est">${getEstDueDate(rem)}</div>` : ''}
      </div>
      <div class="bar"><div class="bar-fill ${status}" style="width:${getProg(item)}%"></div></div>
    </div>`).join('');

  renderDueAtNext();
}

function renderDueAtNext() {
  // Remove any existing due-at-next section
  const existing = document.getElementById('dueAtNextSection');
  if (existing) existing.remove();

  if (miles === null) return;

  const nextService = calcNextService();
  if (nextService === null) return;

  // Items whose next due mileage falls at or before the next service mileage
  const dueAtNext = ITEMS.filter(item => !nonServiceable[item.id]).map(item => {
    const rec = records[item.id];
    const lastDone = rec?.lastMiles || 0;
    const nextDue = lastDone + ivl(item);
    return { item, nextDue };
  })
  .filter(x => x.nextDue <= nextService && x.nextDue > miles)
  .sort((a, b) => a.nextDue - b.nextDue);

  const section = document.createElement('div');
  section.id = 'dueAtNextSection';

  const miLabel = nextService.toLocaleString();
  const miAway = (nextService - miles).toLocaleString();

  if (dueAtNext.length === 0) {
    section.innerHTML = `
      <div class="due-at-next-label">Due at next service · ${miLabel} mi</div>
      <div class="next-none">Nothing due by ${miLabel} mi — you're all set!</div>`;
  } else {
    const cards = dueAtNext.map(({ item, nextDue }, i) => `
      <div class="next-card" style="animation-delay:${i*0.04}s">
        <div class="next-card-name">${item.name}</div>
        <div class="next-card-miles">@ ${nextDue.toLocaleString()} mi</div>
      </div>`).join('');
    section.innerHTML = `
      <div class="due-at-next-label">Due at next service · ${miLabel} mi <span style="color:var(--text-3);font-style:italic;font-size:9px">(${miAway} mi away)</span></div>
      <div class="due-at-next-grid">${cards}</div>`;
  }

  document.querySelector('.hero').appendChild(section);
}

// ── ITEM ROWS ──────────────────────────────────────────────────────────────
function renderItem(item) {
  const isNA = !!nonServiceable[item.id];
  const status = getStatus(item);
  const rem = getRem(item);
  const rec = records[item.id] || {};
  const history = Array.isArray(rec.history) ? rec.history : [];
  const activeIvl = (severeMode && item.severe) ? item.severe : item.normal;
  const intStr = item.severe
    ? `Every ${(activeIvl/1000).toFixed(0)}K · (normal: ${(item.normal/1000).toFixed(0)}K · severe: ${(item.severe/1000).toFixed(0)}K)`
    : `Every ${(item.normal/1000).toFixed(0)}K`;

  let remHtml = `<div class="row-rem"><div class="row-rem-lbl">—</div></div>`;
  if (isNA) {
    remHtml = `<div class="row-rem"><div class="row-rem-lbl" style="color:var(--text-3)">N/A</div></div>`;
  } else if (rem !== null) {
    const cls = (status === 'ok') ? '' : status;
    const estDate = getEstDueDate(rem);
    remHtml = `<div class="row-rem">
      <div class="row-rem-num ${cls}">${rem<=0?'−':''}${fmt(rem)}</div>
      <div class="row-rem-lbl">${rem<=0?'mi overdue':'mi remaining'}</div>
      ${estDate ? `<div class="row-rem-est">${estDate}</div>` : ''}
    </div>`;
  }

  // NA checkbox only shown for driveshaft
  const naCheckboxHtml = item.id === 'driveshaft' ? `
    <label class="na-checkbox-row" onclick="event.stopPropagation()">
      <input type="checkbox" ${isNA ? 'checked' : ''} onchange="toggleNA('${item.id}', this)">
      <div class="na-custom-check">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.5"><path d="M1.5 6l3 3 6-6"/></svg>
      </div>
      <div class="na-checkbox-label">
        Not applicable — my 3rd Gen does not have a greaseable driveshaft
        <small>Item will be marked as non-serviceable and excluded from tracking</small>
      </div>
    </label>` : '';

  const naTag = isNA ? ' <span class="tag-na">NON-SERVICEABLE</span>' : '';
  const disabledClass = isNA ? 'na-fields-disabled' : '';

  return `
    <div class="item-row ${isNA ? 'na-row' : ''}" id="row-${item.id}" onclick="toggle('${item.id}')">
      <div class="status-stripe s-${isNA ? 'unknown' : status}"></div>
      <div class="row-body">
        <div class="row-left">
          <div class="row-name">${item.name}${naTag}</div>
          <div class="row-meta">${isNA ? 'Not applicable for this vehicle' : intStr}</div>
        </div>
        <div class="row-right">
          ${remHtml}
          <svg class="chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6l4 4 4-4"/></svg>
        </div>
      </div>
    </div>
    <div class="item-expand" id="exp-${item.id}">
      ${naCheckboxHtml}
      <div class="${disabledClass}">
        <div class="expand-grid">
          <div>
            <label class="exp-label">Last done (miles)</label>
            <input class="exp-input" type="number" placeholder="e.g. 42000"
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
            <label class="exp-label">Specs</label>
            <div class="exp-note">${item.notes}<div class="exp-pn">${item.pn}</div></div>
          </div>
        </div>
        <div style="margin-top:12px" onclick="event.stopPropagation()">
          <label class="exp-label">Service Type</label>
          <div class="svc-type-btns" id="svc-type-${item.id}">
            <button class="svc-type-btn active" data-type="changed" onclick="selectSvcType('${item.id}',this);event.stopPropagation()">Changed</button>
            <button class="svc-type-btn" data-type="inspected" onclick="selectSvcType('${item.id}',this);event.stopPropagation()">Inspected</button>
            ${item.group === 'fluids' ? `<button class="svc-type-btn" data-type="topped_off" onclick="selectSvcType('${item.id}',this);event.stopPropagation()">Topped Off</button>` : ''}
          </div>
        </div>
        ${item.group === 'brakes' ? `<div style="margin-top:8px" onclick="event.stopPropagation()">
          <label class="exp-label">Brake Lining (mm)</label>
          <input class="exp-input" type="number" step="0.5" min="0" max="15" id="brake-lining-${item.id}" placeholder="e.g. 4.5" onclick="event.stopPropagation()" style="width:120px">
        </div>` : ''}
        <div style="margin-top:10px;display:flex;justify-content:flex-start">
          <button class="btn-done" onclick="markDone('${item.id}');event.stopPropagation()">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3.5 8.3l3 3L12.5 5.2"/></svg>
            Log Service
          </button>
        </div>
        <textarea class="notes-input" id="notes-input-${item.id}" placeholder="Optional notes (shop, parts, cost…)" onclick="event.stopPropagation()" rows="2"></textarea>
        <div class="history-section">
          <div class="history-label">Service History</div>
          <div class="history-list">
            ${history.length ? history.map((h, i) => {
              const typeLabel = h.type === 'inspected' ? 'Inspected' : h.type === 'topped_off' ? 'Topped Off' : null;
              return `
              <div class="history-entry">
                <div class="history-entry-left">
                  <div class="history-mi-row">
                    <span class="history-mi">${(h.miles ?? 0).toLocaleString()} mi</span>
                    ${typeLabel ? `<span class="history-type-badge ${h.type}">${typeLabel}</span>` : ''}
                  </div>
                  <div class="history-date">${h.date || ''}</div>
                  ${h.brakeLining != null ? `<div class="history-notes">Lining: ${h.brakeLining} mm</div>` : ''}
                  ${h.notes ? `<div class="history-notes">${h.notes}</div>` : ''}
                </div>
                <button class="history-delete" onclick="deleteHistory('${item.id}',${i},event)" aria-label="Delete history entry">×</button>
              </div>`;
            }).join('') : '<div class="history-empty">No service entries yet.</div>'}
          </div>
        </div>
      </div>
    </div>`;
}

function renderLists() {
  ['fluids','filters','brakes'].forEach(g => {
    document.getElementById('list-' + g).innerHTML =
      ITEMS.filter(i => i.group === g).map(renderItem).join('');
  });
  // auto-expand overdue items
  ITEMS.forEach(item => {
    if (getStatus(item) === 'overdue') {
      document.getElementById('exp-' + item.id)?.classList.add('open');
      document.getElementById('row-' + item.id)?.classList.add('open');
    }
  });
}

function renderCounts() {
  const c = {overdue:0, soon:0, ok:0, unknown:0};
  ITEMS.forEach(i => { const s = getStatus(i); if (s !== 'na') c[s]++; });
  customItems.forEach(item => {
    if (!item.interval || miles === null) return;
    const rec = records[item.id] || {};
    const lastDone = rec.lastMiles || 0;
    const rem = (lastDone + item.interval) - miles;
    if (rem <= 0) c.overdue++;
    else if (rem <= 1500) c.soon++;
    else c.ok++;
  });
  document.getElementById('cntOverdue').textContent = c.overdue;
  document.getElementById('cntSoon').textContent = c.soon;
  document.getElementById('cntOk').textContent = c.ok;
  document.getElementById('cntUnknown').textContent = c.unknown;
}


function setMode(mode) {
  severeMode = (mode === 'severe');
  document.getElementById('btnNormal').classList.toggle('active', !severeMode);
  document.getElementById('btnSevere').classList.toggle('active', severeMode);
  save();
  renderAll();
}

function syncModeToggle() {
  document.getElementById('btnNormal').classList.toggle('active', !severeMode);
  document.getElementById('btnSevere').classList.toggle('active', severeMode);
}

function calcNextService() {
  // Find the nearest upcoming due mileage across all items
  if (miles === null) return null;
  let nearest = null;
  ITEMS.filter(item => !nonServiceable[item.id]).forEach(item => {
    const rec = records[item.id];
    const lastDone = rec?.lastMiles || 0;
    const nextDue = lastDone + ivl(item);
    if (nextDue > miles) {
      if (nearest === null || nextDue < nearest) nearest = nextDue;
    }
  });
  return nearest;
}

function renderNextServiceDisplay() {
  const el = document.getElementById('nextServiceDisplay');
  const sub = document.getElementById('nextServiceSub');
  const next = calcNextService();
  if (next !== null) {
    el.innerHTML = `${next.toLocaleString()}<span style="font-size:13px;color:var(--text-3);font-weight:400;margin-left:4px">mi</span>`;
    const diff = next - miles;
    sub.textContent = diff > 0 ? `in ${diff.toLocaleString()} mi` : 'Now';
    sub.style.color = diff <= 500 ? 'var(--red)' : diff <= 1500 ? 'var(--amber)' : 'var(--text-3)';
  } else {
    el.innerHTML = '<span class="unset">—</span>';
    sub.textContent = '';
  }
}

function renderAll() {
  if (miles !== null) document.getElementById('odoDisplay').innerHTML = `${miles.toLocaleString()}<span>mi</span>`;
  syncModeToggle();
  renderNextServiceDisplay();
  renderHero();
  renderLists();
  renderCustomList();
  renderCounts();
}
