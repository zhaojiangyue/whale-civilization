/* 🐋 Whale Civilization 3 — Animated Whale Renderer
   Canvas-drawn whale sprites with species-specific shapes AND unit-type visual modifiers */

import { hexToPixel, HEX_SIZE } from '../core/HexGrid.js';

// Species-specific whale drawing configs
const WHALE_SHAPES = {
    blue_whale: {
        bodyColor: '#3b82f6',
        bellyColor: '#93c5fd',
        finColor: '#2563eb',
        bodyLen: 18, bodyH: 7,
        tailSize: 8, finSize: 5,
        hasDorsal: true, dorsalH: 4,
        spots: false,
        label: '🐋',
    },
    humpback: {
        bodyColor: '#475569',
        bellyColor: '#94a3b8',
        finColor: '#334155',
        bodyLen: 16, bodyH: 8,
        tailSize: 10, finSize: 8,
        hasDorsal: true, dorsalH: 3,
        spots: true, spotColor: '#e2e8f0',
        label: '🐳',
    },
    sperm_whale: {
        bodyColor: '#78716c',
        bellyColor: '#a8a29e',
        finColor: '#57534e',
        bodyLen: 20, bodyH: 9,
        tailSize: 7, finSize: 4,
        hasDorsal: false,
        spots: false,
        headRatio: 0.4,
        label: '🐋',
    },
    orca: {
        bodyColor: '#1e293b',
        bellyColor: '#f8fafc',
        finColor: '#0f172a',
        bodyLen: 15, bodyH: 7,
        tailSize: 8, finSize: 5,
        hasDorsal: true, dorsalH: 8,
        spots: false,
        eyePatch: true, eyePatchColor: '#f8fafc',
        label: '🐬',
    },
    beluga: {
        bodyColor: '#e2e8f0',
        bellyColor: '#f8fafc',
        finColor: '#cbd5e1',
        bodyLen: 13, bodyH: 7,
        tailSize: 6, finSize: 4,
        hasDorsal: false,
        spots: false,
        melon: true,
        label: '🐋',
    },
    narwhal: {
        bodyColor: '#64748b',
        bellyColor: '#94a3b8',
        finColor: '#475569',
        bodyLen: 14, bodyH: 6,
        tailSize: 6, finSize: 4,
        hasDorsal: false,
        spots: true, spotColor: '#e2e8f0',
        tusk: true, tuskLen: 12,
        label: '🦄',
    },
};

// Unit-type visual modifiers
const TYPE_MODIFIERS = {
    matriarch: { scaleMult: 1.2, bodyHMult: 1.1, dorsalMult: 1.0, hasCrown: true, hasScars: true, eyeMult: 1.3 },
    bull: { scaleMult: 1.15, bodyHMult: 1.2, dorsalMult: 2.0, hasBattleScars: true, eyeMult: 0.9 },
    scout: { scaleMult: 0.85, bodyHMult: 0.75, bodyLenMult: 1.15, dorsalMult: 0.7, hasSpeedLines: true, eyeMult: 1.0 },
    calf: { scaleMult: 0.65, bodyHMult: 1.2, bodyLenMult: 0.85, dorsalMult: 0.3, eyeMult: 1.8, noDorsal: true },
    adult: { scaleMult: 1.0, bodyHMult: 1.0, dorsalMult: 1.0, eyeMult: 1.0 },
    great_whale: { scaleMult: 1.4, bodyHMult: 1.15, dorsalMult: 1.5, hasCrown: true, hasScars: true, eyeMult: 1.2 },
};

