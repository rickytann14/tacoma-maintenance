function save() {
  localStorage.setItem('tm3_miles', miles ?? '');
  localStorage.setItem('tm3_severe', severeMode ? '1' : '');
  localStorage.setItem('tm3_na', JSON.stringify(nonServiceable));
  localStorage.setItem('tm3_custom', JSON.stringify(customItems));
  localStorage.setItem('tm3_records', JSON.stringify(records));
}
function load() {
  const m = localStorage.getItem('tm3_miles');
  miles = m ? parseInt(m) : null;
  severeMode = localStorage.getItem('tm3_severe') === '1';
  try { records = JSON.parse(localStorage.getItem('tm3_records') || '{}'); } catch(e){}
  try { nonServiceable = JSON.parse(localStorage.getItem('tm3_na') || '{}'); } catch(e){}
  try { customItems = JSON.parse(localStorage.getItem('tm3_custom') || '[]'); } catch(e){}
}

function applySavedTruckImage() {
  const img = document.getElementById('truckImg');
  const label = document.getElementById('truckImgLabel');
  if (!img || !label) return;

  const savedSrc = localStorage.getItem('tm3_truck_img_data');
  const savedLabel = localStorage.getItem('tm3_truck_img_label');
  if (savedSrc) img.src = savedSrc;
  if (savedLabel) label.textContent = savedLabel;
}

function changeTruckImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file.');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target?.result;
    if (typeof dataUrl !== 'string') return;

    const img = document.getElementById('truckImg');
    const label = document.getElementById('truckImgLabel');
    if (!img || !label) return;

    img.src = dataUrl;
    const cleanName = file.name.replace(/\.[^.]+$/, '');
    label.textContent = cleanName || defaultTruckImageLabel;
    localStorage.setItem('tm3_truck_img_data', dataUrl);
    localStorage.setItem('tm3_truck_img_label', label.textContent);
  };
  reader.readAsDataURL(file);
}

function resetTruckImage() {
  const img = document.getElementById('truckImg');
  const label = document.getElementById('truckImgLabel');
  if (!img || !label) return;

  img.src = defaultTruckImageSrc;
  label.textContent = defaultTruckImageLabel;
  localStorage.removeItem('tm3_truck_img_data');
  localStorage.removeItem('tm3_truck_img_label');

  const input = document.getElementById('truckImageFile');
  if (input) input.value = '';
}
