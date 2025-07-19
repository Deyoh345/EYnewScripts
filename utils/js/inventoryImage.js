const { createCanvas, loadImage } = require('canvas');

/**
 * Membuat gambar grid inventory 1024x1024, dengan garis kotak penuh hingga ke bawah gambar.
 * @param {Array<{nama: string, jumlah: number, icon?: string}>} items
 * @returns {Buffer} Buffer PNG hasil render
 */
function createInventoryImage(items) {
    const width = 1024;
    const height = 1024;
    // Hitung cell size dan grid
    let cols = 8;
    let rows = Math.ceil(items.length / cols) || 1;
    let cellSize = Math.floor(width / cols);
    // Pastikan grid penuh hingga bawah gambar
    rows = Math.floor((height - 84) / cellSize);
    if ((height - 84) % cellSize !== 0) rows++;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#fffbe6';
    ctx.fillRect(0, 0, width, height);

    // Judul
    ctx.font = 'bold 48px Segoe UI';
    ctx.fillStyle = '#bfa14a';
    ctx.textAlign = 'center';
    ctx.fillText('INVENTORY', width/2, 60);

    // Pembatas horizontal antara judul dan grid
    ctx.strokeStyle = '#bfa14a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(width, 80);
    ctx.stroke();

    // Grid dan item
    ctx.textAlign = 'center';
    for (let i = 0; i < cols * rows; i++) {
        const x = (i % cols) * cellSize;
        const y = Math.floor(i / cols) * cellSize + 84;
        // Kotak utama (selalu gambar grid penuh)
        ctx.strokeStyle = '#bfa14a';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, cellSize, cellSize);
        if (i < items.length) {
            // Area gambar item (kotak kecil di tengah)
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + cellSize/8, y + cellSize/8, cellSize*3/4, cellSize/2);
            // Nama item (max 12 char, di bawah gambar)
            ctx.font = `${Math.floor(cellSize/5)}px Segoe UI`;
            ctx.fillStyle = '#333';
            ctx.fillText((items[i].nama || '').slice(0, 12), x + cellSize/2, y + cellSize - 12);
            // Jumlah (pojok kanan bawah)
            ctx.font = `bold ${Math.floor(cellSize/5)}px Segoe UI`;
            ctx.fillStyle = '#7c5c1e';
            ctx.textAlign = 'right';
            ctx.fillText('x' + (items[i].jumlah || 1), x + cellSize - 8, y + cellSize - 8);
            ctx.textAlign = 'center';
            // (Optional) icon: jika ada items[i].icon, bisa loadImage dan drawImage di area gambar
        }
    }
    // Garis pembatas vertikal antar kolom (full grid)
    ctx.strokeStyle = '#e0c97a';
    ctx.lineWidth = 2;
    for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellSize, 84);
        ctx.lineTo(c * cellSize, 84 + rows * cellSize);
        ctx.stroke();
    }
    // Garis pembatas horizontal antar baris (full grid)
    for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, 84 + r * cellSize);
        ctx.lineTo(width, 84 + r * cellSize);
        ctx.stroke();
    }
    return canvas.toBuffer('image/png');
}

module.exports = { createInventoryImage };
