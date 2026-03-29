function toggle(id) {
  const row = document.getElementById('row-' + id);
  const exp = document.getElementById('exp-' + id);
  const wasOpen = exp.classList.contains('open');
  document.querySelectorAll('.item-expand.open').forEach(e => e.classList.remove('open'));
  document.querySelectorAll('.item-row.open').forEach(e => e.classList.remove('open'));
  if (!wasOpen) { exp.classList.add('open'); row.classList.add('open'); }
}

function pushHistory(id, milesVal, dateVal) {
  if (!records[id]) records[id] = {};
  if (!records[id].history) records[id].history = [];
  const entry = { miles: parseInt(milesVal), date: dateVal || new Date().toISOString().split('T')[0] };
  // avoid duplicate at same mileage
  if (!records[id].history.find(e => e.miles === entry.miles)) {
    records[id].history.unshift(entry); // newest first
  }
}

function markDone(id) {
  if (miles === null) { alert('Set your current odometer first.'); return; }
  if (!records[id]) records[id] = {};
  const today = new Date().toISOString().split('T')[0];
  pushHistory(id, miles, today);
  records[id].lastMiles = miles;
  records[id].lastDate = today;
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
  // if we deleted the most recent, update lastMiles to next entry
  if (records[id].history.length > 0) {
    records[id].lastMiles = records[id].history[0].miles;
    records[id].lastDate  = records[id].history[0].date;
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
    if (parsed) {
      const date = records[id].lastDate || new Date().toISOString().split('T')[0];
      pushHistory(id, parsed, date);
    }
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
