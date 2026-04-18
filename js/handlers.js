let historyEditState = { id: null, index: null };

function reopenPanel(id) {
  setTimeout(() => {
    document.getElementById('exp-' + id)?.classList.add('open');
    document.getElementById('row-' + id)?.classList.add('open');
  }, 10);
}

function openHistoryEdit(id, index, e) {
  e.stopPropagation();
  historyEditState = { id, index };
  renderAll();
  reopenPanel(id);
}

function cancelHistoryEdit(id, e) {
  e.stopPropagation();
  historyEditState = { id: null, index: null };
  renderAll();
  reopenPanel(id);
}

function selectHistoryEditType(id, index, btn) {
  const group = document.getElementById(`history-edit-type-${id}-${index}`);
  group.querySelectorAll('.svc-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function saveHistoryEdit(id, index, e) {
  e.stopPropagation();
  if (!records[id]?.history?.[index]) return;
  const milesVal = parseInt(document.getElementById('history-edit-miles').value);
  const dateVal  = document.getElementById('history-edit-date').value;
  const notesVal = document.getElementById('history-edit-notes').value.trim();
  const activeTypeBtn = document.querySelector(`#history-edit-type-${id}-${index} .svc-type-btn.active`);
  const svcType  = activeTypeBtn ? activeTypeBtn.dataset.type : 'changed';
  const liningEl = document.getElementById('history-edit-lining');
  const liningVal = liningEl ? liningEl.value : '';

  const entry = { miles: isNaN(milesVal) ? records[id].history[index].miles : milesVal, date: dateVal };
  if (notesVal) entry.notes = notesVal;
  if (svcType !== 'changed') entry.type = svcType;
  if (liningVal) entry.brakeLining = parseFloat(liningVal);

  records[id].history[index] = entry;

  const lastChange = lastResetEntry(id);
  records[id].lastMiles = lastChange?.miles ?? null;
  records[id].lastDate  = lastChange?.date  ?? null;

  historyEditState = { id: null, index: null };
  save();
  renderAll();
  reopenPanel(id);
}

function toggle(id) {
  const row = document.getElementById('row-' + id);
  const exp = document.getElementById('exp-' + id);
  const wasOpen = exp.classList.contains('open');
  document.querySelectorAll('.item-expand.open').forEach(e => e.classList.remove('open'));
  document.querySelectorAll('.item-row.open').forEach(e => e.classList.remove('open'));
  if (!wasOpen) { exp.classList.add('open'); row.classList.add('open'); }
}

function pushHistory(id, milesVal, dateVal, notes, type, brakeLining) {
  if (!records[id]) records[id] = {};
  if (!records[id].history) records[id].history = [];
  const entry = { miles: parseInt(milesVal), date: dateVal || new Date().toISOString().split('T')[0] };
  if (notes && notes.trim()) entry.notes = notes.trim();
  if (type && type !== 'changed') entry.type = type;
  if (brakeLining) entry.brakeLining = parseFloat(brakeLining);
  // avoid duplicate at same mileage
  if (!records[id].history.find(e => e.miles === entry.miles)) {
    records[id].history.unshift(entry); // newest first
  }
}

function selectSvcType(id, btn) {
  const group = document.getElementById('svc-type-' + id);
  group.querySelectorAll('.svc-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function svcResetsInterval(itemId, svcType) {
  if (svcType === 'changed') return true;
  if (svcType === 'inspected') {
    const item = ITEMS.find(i => i.id === itemId) || customItems.find(i => i.id === itemId);
    return !!item?.inspectResets;
  }
  return false;
}

function lastResetEntry(id) {
  const item = ITEMS.find(i => i.id === id) || customItems.find(i => i.id === id);
  return (records[id]?.history || []).find(e => {
    if (!e.type || e.type === 'changed') return true;
    if (e.type === 'inspected') return !!item?.inspectResets;
    return false;
  });
}

function markDone(id) {
  if (miles === null) { alert('Set your current odometer first.'); return; }
  if (!records[id]) records[id] = {};
  const today = new Date().toISOString().split('T')[0];
  const notesEl = document.getElementById('notes-input-' + id);
  const notes = notesEl ? notesEl.value : '';
  const activeSvcBtn = document.querySelector('#svc-type-' + id + ' .svc-type-btn.active');
  const svcType = activeSvcBtn ? activeSvcBtn.dataset.type : 'changed';
  const brakeLiningEl = document.getElementById('brake-lining-' + id);
  const brakeLining = brakeLiningEl ? brakeLiningEl.value : '';
  pushHistory(id, miles, today, notes, svcType, brakeLining);
  if (notesEl) notesEl.value = '';
  if (brakeLiningEl) brakeLiningEl.value = '';
  if (svcResetsInterval(id, svcType)) {
    records[id].lastMiles = miles;
    records[id].lastDate = today;
  }
  save();
  renderAll();
  reopenPanel(id);
}

function deleteHistory(id, index, e) {
  e.stopPropagation();
  if (!records[id]?.history) return;
  records[id].history.splice(index, 1);
  // recalculate lastMiles from most recent 'changed' entry (inspections don't reset interval)
  const lastChange = lastResetEntry(id);
  if (lastChange) {
    records[id].lastMiles = lastChange.miles;
    records[id].lastDate  = lastChange.date;
  } else {
    records[id].lastMiles = null;
    records[id].lastDate  = null;
  }
  save();
  renderAll();
  reopenPanel(id);
}

function updateRec(id, field, value) {
  if (!records[id]) records[id] = {};
  if (field === 'lastMiles') {
    const parsed = value ? parseInt(value) : null;
    records[id].lastMiles = parsed;
  } else {
    records[id][field] = value;
  }
  save();
  renderAll();
  reopenPanel(id);
}

function updateDateRec(id, value) {
  if (!records[id]) records[id] = {};
  records[id].lastDate = value;
  save();
}

function toggleNA(id, el) {
  nonServiceable[id] = el.checked;
  save();
  renderAll();
  reopenPanel(id);
}

function setMiles() {
  const val = parseInt(document.getElementById('odoInput').value);
  if (!isNaN(val) && val >= 0) {
    miles = val;
    document.getElementById('odoInput').value = '';
    save();
    renderAll();
  }
}
