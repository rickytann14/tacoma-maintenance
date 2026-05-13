function ivl(item) { return (severeMode && item.severe) ? item.severe : item.normal; }

function getStatus(item) {
  if (nonServiceable[item.id]) return 'na';
  if (miles === null) return 'unknown';
  const rec = records[item.id];
  // No record logged — treat as if last done at 0 miles
  const lastDone = rec?.lastMiles || 0;
  const rem = (lastDone + ivl(item)) - miles;
  if (rem <= 0) return 'overdue';
  if (rem <= 1500) return 'soon';
  return 'ok';
}

function getRem(item) {
  if (nonServiceable[item.id]) return null;
  if (miles === null) return null;
  const rec = records[item.id];
  const lastDone = rec?.lastMiles || 0;
  return (lastDone + ivl(item)) - miles;
}

function getProg(item) {
  if (nonServiceable[item.id]) return 0;
  if (miles === null) return 0;
  const rec = records[item.id];
  const lastDone = rec?.lastMiles || 0;
  return Math.min(100, Math.max(0, ((miles - lastDone) / ivl(item)) * 100));
}

function fmt(n) { return Math.abs(n).toLocaleString(); }

function calcAvgMilesPerDay() {
  if (miles === null) return null;
  let allEntries = [];
  Object.values(records).forEach(rec => {
    if (rec.history) {
      rec.history.forEach(h => {
        if (h.miles != null && h.date) allEntries.push(h);
      });
    }
  });
  if (allEntries.length === 0) return null;
  allEntries.sort((a, b) => a.miles - b.miles);
  const oldest = allEntries[0];
  const oldestDate = new Date(oldest.date);
  const today = new Date();
  const daysDiff = (today - oldestDate) / 86400000;
  if (daysDiff < 7) return null;
  const milesDiff = miles - oldest.miles;
  if (milesDiff <= 0) return null;
  return milesDiff / daysDiff;
}

function getEstDueDate(rem) {
  if (rem === null || rem <= 0) return null;
  const avg = calcAvgMilesPerDay();
  if (!avg || avg <= 0) return null;
  const daysUntil = rem / avg;
  const estDate = new Date(Date.now() + daysUntil * 86400000);
  return '~' + estDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}
