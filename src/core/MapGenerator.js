/* 🐋 Whale Civilization 3 — Procedural Map Generator
   Creates a hex ocean with biomes, depth, resources, and arctic overlay */

import { hexKey, hexDistance } from './HexGrid.js';
import { BIOMES, RESOURCE_LIST } from '../data/biomes.js';

function mulberry32(seed) {
    return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function makeNoise(rng) {
    const perm = new Uint8Array(512);
    for (let i = 0; i < 256; i++) perm[i] = i;
    for (let i = 255; i > 0; i--) {
        const j = (rng() * (i + 1)) | 0;
        [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

    function hash(x, y) {
        return perm[(perm[x & 255] + y) & 255] / 255;
    }

    return function noise(x, y, scale = 1) {
        x *= scale; y *= scale;
        const ix = Math.floor(x), iy = Math.floor(y);
        const fx = x - ix, fy = y - iy;
        const a = hash(ix, iy), b = hash(ix + 1, iy);
        const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
        const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
        return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    };
}

export function generateMap(cols, rows) {
    const rng = mulberry32(Date.now());
    const noise = makeNoise(rng);
    const tiles = new Map();
    const cx = cols / 2, cy = rows / 2;
    const maxDist = Math.max(cols, rows) * 0.45;

    for (let r = 0; r < rows; r++) {
        for (let q = 0; q < cols; q++) {
            const dist = Math.sqrt((q - cx) ** 2 + (r - cy) ** 2);
            if (dist > maxDist) continue;

            const key = hexKey(q, r);
            const elevation = noise(q, r, 0.08);
            const moisture = noise(q + 100, r + 100, 0.06);
            const temperature = 1 - (Math.abs(r - cy) / (rows * 0.5));

            let biome;
            if (elevation > 0.75 && dist < maxDist * 0.3) {
                biome = BIOMES.land;
            } else if (temperature < 0.2) {
                biome = BIOMES.arctic;
            } else if (elevation > 0.6) {
                biome = moisture > 0.5 ? BIOMES.kelp_forest : BIOMES.shallow;
            } else if (elevation > 0.45) {
                biome = moisture > 0.6 ? BIOMES.coral_reef : (temperature > 0.7 ? BIOMES.tropical : BIOMES.shallow);
            } else if (elevation > 0.3) {
                biome = BIOMES.open_ocean;
            } else if (elevation > 0.15) {
                biome = BIOMES.deep;
            } else {
                biome = BIOMES.abyss;
            }

            // Special tiles
            const specialRoll = rng();
            let hasKrill = false, hasFishSchool = false, hasStorm = false;
            let specialResource = null;

            if (biome !== BIOMES.land) {
                if (specialRoll < 0.05) {
                    biome = BIOMES.volcanic_vent;
                } else if (specialRoll < 0.08) {
                    biome = BIOMES.song_reef;
                } else if (specialRoll < 0.11) {
                    biome = BIOMES.bioluminescent;
                }

                if (rng() < 0.12) hasKrill = true;
                if (rng() < 0.1) hasFishSchool = true;
                if (rng() < 0.03) hasStorm = true;
            }

            tiles.set(key, {
                q, r, biome,
                explored: false,
                hasKrill, hasFishSchool, hasStorm,
                specialResource,
                elevation,
                depth: elevation < 0.3 ? 'deep' : elevation < 0.5 ? 'mid' : 'shallow',
            });
        }
    }

    return tiles;
}

export function findStartPosition(tiles, cols, rows, existingStarts = []) {
    const candidates = [];
    for (const [, tile] of tiles) {
        if (tile.biome.impassable) continue;
        if (tile.hasStorm) continue;
        if (tile.biome === BIOMES.abyss || tile.biome === BIOMES.deep) continue;

        // Avoid edges
        const cx = cols / 2, cy = rows / 2;
        const dist = Math.sqrt((tile.q - cx) ** 2 + (tile.r - cy) ** 2);
        if (dist < cols * 0.1 || dist > cols * 0.35) continue;

        // Check distance from existing starts
        let tooClose = false;
        for (const s of existingStarts) {
            if (hexDistance(tile, s) < 12) { tooClose = true; break; }
        }
        if (tooClose) continue;

        candidates.push(tile);
    }

    if (candidates.length === 0) {
        // Fallback: just find any passable tile
        for (const [, tile] of tiles) {
            if (!tile.biome.impassable && !tile.hasStorm) {
                candidates.push(tile);
            }
        }
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    return { q: pick.q, r: pick.r };
}
