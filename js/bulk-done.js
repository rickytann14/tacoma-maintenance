function getItemStatus(item) {
  if (item.interval !== undefined) {
    // custom item
    if (miles === null) return 'unknown';
    const rec = records[item.id] || {};
    const lastDone = rec.lastMiles || 0;
    const rem = (lastDone + item.interval) - miles;
    if (rem <= 0) return 'overdue';
    if (rem <= 1500) return 'soon';
    return 'ok';
  }
  return getStatus(item);
}

function openBulkModal() {
  if (miles === null) { alert('Set your current odometer first.'); return; }

  document.getElementById('bulkModalSubtitle').textContent =
    'Select items completed today at ' + miles.toLocaleString() + ' mi';

  const allItems = [
    ...ITEMS.filter(item => !nonServiceable[item.id]),
    ...customItems
  ];

  document.getElementById('bulkItemList').innerHTML = allItems.map(item => {
    const status = getItemStatus(item);
    const preChecked = status === 'overdue' || status === 'soon';
    return `<label class="bulk-item-check">
      <input type="checkbox" value="${item.id}" ${preChecked ? 'checked' : ''}>
      <span class="bulk-item-name">${item.name}</span>
      ${status === 'overdue' ? '<span class="bulk-status-pill overdue">Overdue</span>' :
        status === 'soon' ? '<span class="bulk-status-pill soon">Due Soon</span>' : ''}
    </label>`;
  }).join('');

  document.getElementById('bulkNotes').value = '';
  document.getElementById('bulkDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('bulkModal').classList.add('open');
}

function closeBulkModal() {
  document.getElementById('bulkModal').classList.remove('open');
  document.getElementById('bulkNotes').value = '';
  document.getElementById('bulkDate').value = '';
}

function saveBulkDone() {
  const checked = Array.from(
    document.querySelectorAll('#bulkItemList input[type=checkbox]:checked')
  ).map(el => el.value);

  if (checked.length === 0) { alert('Select at least one item.'); return; }

  const notes = document.getElementById('bulkNotes').value.trim();
  const today = document.getElementById('bulkDate').value || new Date().toISOString().split('T')[0];

  checked.forEach(id => {
    if (!records[id]) records[id] = {};
    pushHistory(id, miles, today, notes);
    records[id].lastMiles = miles;
    records[id].lastDate = today;
  });

  save();
  closeBulkModal();
  renderAll();
}
