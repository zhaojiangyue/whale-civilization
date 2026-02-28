/* 🐋 Whale Civilization 3 — Song System */

export const SONG_VERSES = [
    { id: 'greeting_song', name: 'Greeting Song', cost: 5, effect: '+2 Song per turn', icon: '🎵', bonus: { songIncome: 2 } },
    { id: 'feeding_call', name: 'Feeding Call', cost: 8, effect: '+3 Vitality per turn', icon: '🐟', bonus: { vitalityIncome: 3 } },
    { id: 'deep_echo', name: 'Deep Echo', cost: 10, effect: '+2 Knowledge per turn', icon: '📡', bonus: { knowledgeIncome: 2 } },
    { id: 'migration_hymn', name: 'Migration Hymn', cost: 12, effect: '+1 movement all units', icon: '🌊', bonus: { moveBonus: 1 } },
    { id: 'battle_cry', name: 'Battle Cry', cost: 15, effect: '+3 strength all units', icon: '⚔️', bonus: { strengthBonus: 3 } },
    { id: 'ancient_ballad', name: 'Ancient Ballad', cost: 20, effect: '+5 Song, +3 Knowledge per turn', icon: '📜', bonus: { songIncome: 5, knowledgeIncome: 3 } },
];

export function performSing(unit, state) {
    let songGain = 3;
    if (state.season.id === 'song') songGain = Math.floor(songGain * 1.5);
    if (unit.typeId === 'matriarch') songGain += 2;

    state.resources.song += songGain;
    unit.hasActed = true;
    unit.movesLeft = 0;
    unit.xp += 2;

    state.songsPerformed.push({ turn: state.turn, unitId: unit.id });

    return { song: songGain };
}

export function purchaseVerse(verseId, state) {
    const verse = SONG_VERSES.find(v => v.id === verseId);
    if (!verse) return null;

    let cost = verse.cost;
    if (state.season.id === 'song') cost = Math.floor(cost * 0.7);

    if (state.resources.song < cost) return null;

    state.resources.song -= cost;

    // Apply bonuses
    if (verse.bonus.songIncome) state.perTurnIncome.song += verse.bonus.songIncome;
    if (verse.bonus.vitalityIncome) state.perTurnIncome.vitality += verse.bonus.vitalityIncome;
    if (verse.bonus.knowledgeIncome) state.perTurnIncome.knowledge += verse.bonus.knowledgeIncome;

    return { verse, cost };
}