export function drawWhale(ctx, x, y, factionId, facing, swimPhase, scale = 1, isSelected = false, glowAlpha = 0, typeId = 'adult') {
    const baseShape = WHALE_SHAPES[factionId] || WHALE_SHAPES.blue_whale;
    const mod = TYPE_MODIFIERS[typeId] || TYPE_MODIFIERS.adult;

    const shape = {
        ...baseShape,
        bodyLen: baseShape.bodyLen * (mod.bodyLenMult || 1),
        bodyH: baseShape.bodyH * (mod.bodyHMult || 1),
        dorsalH: baseShape.dorsalH * (mod.dorsalMult || 1),
    };

    const s = scale * (mod.scaleMult || 1);

    ctx.save();
    ctx.translate(x, y);

    const facingLeft = Math.abs(facing) > Math.PI / 2;
    if (facingLeft) ctx.scale(-1, 1);
    const tilt = facingLeft ? Math.sin(facing + Math.PI) * 0.15 : Math.sin(facing) * 0.15;
    ctx.rotate(tilt);

    const tailWave = Math.sin(swimPhase * 2) * 0.15;

    // Selection ring
    if (isSelected) {
        ctx.save();
        ctx.rotate(-tilt);
        ctx.beginPath();
        ctx.arc(0, 0, shape.bodyLen * s * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (glowAlpha > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, shape.bodyLen * s * 1.0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 245, 212, ${glowAlpha * 0.4})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    }

    // Shadow
    ctx.save(); ctx.rotate(-tilt);
    ctx.beginPath();
    ctx.ellipse(0, HEX_SIZE * 0.22, shape.bodyLen * s * 0.6, 4 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fill();
    ctx.restore();

    // Scout speed lines
    if (mod.hasSpeedLines) {
        ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = shape.bodyColor; ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const lx = -shape.bodyLen * s * (0.8 + i * 0.3);
            const ly = (-1 + i) * 3 * s;
            ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - 8 * s, ly); ctx.stroke();
        }
        ctx.globalAlpha = 1; ctx.restore();
    }

    // Tail flukes
    const tailX = -shape.bodyLen * s;
    ctx.save(); ctx.translate(tailX, 0); ctx.rotate(tailWave);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-shape.tailSize * s * 0.6, -shape.tailSize * s, -shape.tailSize * s, -shape.tailSize * s * 0.6);
    ctx.quadraticCurveTo(-shape.tailSize * s * 0.4, 0, -shape.tailSize * s, shape.tailSize * s * 0.6);
    ctx.quadraticCurveTo(-shape.tailSize * s * 0.6, shape.tailSize * s, 0, 0);
    ctx.fillStyle = shape.finColor; ctx.fill(); ctx.restore();

    // Body
    ctx.beginPath(); ctx.ellipse(0, 0, shape.bodyLen * s, shape.bodyH * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = shape.bodyColor; ctx.fill();

    // Belly
    ctx.beginPath();
    ctx.ellipse(0, shape.bodyH * s * 0.15, shape.bodyLen * s * 0.9, shape.bodyH * s * 0.6, 0, 0.1, Math.PI - 0.1);
    ctx.fillStyle = shape.bellyColor; ctx.fill();

    // Dorsal fin
    if (shape.hasDorsal && !mod.noDorsal) {
        const dorsalX = -shape.bodyLen * s * 0.15;
        const dH = shape.dorsalH * s;
        ctx.beginPath();
        ctx.moveTo(dorsalX - 3 * s, -shape.bodyH * s * 0.85);
        ctx.quadraticCurveTo(dorsalX + 1 * s, -shape.bodyH * s - dH * 1.3, dorsalX + 5 * s, -shape.bodyH * s * 0.85);
        ctx.fillStyle = shape.finColor; ctx.fill();
    }

    // Pectoral fins
    const pecX = shape.bodyLen * s * 0.15;
    const pecLen = shape.finSize * s;
    ctx.beginPath(); ctx.moveTo(pecX, -shape.bodyH * s * 0.6);
    ctx.quadraticCurveTo(pecX - pecLen * 0.5, -shape.bodyH * s - pecLen * 0.5, pecX - pecLen, -shape.bodyH * s * 0.4);
    ctx.fillStyle = shape.finColor; ctx.fill();
    ctx.beginPath(); ctx.moveTo(pecX, shape.bodyH * s * 0.6);
    ctx.quadraticCurveTo(pecX - pecLen * 0.5, shape.bodyH * s + pecLen * 0.5, pecX - pecLen, shape.bodyH * s * 0.4);
    ctx.fillStyle = shape.finColor; ctx.fill();

    // Melon (beluga)
    if (shape.melon) {
        ctx.beginPath(); ctx.arc(shape.bodyLen * s * 0.7, 0, shape.bodyH * s * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = shape.bodyColor; ctx.fill();
    }

    // Eye
    const eyeScale = mod.eyeMult || 1;
    const eyeX = shape.bodyLen * s * 0.55;
    const eyeY = -shape.bodyH * s * 0.25;
    if (shape.eyePatch) {
        ctx.beginPath(); ctx.ellipse(eyeX + 1, eyeY - 1, 4 * s, 3 * s, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = shape.eyePatchColor; ctx.fill();
    }
    const eyeR = 1.5 * s * eyeScale;
    ctx.beginPath(); ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e'; ctx.fill();
    ctx.beginPath(); ctx.arc(eyeX + 0.5, eyeY - 0.5, 0.5 * s * eyeScale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();

    // Spots
    if (shape.spots) {
        const spotPositions = [
            { x: -shape.bodyLen * s * 0.3, y: -shape.bodyH * s * 0.3 },
            { x: -shape.bodyLen * s * 0.1, y: shape.bodyH * s * 0.2 },
            { x: shape.bodyLen * s * 0.2, y: -shape.bodyH * s * 0.15 },
            { x: -shape.bodyLen * s * 0.5, y: shape.bodyH * s * 0.1 },
        ];
        for (const sp of spotPositions) {
            ctx.beginPath(); ctx.arc(sp.x, sp.y, 1.5 * s, 0, Math.PI * 2);
            ctx.fillStyle = shape.spotColor; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
        }
    }

    // Tusk (narwhal)
    if (shape.tusk) {
        ctx.beginPath(); ctx.moveTo(shape.bodyLen * s, 0);
        ctx.lineTo(shape.bodyLen * s + shape.tuskLen * s, -1);
        ctx.lineTo(shape.bodyLen * s + shape.tuskLen * s, 1); ctx.closePath();
        ctx.fillStyle = '#d4c9a8'; ctx.fill();
        for (let i = 0; i < 4; i++) {
            const gx = shape.bodyLen * s + shape.tuskLen * s * (0.2 + i * 0.2);
            ctx.beginPath(); ctx.moveTo(gx, -0.8); ctx.lineTo(gx + 1, 0.8);
            ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 0.5; ctx.stroke();
        }
    }

    // TYPE-SPECIFIC DECORATIONS

    // Matriarch crown star
    if (mod.hasCrown) {
        const crownX = shape.bodyLen * s * 0.45;
        const crownY = -shape.bodyH * s - 4 * s;
        ctx.save(); ctx.translate(crownX, crownY);
        ctx.beginPath();
        const spikes = 5, outerR = 3.5 * s, innerR = 1.5 * s;
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI / spikes) - Math.PI / 2;
            const sx = Math.cos(angle) * r, sy = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.closePath(); ctx.fillStyle = '#fbbf24'; ctx.fill();
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.restore();
    }

    // Wisdom scars
    if (mod.hasScars) {
        ctx.save(); ctx.globalAlpha = 0.3; ctx.strokeStyle = shape.bellyColor; ctx.lineWidth = 0.8;
        for (let i = 0; i < 3; i++) {
            const ly = shape.bodyH * s * (-0.1 + i * 0.15);
            ctx.beginPath(); ctx.moveTo(-shape.bodyLen * s * 0.4, ly);
            ctx.lineTo(shape.bodyLen * s * 0.1, ly + 1); ctx.stroke();
        }
        ctx.globalAlpha = 1; ctx.restore();
    }

    // Bull battle scars
    if (mod.hasBattleScars) {
        ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1;
        const bsx = -shape.bodyLen * s * 0.2, bsy = shape.bodyH * s * 0.1;
        ctx.beginPath();
        ctx.moveTo(bsx - 3 * s, bsy - 3 * s); ctx.lineTo(bsx + 3 * s, bsy + 3 * s);
        ctx.moveTo(bsx + 3 * s, bsy - 3 * s); ctx.lineTo(bsx - 3 * s, bsy + 3 * s);
        ctx.stroke(); ctx.globalAlpha = 1; ctx.restore();
    }

    ctx.restore();
}

export function getWhaleLabel(factionId) {
    return (WHALE_SHAPES[factionId] || WHALE_SHAPES.blue_whale).label;
}
