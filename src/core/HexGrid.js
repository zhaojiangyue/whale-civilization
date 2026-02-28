/* 🐋 Whale Civilization 3 — Hex Grid Utilities
   Pointy-top hex grid math for a 60×40 ocean map */

export const HEX_SIZE = 28;
const SQRT3 = Math.sqrt(3);

export function hexToPixel(q, r) {
    const x = HEX_SIZE * (SQRT3 * q + SQRT3 / 2 * r);
    const y = HEX_SIZE * (3 / 2 * r);
    return { x, y };
}

export function pixelToHex(x, y) {
    const q = (x * SQRT3 / 3 - y / 3) / HEX_SIZE;
    const r = y * 2 / 3 / HEX_SIZE;
    return hexRound(q, r);
}

function hexRound(q, r) {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);
    const dq = Math.abs(rq - q);
    const dr = Math.abs(rr - r);
    const ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs;
    else if (dr > ds) rr = -rq - rs;
    return { q: rq, r: rr };
}

export function hexKey(q, r) {
    return `${q},${r}`;
}

export function hexDistance(a, b) {
    const aq = a.q, ar = a.r, as = -aq - ar;
    const bq = b.q, br = b.r, bs = -bq - br;
    return Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as - bs));
}

export function hexNeighbors(q, r) {
    return [
        { q: q + 1, r: r },
        { q: q - 1, r: r },
        { q: q, r: r + 1 },
        { q: q, r: r - 1 },
        { q: q + 1, r: r - 1 },
        { q: q - 1, r: r + 1 },
    ];
}

export function hexesInRange(q, r, range) {
    const results = [];
    for (let dq = -range; dq <= range; dq++) {
        for (let dr = Math.max(-range, -dq - range); dr <= Math.min(range, -dq + range); dr++) {
            results.push({ q: q + dq, r: r + dr });
        }
    }
    return results;
}
