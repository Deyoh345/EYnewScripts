const { createCanvas } = require('canvas');

function createLoadingCanvas() {
    const canvas = createCanvas(500, 150);
    const ctx = canvas.getContext('2d');
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 500, 150);
    grad.addColorStop(0, '#4f8cff');
    grad.addColorStop(1, '#a1ffce');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 150);
    // Title
    ctx.font = 'bold 32px Segoe UI';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Switching to Python...', 250, 50);
    // Loading bar background
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(50, 80, 400, 30);
    // Loading bar progress
    ctx.fillStyle = '#00e676';
    ctx.fillRect(50, 80, 200, 30);
    // Loading bar border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 80, 400, 30);
    // Loading text
    ctx.font = '20px Segoe UI';
    ctx.fillStyle = '#fff';
    ctx.fillText('Loading...', 250, 110);
    return canvas;
}

function createDoneCanvas() {
    const canvas = createCanvas(500, 150);
    const ctx = canvas.getContext('2d');
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 500, 150);
    grad.addColorStop(0, '#43e97b');
    grad.addColorStop(1, '#38f9d7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 150);
    // Title
    ctx.font = 'bold 32px Segoe UI';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Success!', 250, 50);
    // Full bar
    ctx.fillStyle = '#00e676';
    ctx.fillRect(50, 80, 400, 30);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 80, 400, 30);
    // Done text
    ctx.font = '20px Segoe UI';
    ctx.fillStyle = '#fff';
    ctx.fillText('Bahasa bot telah diganti ke Python!', 250, 110);
    return canvas;
}

module.exports = {
    createLoadingCanvas,
    createDoneCanvas
};
