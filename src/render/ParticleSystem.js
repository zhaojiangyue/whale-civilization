/* 🐋 Whale Civilization 3 — Particle System */

const particles = [];

export function emitParticles(x, y, color = '#00f5d4', count = 8, speed = 1) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed * (1 + Math.random()),
            vy: Math.sin(angle) * speed * (1 + Math.random()),
            life: 1,
            decay: 0.015 + Math.random() * 0.01,
            size: 2 + Math.random() * 3,
            color,
        });
    }
}

export function renderParticles(ctx, dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.vy += 0.02; // slight gravity

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
