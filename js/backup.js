function exportData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    miles,
    severeMode,
    records,
    customItems,
    nonServiceable,
    truckImgData: localStorage.getItem('tm3_truck_img_data'),
    truckImgLabel: localStorage.getItem('tm3_truck_img_label')
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().split('T')[0];
  a.download = `tacoma-maintenance-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.version !== 1 || typeof data.records !== 'object') {
        alert('Invalid backup file. Please use a file exported from this tracker.');
        return;
      }
      if (!confirm(`Load backup from ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : 'unknown date'}?\n\nThis will replace your current data.`)) return;
      miles = data.miles ?? null;
      severeMode = data.severeMode ?? false;
      records = data.records ?? {};
      customItems = data.customItems ?? [];
      nonServiceable = data.nonServiceable ?? {};
      if (data.truckImgData) localStorage.setItem('tm3_truck_img_data', data.truckImgData);
      if (data.truckImgLabel) localStorage.setItem('tm3_truck_img_label', data.truckImgLabel);
      save();
      applySavedTruckImage();
      renderAll();
    } catch(err) {
      alert('Could not read file. Make sure it is a valid JSON backup.');
    }
    // reset input so same file can be re-loaded if needed
    event.target.value = '';
  };
  reader.readAsText(file);
}
