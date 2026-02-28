/* 🐋 Whale Civilization 3 — Unit Renderer
   Draws whale units with animated sprites and smooth movement */

import { hexToPixel, HEX_SIZE } from '../core/HexGrid.js';
import { drawWhale } from './WhaleSprite.js';

export class UnitRenderer {
    constructor(ctx, gameState) {
        this.ctx = ctx;
        this.state = gameState;
        this.bobTime = 0;
        this.animState = new WeakMap();
    }

    animateMove(unit, fromQ, fromR, toQ, toR, duration = 300) {
        const from = hexToPixel(fromQ, fromR);
        const to = hexToPixel(toQ, toR);
        const facing = Math.atan2(to.y - from.y, to.x - from.x);
        this.animState.set(unit, {
            fromX: from.x, fromY: from.y, toX: to.x, toY: to.y,
            facing, startTime: performance.now(), duration, active: true,
        });
    }

    render(dt) {
        this.bobTime += dt * 0.003;
        const ctx = this.ctx;
        const now = performance.now();

        for (const unit of this.state.units) {
            const key = `${unit.q},${unit.r}`;
            if (!this.state.visible.has(key) && unit.factionId !== this.state.playerFactionId) continue;

            let drawX, drawY, facing;
            const anim = this.animState.get(unit);

            if (anim && anim.active) {
                const elapsed = now - anim.startTime;
                const t = Math.min(1, elapsed / anim.duration);
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                drawX = anim.fromX + (anim.toX - anim.fromX) * ease;
                drawY = anim.fromY + (anim.toY - anim.fromY) * ease;
                facing = anim.facing;
                if (t >= 1) anim.active = false;
            } else {
                const pos = hexToPixel(unit.q, unit.r);
                drawX = pos.x;
                drawY = pos.y;
                facing = (anim && anim.facing !== undefined) ? anim.facing : -0.2;
            }

            // Bob animation
            const bob = Math.sin(this.bobTime + unit.q * 0.5 + unit.r * 0.3) * 3;
            drawY += bob;

            const isSelected = unit === this.state.selectedUnit;
            const glowAlpha = isSelected ? (Math.sin(this.bobTime * 3) * 0.3 + 0.5) : 0;

            drawWhale(ctx, drawX, drawY, unit.factionId, facing, this.bobTime, 1, isSelected, glowAlpha, unit.typeId || 'adult');

            // Health bar
            if (unit.hp < unit.maxHp) {
                const barW = 24, barH = 3;
                const barX = drawX - barW / 2, barY = drawY + 14;
                const hpPct = unit.hp / unit.maxHp;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(barX, barY, barW, barH);
                ctx.fillStyle = hpPct > 0.5 ? '#4ecdc4' : hpPct > 0.25 ? '#ffb347' : '#ff6b6b';
                ctx.fillRect(barX, barY, barW * hpPct, barH);
            }

            // Movement dots
            if (unit === this.state.selectedUnit && unit.movesLeft > 0) {
                for (let i = 0; i < unit.movesLeft; i++) {
                    ctx.beginPath();
                    ctx.arc(drawX - 8 + i * 6, drawY + 18, 2, 0, Math.PI * 2);
                    ctx.fillStyle = '#00f5d4';
                    ctx.fill();
                }
            }

            // Faction color dot
            if (unit.factionColor) {
                ctx.beginPath();
                ctx.arc(drawX + 12, drawY - 10, 4, 0, Math.PI * 2);
                ctx.fillStyle = unit.factionColor;
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.4)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            // Level badge
            if (unit.level > 1) {
                ctx.font = `bold 9px 'Outfit', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fbbf24';
                ctx.fillText(`Lv${unit.level}`, drawX, drawY + 22);
            }
        }
    }
}
