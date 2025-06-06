// src/renderer/js/chart.js

/**
 * Render a sparkline chart into a <canvas> element
 * @param {HTMLCanvasElement} canvas
 * @param {number[]} dataArray - List of historical prices
 */
export function renderSparkline(canvas, dataArray) {
    if (!canvas || !Array.isArray(dataArray) || dataArray.length < 2) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;  // Match actual size
    const height = canvas.height = canvas.offsetHeight;

    const min = Math.min(...dataArray);
    const max = Math.max(...dataArray);
    const range = max - min || 1;
    const stepX = width / (dataArray.length - 1);

    // Get color based on theme
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const strokeColor = isLight ? '#007755' : '#00ff88';

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.imageSmoothingEnabled = false;
    ctx.beginPath();

    dataArray.forEach((value, index) => {
        const x = Math.round(index * stepX);
        const y = Math.round(height - ((value - min) / range) * height);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}
