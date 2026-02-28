/* 🐋 Whale Civilization 3 — Combat System */

import { hexDistance, hexNeighbors, hexKey } from '../core/HexGrid.js';

export function resolveCombat(attacker, defender, state) {
    let atkStrength = attacker.strength;
    let defStrength = defender.strength;

    // Level bonuses
    atkStrength += (attacker.level - 1) * 2;
    defStrength += (defender.level - 1) * 2;

    // Bull bonus
    if (attacker.typeId === 'bull') atkStrength = Math.floor(atkStrength * 1.2);

    // Pod tactics: adjacent allies boost
    const atkAllies = state.units.filter(u =>
        u !== attacker && u.factionId === attacker.factionId && hexDistance(u, attacker) <= 1
    ).length;
    if (atkAllies >= 2) atkStrength = Math.floor(atkStrength * 1.25);

    // Random factor
    const atkRoll = 0.8 + Math.random() * 0.4;
    const defRoll = 0.8 + Math.random() * 0.4;

    const atkDmg = Math.max(1, Math.floor(atkStrength * atkRoll - defStrength * 0.3));
    const defDmg = Math.max(1, Math.floor(defStrength * defRoll * 0.5 - atkStrength * 0.15));

    defender.hp -= atkDmg;
    attacker.hp -= defDmg;

    const result = {
        atkDmg,
        defDmg,
        defenderKilled: defender.hp <= 0,
        attackerKilled: attacker.hp <= 0,
    };

    // XP rewards
    if (result.defenderKilled) {
        attacker.xp += 10;
    } else {
        attacker.xp += 3;
    }
    // Level up check
    if (attacker.xp >= attacker.xpToLevel) {
        attacker.xp -= attacker.xpToLevel;
        attacker.level++;
        attacker.maxHp += 10;
        attacker.hp = Math.min(attacker.hp + 10, attacker.maxHp);
        attacker.strength += 2;
    }

    return result;
}
