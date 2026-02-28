/* 🐋 Whale Civilization 3 — Feeding System */

export function feedUnit(unit, tile, state) {
    let vGain = tile.biome.vitality;
    let kGain = tile.biome.knowledge;
    let sGain = tile.biome.song;

    // Resource bonuses from tile features
    if (tile.hasKrill) vGain += 4;
    if (tile.hasFishSchool) { vGain += 3; sGain += 1; }

    // Season bonus
    if (state.season.id === 'feeding') {
        vGain = Math.floor(vGain * 1.5);
    }

    state.resources.vitality += vGain;
    state.resources.knowledge += kGain;
    state.resources.song += sGain;

    unit.hasActed = true;
    unit.movesLeft = 0;

    return { vitality: vGain, knowledge: kGain, song: sGain };
}

export function bubbleNetFeed(units, tile, state) {
    const participating = units.filter(u => u.movesLeft > 0 && !u.hasActed);
    if (participating.length < 2) return null;

    let vGain = tile.biome.vitality * 2;
    if (tile.hasKrill) vGain += 8;
    if (tile.hasFishSchool) vGain += 6;
    if (state.season.id === 'feeding') vGain = Math.floor(vGain * 1.5);

    state.resources.vitality += vGain;

    for (const u of participating) {
        u.hasActed = true;
        u.movesLeft = 0;
    }

    return { vitality: vGain, participants: participating.length };
}
