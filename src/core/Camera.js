/* 🐋 Whale Civilization 3 — Camera System
   Handles panning, zooming, and viewport for the hex map */

export class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.minZoom = 0.3;
        this.maxZoom = 3;
        this.width = canvasWidth;
        this.height = canvasHeight;
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    pan(dx, dy) {
        this.x -= dx / this.zoom;
        this.y -= dy / this.zoom;
    }

    zoomAt(factor, screenX, screenY) {
        const worldBefore = this.screenToWorld(screenX, screenY);
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * factor));
        const worldAfter = this.screenToWorld(screenX, screenY);
        this.x += worldBefore.x - worldAfter.x;
        this.y += worldBefore.y - worldAfter.y;
    }

    screenToWorld(sx, sy) {
        return {
            x: sx / this.zoom + this.x,
            y: sy / this.zoom + this.y,
        };
    }

    worldToScreen(wx, wy) {
        return {
            x: (wx - this.x) * this.zoom,
            y: (wy - this.y) * this.zoom,
        };
    }

    centerOn(wx, wy) {
        this.x = wx - this.width / (2 * this.zoom);
        this.y = wy - this.height / (2 * this.zoom);
    }

    applyTransform(ctx) {
        ctx.setTransform(this.zoom, 0, 0, this.zoom, -this.x * this.zoom, -this.y * this.zoom);
    }
}
