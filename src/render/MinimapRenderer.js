/* 🐋 Whale Civilization 3 — Minimap Renderer */

import { hexToPixel } from '../core/HexGrid.js';

export class MinimapRenderer {
    constructor(canvas, camera, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = camera;
        this.state = gameState;
        this.canvas.width = 220;
        this.canvas.height = 140;
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#0a0f1a';
        ctx.fillRect(0, 0, w, h);

        if (this.state.tiles.size === 0) return;

        // Calculate bounds
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const [, tile] of this.state.tiles) {
            const { x, y } = hexToPixel(tile.q, tile.r);
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        const mapW = maxX - minX || 1;
        const mapH = maxY - minY || 1;
        const scale = Math.min((w - 10) / mapW, (h - 10) / mapH);
        const ox = (w - mapW * scale) / 2;
        const oy = (h - mapH * scale) / 2;

        // Draw explored tiles
        for (const [key, tile] of this.state.tiles) {
            if (!this.state.explored.has(key)) continue;
            const { x, y } = hexToPixel(tile.q, tile.r);
            const sx = ox + (x - minX) * scale;
            const sy = oy + (y - minY) * scale;

            ctx.fillStyle = tile.biome.color;
            ctx.globalAlpha = this.state.visible.has(key) ? 0.8 : 0.3;
            ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
        }
        ctx.globalAlpha = 1;

        // Draw units
        for (const unit of this.state.units) {
            const { x, y } = hexToPixel(unit.q, unit.r);
            const sx = ox + (x - minX) * scale;
            const sy = oy + (y - minY) * scale;
            ctx.beginPath();
            ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = unit.factionColor || '#ffffff';
            ctx.fill();
        }

        // Viewport rectangle
        const vx1 = ox + (this.camera.x - minX) * scale;
        const vy1 = oy + (this.camera.y - minY) * scale;
        const vw = (this.camera.width / this.camera.zoom) * scale;
        const vh = (this.camera.height / this.camera.zoom) * scale;

        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(vx1, vy1, vw, vh);
    }
}
