// close modal on overlay click or Escape
document.getElementById('customModal').addEventListener('click', function(e) {
  if (e.target === this) closeCustomModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCustomModal(); });

document.getElementById('odoInput').addEventListener('keydown', e => { if (e.key === 'Enter') setMiles(); });

let wasCompactSidebar = null;

function syncResponsiveSidebar() {
  const sidebarMore = document.getElementById('sidebarMore');
  if (!sidebarMore) return;

  const isCompact = window.matchMedia('(max-width: 768px)').matches;
  if (isCompact === wasCompactSidebar) return;

  sidebarMore.open = !isCompact;
  wasCompactSidebar = isCompact;
}

window.addEventListener('resize', syncResponsiveSidebar);

load();
applySavedTruckImage();
syncResponsiveSidebar();
renderAll();
