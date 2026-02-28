/* 🐋 Whale Civilization 3 — Tech Tree Data */

export const TECHS = {
    echolocation: { name: 'Echolocation', cost: 5, turns: 2, desc: '+1 vision range for all units', icon: '📡', effect: { visionBonus: 1 }, requires: [] },
    deep_diving: { name: 'Deep Diving', cost: 8, turns: 3, desc: 'Access Deep Ocean and Abyss tiles', icon: '🌊', effect: { deepAccess: true }, requires: [] },
    bubble_net: { name: 'Bubble Net Fishing', cost: 6, turns: 2, desc: 'Unlock Bubble Net Feed action: 2× vitality from krill', icon: '🫧', effect: { bubbleNet: true }, requires: [] },
    song_memory: { name: 'Song Memory', cost: 7, turns: 2, desc: '+2 Song per turn base income', icon: '🎵', effect: { songIncome: 2 }, requires: [] },
    pod_tactics: { name: 'Pod Tactics', cost: 10, turns: 3, desc: '+25% combat strength when 2+ allies adjacent', icon: '⚔️', effect: { podCombat: 0.25 }, requires: [] },
    arctic_adaptation: { name: 'Arctic Adaptation', cost: 8, turns: 3, desc: 'No movement penalty in Arctic tiles', icon: '❄️', effect: { arcticAdapt: true }, requires: ['echolocation'] },
    whale_song_mastery: { name: 'Whale Song Mastery', cost: 12, turns: 4, desc: 'Songs generate 2× culture points', icon: '🎶', effect: { songMastery: true }, requires: ['song_memory'] },
    ancient_knowledge: { name: 'Ancient Knowledge', cost: 15, turns: 5, desc: '+3 Knowledge per turn', icon: '📚', effect: { knowledgeIncome: 3 }, requires: ['deep_diving'] },
    great_migration: { name: 'Great Migration', cost: 10, turns: 3, desc: '+1 movement for all units permanently', icon: '🏃', effect: { moveBonus: 1 }, requires: [] },
    leviathan_call: { name: 'Leviathan Call', cost: 20, turns: 6, desc: 'Summon a Great Whale unit', icon: '🌟', effect: { summonGreatWhale: true }, requires: ['ancient_knowledge', 'whale_song_mastery'] },
};

export const TECH_LIST = Object.entries(TECHS).map(([id, t]) => ({ id, ...t }));
