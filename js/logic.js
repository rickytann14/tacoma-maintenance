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
