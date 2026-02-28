/* 🐋 Whale Civilization 3 — A* Pathfinding for hex grids */

import { hexNeighbors, hexKey, hexDistance } from '../core/HexGrid.js';

export function findPath(start, goal, state, maxRange = 20) {
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    const startKey = hexKey(start.q, start.r);
    const goalKey = hexKey(goal.q, goal.r);

    gScore.set(startKey, 0);
    fScore.set(startKey, hexDistance(start, goal));

    while (openSet.length > 0) {
        openSet.sort((a, b) => (fScore.get(hexKey(a.q, a.r)) || Infinity) - (fScore.get(hexKey(b.q, b.r)) || Infinity));
        const current = openSet.shift();
        const curKey = hexKey(current.q, current.r);

        if (curKey === goalKey) {
            const path = [];
            let c = curKey;
            while (c) {
                const [cq, cr] = c.split(',').map(Number);
                path.unshift({ q: cq, r: cr });
                c = cameFrom.get(c);
            }
            return path;
        }

        for (const nb of hexNeighbors(current.q, current.r)) {
            const nbKey = hexKey(nb.q, nb.r);
            const tile = state.tiles.get(nbKey);
            if (!tile || tile.biome.impassable || tile.hasStorm) continue;

            const tentG = (gScore.get(curKey) || 0) + 1;
            if (tentG > maxRange) continue;

            if (tentG < (gScore.get(nbKey) || Infinity)) {
                cameFrom.set(nbKey, curKey);
                gScore.set(nbKey, tentG);
                fScore.set(nbKey, tentG + hexDistance(nb, goal));
                if (!openSet.some(o => hexKey(o.q, o.r) === nbKey)) {
                    openSet.push(nb);
                }
            }
        }
    }

    return null; // No path found
}

export function getReachableHexes(start, movesLeft, state) {
    const reachable = new Set();
    const queue = [{ ...start, cost: 0 }];
    const visited = new Set();
    visited.add(hexKey(start.q, start.r));

    while (queue.length > 0) {
        const current = queue.shift();
        if (current.cost <= movesLeft) {
            reachable.add(hexKey(current.q, current.r));
        }
        if (current.cost >= movesLeft) continue;

        for (const nb of hexNeighbors(current.q, current.r)) {
            const nbKey = hexKey(nb.q, nb.r);
            if (visited.has(nbKey)) continue;
            const tile = state.tiles.get(nbKey);
            if (!tile || tile.biome.impassable || tile.hasStorm) continue;
            visited.add(nbKey);
            queue.push({ q: nb.q, r: nb.r, cost: current.cost + 1 });
        }
    }

    reachable.delete(hexKey(start.q, start.r));
    return reachable;
}
