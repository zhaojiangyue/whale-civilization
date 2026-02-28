/* 🐋 Whale Civilization 3 — Hex Map Renderer */

import { hexToPixel, HEX_SIZE } from '../core/HexGrid.js';

const SQRT3 = Math.sqrt(3);

export class MapRenderer {
    constructor(canvas, camera, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = camera;
        this.state = gameState;
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.camera.resize(this.canvas.width, this.canvas.height);
    }

    render(moveRangeHexes = []) {
        const ctx = this.ctx;
        const cam = this.camera;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // Deep ocean gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#0c1222');
        grad.addColorStop(1, '#1a2744');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        cam.applyTransform(ctx);

        const moveSet = new Set(moveRangeHexes);

        for (const [key, tile] of this.state.tiles) {
            const { x, y } = hexToPixel(tile.q, tile.r);

            // Culling: skip tiles far off screen
            const screen = cam.worldToScreen(x, y);
            if (screen.x < -80 || screen.x > this.canvas.width + 80 ||
                screen.y < -80 || screen.y > this.canvas.height + 80) continue;

            const isExplored = this.state.explored.has(key);
            const isVisible = this.state.visible.has(key);

            if (!isExplored) {
                // Fog of war — dark hex
                this.drawHex(ctx, x, y, '#0a0f1a', 0.6);
                continue;
            }

            // Draw biome tile
            let alpha = isVisible ? 1 : 0.4;
            this.drawHex(ctx, x, y, tile.biome.color, alpha);

            // Grid lines
            ctx.globalAlpha = 0.15;
            this.drawHexOutline(ctx, x, y, '#ffffff');
            ctx.globalAlpha = 1;

            // Move range highlight
            if (moveSet.has(key)) {
                this.drawHex(ctx, x, y, '#00f5d4', 0.2);
                ctx.globalAlpha = 0.6;
                this.drawHexOutline(ctx, x, y, '#00f5d4');
                ctx.globalAlpha = 1;
            }

            // Resource icons (only visible tiles)
            if (isVisible) {
                if (tile.hasKrill) {
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('🦐', x - 8, y + 12);
                }
                if (tile.hasFishSchool) {
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('🐟', x + 8, y + 12);
                }
                if (tile.hasStorm) {
                    ctx.font = '14px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('⛈️', x, y - 8);
                }
            }
        }
    }

    drawHex(ctx, x, y, color, alpha = 1) {
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 180 * (60 * i - 30);
            const hx = x + HEX_SIZE * Math.cos(angle);
            const hy = y + HEX_SIZE * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    drawHexOutline(ctx, x, y, color) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 180 * (60 * i - 30);
            const hx = x + HEX_SIZE * Math.cos(angle);
            const hy = y + HEX_SIZE * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
