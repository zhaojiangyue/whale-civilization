/* 🐋 Whale Civilization 3 — Victory System */

export const VICTORY_CONDITIONS = {
    song_legacy: { name: 'Song Legacy', target: 15, desc: 'Perform 15 songs to achieve cultural dominance', icon: '🎵' },
    deep_knowledge: { name: 'Deep Knowledge', target: 12, desc: 'Research 12 technologies', icon: '🔬' },
    exploration: { name: 'Exploration', target: 80, desc: 'Explore 80% of the ocean', icon: '🗺️' },
};

export function checkVictory(state, playerResearched) {
    const versesUsed = state.songsPerformed?.length || 0;
    const techsDone = playerResearched?.size || 0;
    const explored = [...state.tiles.values()].filter(t => t.explored).length;
    const totalTiles = state.tiles.size;
    const explorePercent = totalTiles > 0 ? Math.round((explored / totalTiles) * 100) : 0;

    if (versesUsed >= VICTORY_CONDITIONS.song_legacy.target) {
        return { type: 'song_legacy', name: 'Song Legacy Victory!' };
    }
    if (techsDone >= VICTORY_CONDITIONS.deep_knowledge.target) {
        return { type: 'deep_knowledge', name: 'Deep Knowledge Victory!' };
    }
    if (explorePercent >= VICTORY_CONDITIONS.exploration.target) {
        return { type: 'exploration', name: 'Ocean Exploration Victory!' };
    }

    return null;
}
