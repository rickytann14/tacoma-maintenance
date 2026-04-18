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
  if (svcType === 'changed') {
    records[id].lastMiles = miles;
    records[id].lastDate = today;
  }
  save();
  renderAll();
  setTimeout(() => {
    document.getElementById('exp-' + id)?.classList.add('open');
    document.getElementById('row-' + id)?.classList.add('open');
  }, 10);
}

function deleteHistory(id, index, e) {
  e.stopPropagation();
  if (!records[id]?.history) return;
  records[id].history.splice(index, 1);
  // recalculate lastMiles from most recent 'changed' entry (inspections don't reset interval)
  const lastChange = records[id].history.find(e => !e.type || e.type === 'changed');
  if (lastChange) {
    records[id].lastMiles = lastChange.miles;
    records[id].lastDate  = lastChange.date;
  } else {
    records[id].lastMiles = null;
    records[id].lastDate  = null;
  }
  save();
  renderAll();
  setTimeout(() => {
    document.getElementById('exp-' + id)?.classList.add('open');
    document.getElementById('row-' + id)?.classList.add('open');
  }, 10);
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
  setTimeout(() => {
    document.getElementById('exp-' + id)?.classList.add('open');
    document.getElementById('row-' + id)?.classList.add('open');
  }, 10);
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
  setTimeout(() => {
    document.getElementById('exp-' + id)?.classList.add('open');
    document.getElementById('row-' + id)?.classList.add('open');
  }, 10);
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
