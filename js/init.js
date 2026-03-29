// close modal on overlay click or Escape
document.getElementById('customModal').addEventListener('click', function(e) {
  if (e.target === this) closeCustomModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCustomModal(); });

document.getElementById('odoInput').addEventListener('keydown', e => { if (e.key === 'Enter') setMiles(); });

load();
applySavedTruckImage();
renderAll();
