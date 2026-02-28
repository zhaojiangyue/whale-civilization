/* 🐋 Whale Civilization 3 — AI Controller
   Species-based personality AI for computer-controlled factions */

import { hexNeighbors, hexKey, hexDistance } from '../core/HexGrid.js';

const AI_PERSONALITY = {
    blue_whale: { explore: 0.4, feed: 0.4, aggression: 0.05, sing: 0.15 },
    humpback: { explore: 0.2, feed: 0.2, aggression: 0.05, sing: 0.55 },
    sperm_whale: { explore: 0.6, feed: 0.2, aggression: 0.1, sing: 0.1 },
    orca: { explore: 0.2, feed: 0.2, aggression: 0.45, sing: 0.15 },
    beluga: { explore: 0.5, feed: 0.2, aggression: 0.05, sing: 0.25 },
    narwhal: { explore: 0.5, feed: 0.3, aggression: 0.1, sing: 0.1 },
};

export function doAITurn(state) {
    for (const aiFac of state.aiFactions) {
        const personality = AI_PERSONALITY[aiFac.id] || AI_PERSONALITY.blue_whale;
        const aiUnits = state.units.filter(u => u.factionId === aiFac.id);
        for (const unit of aiUnits) {
            if (unit.movesLeft <= 0) continue;
            executeAIUnitAction(unit, state, personality);
        }
    }
}

function executeAIUnitAction(unit, state, personality) {
    const roll = Math.random();
    if (roll < personality.feed) moveTowardFood(unit, state);
    else if (roll < personality.feed + personality.explore) moveExplore(unit, state);
    else if (roll < personality.feed + personality.explore + personality.aggression) moveTowardEnemy(unit, state);
    else moveRandom(unit, state);
}

function moveTowardFood(unit, state) {
    const neighbors = hexNeighbors(unit.q, unit.r);
    let bestTile = null, bestScore = -1;
    for (const nb of neighbors) {
        const key = hexKey(nb.q, nb.r);
        const tile = state.tiles.get(key);
        if (!tile || tile.hasStorm || tile.biome.impassable) continue;
        let score = tile.biome.vitality;
        if (tile.hasKrill) score += 5;
        if (tile.hasFishSchool) score += 4;
        if (state.units.some(u => u.q === nb.q && u.r === nb.r)) score -= 2;
        if (score > bestScore) { bestScore = score; bestTile = nb; }
    }
    if (bestTile) { unit.q = bestTile.q; unit.r = bestTile.r; unit.movesLeft--; }
    else moveRandom(unit, state);
}

function moveExplore(unit, state) {
    const neighbors = hexNeighbors(unit.q, unit.r);
    const valid = neighbors.filter(nb => {
        const tile = state.tiles.get(hexKey(nb.q, nb.r));
        return tile && !tile.hasStorm && !tile.biome.impassable;
    });
    if (valid.length > 0) {
        const target = valid[Math.floor(Math.random() * valid.length)];
        unit.q = target.q; unit.r = target.r; unit.movesLeft--;
    }
}

function moveTowardEnemy(unit, state) {
    const enemies = state.units.filter(u => u.factionId !== unit.factionId);
    if (enemies.length === 0) { moveRandom(unit, state); return; }
    let nearest = null, nearestDist = Infinity;
    for (const enemy of enemies) {
        const d = hexDistance(unit, enemy);
        if (d < nearestDist) { nearestDist = d; nearest = enemy; }
    }
    if (nearest && nearestDist > 1) {
        const neighbors = hexNeighbors(unit.q, unit.r);
        let bestNb = null, bestDist = nearestDist;
        for (const nb of neighbors) {
            const tile = state.tiles.get(hexKey(nb.q, nb.r));
            if (!tile || tile.hasStorm || tile.biome.impassable) continue;
            const d = hexDistance(nb, nearest);
            if (d < bestDist) { bestDist = d; bestNb = nb; }
        }
        if (bestNb) { unit.q = bestNb.q; unit.r = bestNb.r; unit.movesLeft--; }
    }
}

function moveRandom(unit, state) {
    const neighbors = hexNeighbors(unit.q, unit.r);
    const valid = neighbors.filter(nb => {
        const tile = state.tiles.get(hexKey(nb.q, nb.r));
        return tile && !tile.hasStorm && !tile.biome.impassable;
    });
    if (valid.length > 0) {
        const target = valid[Math.floor(Math.random() * valid.length)];
        unit.q = target.q; unit.r = target.r; unit.movesLeft--;
    }
}
