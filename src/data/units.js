/* 🐋 Whale Civilization 3 — Unit Type Definitions */

export const UNIT_TYPES = {
    matriarch: {
        name: 'Matriarch',
        maxHp: 120,
        strength: 8,
        movement: 2,
        vision: 3,
        xpToLevel: 30,
        desc: '👑 Pod leader. Slow (2 moves) but +1 Knowledge/turn. Teaches calves.',
        passive: '+1 Knowledge per turn',
        turnsToMature: 0,
    },
    bull: {
        name: 'Bull',
        maxHp: 150,
        strength: 14,
        movement: 3,
        vision: 2,
        xpToLevel: 25,
        desc: '💪 Strongest fighter. High HP and damage. Protects the pod.',
        passive: '+20% damage to enemies',
        turnsToMature: 0,
    },
    adult: {
        name: 'Whale',
        maxHp: 100,
        strength: 10,
        movement: 3,
        vision: 2,
        xpToLevel: 20,
        desc: '🐋 Standard whale. Balanced stats for all situations.',
        passive: null,
        turnsToMature: 0,
    },
    scout: {
        name: 'Scout',
        maxHp: 60,
        strength: 5,
        movement: 5,
        vision: 4,
        xpToLevel: 15,
        desc: '🏃 Fast explorer. 5 moves, 4 vision. Weak in combat.',
        passive: 'Reveals resources in fog',
        turnsToMature: 0,
    },
    calf: {
        name: 'Calf',
        maxHp: 40,
        strength: 2,
        movement: 2,
        vision: 2,
        xpToLevel: 10,
        desc: '🍼 Baby whale. Cannot fight. Grows into adult after 8 turns.',
        passive: 'Matures in 8 turns',
        turnsToMature: 8,
    },
    great_whale: {
        name: 'Great Whale',
        maxHp: 200,
        strength: 18,
        movement: 2,
        vision: 4,
        xpToLevel: 50,
        desc: '🌟 Ancient whale of immense power. Legendary unit.',
        passive: '+2 to all resources per turn',
        turnsToMature: 0,
    },
};

/**
 * Create a new whale unit
 */
export function createUnit(typeId, factionId, factionColor, q, r) {
    const type = UNIT_TYPES[typeId];
    return {
        id: `${factionId}_${typeId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        typeId,
        typeName: type.name,
        factionId,
        factionColor,
        q, r,
        hp: type.maxHp,
        maxHp: type.maxHp,
        strength: type.strength,
        movement: type.movement,
        movesLeft: type.movement,
        vision: type.vision,
        xp: 0,
        level: 1,
        xpToLevel: type.xpToLevel,
        isCalf: typeId === 'calf',
        calfTurns: typeId === 'calf' ? type.turnsToMature : 0,
        desc: type.desc,
        passive: type.passive || null,
        hasActed: false,
    };
}
