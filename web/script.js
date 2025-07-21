// script.js
const tipeSelect = document.getElementById('tipe');
const solidInput = document.getElementById('solidInput');
const gradientInput = document.getElementById('gradientInput');
const holoInput = document.getElementById('holoInput');
const form = document.getElementById('roleForm');
const result = document.getElementById('result');

tipeSelect.addEventListener('change', function() {
  if (this.value === 'solid') {
    solidInput.style.display = '';
    gradientInput.style.display = 'none';
    holoInput.style.display = 'none';
  } else if (this.value === 'gradient') {
    solidInput.style.display = 'none';
    gradientInput.style.display = '';
    holoInput.style.display = 'none';
  } else {
    solidInput.style.display = 'none';
    gradientInput.style.display = 'none';
    holoInput.style.display = '';
  }
});

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const fd = new FormData(form);
  const tipe = fd.get('tipe');
  let data = {
    nama: fd.get('nama'),
    tipe
  };
  if (tipe === 'solid') {
    data.warna1 = fd.get('warna1');
  } else if (tipe === 'gradient') {
    data.warna1 = fd.getAll('warna1')[0];
    data.warna2 = fd.get('warna2');
    const iconFile = fd.get('icon');
    if (iconFile && iconFile.size > 0) {
      // Upload icon ke backend, dapatkan URL
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });
      const uploadData = await uploadRes.json();
      data.icon = uploadData.url;
    }
  }
  // Kirim data ke backend
  const res = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    result.textContent = 'Permintaan berhasil dikirim!';
    form.reset();
    tipeSelect.value = 'solid';
    solidInput.style.display = '';
    gradientInput.style.display = 'none';
    holoInput.style.display = 'none';
  } else {
    result.textContent = 'Gagal mengirim permintaan.';
  }
});
