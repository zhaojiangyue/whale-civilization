/* 🐋 Whale Civilization 3 — Pod System (breeding & calf maturation) */

import { createUnit } from '../data/units.js';

export function processBreeeding(state) {
    if (state.season.id !== 'breeding') return [];

    const playerUnits = state.units.filter(u => u.factionId === state.playerFactionId && !u.isCalf);
    if (playerUnits.length < 2 || state.resources.vitality < 20) return [];

    // Find mother (matriarch preferred)
    const mother = playerUnits.find(u => u.typeId === 'matriarch') || playerUnits[0];
    state.resources.vitality -= 20;

    const calf = createUnit('calf', state.playerFactionId, mother.factionColor, mother.q, mother.r);
    state.units.push(calf);

    return [calf];
}

export function matureCalves(state) {
    const matured = [];
    for (const unit of state.units) {
        if (!unit.isCalf) continue;
        unit.calfTurns--;
        if (unit.calfTurns <= 0) {
            // Mature into adult
            unit.typeId = 'adult';
            unit.typeName = 'Whale';
            unit.isCalf = false;
            unit.maxHp = 100;
            unit.hp = 100;
            unit.strength = 10;
            unit.movement = 3;
            unit.movesLeft = 3;
            unit.vision = 2;
            unit.xpToLevel = 20;
            unit.desc = '🐋 Standard whale. Balanced stats for all situations.';
            matured.push(unit);
        }
    }
    return matured;
}
