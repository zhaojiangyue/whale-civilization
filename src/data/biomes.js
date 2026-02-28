/* 🐋 Whale Civilization 3 — Biome & Resource Data */

export const BIOMES = {
    shallow: { name: 'Shallow Waters', color: '#7dd3fc', vitality: 3, knowledge: 0, song: 0, icon: '🌊' },
    coral_reef: { name: 'Coral Reef', color: '#f0abfc', vitality: 4, knowledge: 1, song: 1, icon: '🪸' },
    kelp_forest: { name: 'Kelp Forest', color: '#86efac', vitality: 5, knowledge: 1, song: 0, icon: '🌿' },
    open_ocean: { name: 'Open Ocean', color: '#60a5fa', vitality: 2, knowledge: 0, song: 0, icon: '🌊' },
    deep: { name: 'Deep Ocean', color: '#3b82f6', vitality: 1, knowledge: 3, song: 0, icon: '🌑' },
    abyss: { name: 'Abyss', color: '#1e3a5f', vitality: 0, knowledge: 5, song: 2, icon: '⬛' },
    arctic: { name: 'Arctic Waters', color: '#e0f2fe', vitality: 2, knowledge: 2, song: 1, icon: '❄️' },
    tropical: { name: 'Tropical Shallows', color: '#67e8f9', vitality: 4, knowledge: 0, song: 2, icon: '🏝️' },
    volcanic_vent: { name: 'Volcanic Vent', color: '#fbbf24', vitality: 2, knowledge: 4, song: 0, icon: '🌋' },
    song_reef: { name: 'Song Reef', color: '#c084fc', vitality: 1, knowledge: 0, song: 5, icon: '🎶' },
    bioluminescent: { name: 'Bioluminescent Vent', color: '#34d399', vitality: 1, knowledge: 4, song: 1, icon: '💡' },
    land: { name: 'Land', color: '#d4a574', vitality: 0, knowledge: 0, song: 0, icon: '🏔️', impassable: true },
};

export const RESOURCE_LIST = [
    { id: 'krill', name: 'Krill Swarm', emoji: '🦐', vitality: 4, knowledge: 0, song: 0 },
    { id: 'fish', name: 'Fish School', emoji: '🐟', vitality: 3, knowledge: 0, song: 1 },
    { id: 'squid', name: 'Giant Squid', emoji: '🦑', vitality: 2, knowledge: 3, song: 0 },
    { id: 'jellyfish', name: 'Jellyfish Bloom', emoji: '🪼', vitality: 1, knowledge: 1, song: 2 },
];
