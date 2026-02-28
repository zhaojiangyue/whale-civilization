/* 🐋 Whale Civilization 3 — Floating Text Renderer */

const floatingTexts = [];

export function addFloatingText(text, x, y, color = '#00f5d4', duration = 1500) {
    floatingTexts.push({
        text, x, y, color,
        startTime: performance.now(),
        duration,
        alpha: 1,
    });
}

export function renderFloatingTexts(ctx, camera) {
    const now = performance.now();
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        const elapsed = now - ft.startTime;
        const t = elapsed / ft.duration;

        if (t >= 1) {
            floatingTexts.splice(i, 1);
            continue;
        }

        const screen = camera.worldToScreen(ft.x, ft.y - t * 40);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset to screen coords
        ctx.globalAlpha = 1 - t;
        ctx.font = `bold 14px 'Outfit', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, screen.x, screen.y);
        ctx.fillText(ft.text, screen.x, screen.y);
        ctx.restore();
    }
}
