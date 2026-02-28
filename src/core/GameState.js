/* 🐋 Whale Civilization 3 — Game State
   Central game state management */

import { hexKey } from './HexGrid.js';

export const FACTIONS = {
    blue_whale: { name: 'Blue Whale Sovereignty', color: '#3b82f6', bonus: 'Loudest calls: +2 vision range for all units', emoji: '🐋', visionBonus: 2 },
    humpback: { name: 'Humpback Chorus', color: '#8b5cf6', bonus: 'Complex songs: +50% Song generation, 2× bubble-net bonus', emoji: '🐳', songBonus: 0.5 },
    sperm_whale: { name: 'Sperm Whale Conclave', color: '#78716c', bonus: 'Deep diving: access Deep/Abyss from start, +50% science from depths', emoji: '🐋', deepAccess: true },
    orca: { name: 'Orca Syndicate', color: '#ef4444', bonus: 'Pack tactics: +20% combat when 2+ orcas adjacent', emoji: '🐬', packBonus: 0.2 },
    beluga: { name: 'Beluga Federation', color: '#06b6d4', bonus: 'Ice adaptation: no penalties in Arctic, shared global vision', emoji: '🐋', arcticBonus: true },
    narwhal: { name: 'Narwhal Enclave', color: '#a855f7', bonus: 'Tusk sensing: reveals resources in fog, detects enemies at range', emoji: '🦄', senseRange: 3 },
};

export const FACTION_LIST = Object.entries(FACTIONS).map(([id, f]) => ({ id, ...f }));

export const SEASONS = [
    { id: 'feeding', name: 'Feeding Season', color: '#4ecdc4', icon: '🐟', turnsPerSeason: 8, desc: 'Abundant food. Feed actions give bonus resources.' },
    { id: 'song', name: 'Song Season', color: '#8b5cf6', icon: '🎵', turnsPerSeason: 6, desc: 'Whales sing for culture. Song costs reduced 30%.' },
    { id: 'breeding', name: 'Breeding Season', color: '#f472b6', icon: '🍼', turnsPerSeason: 4, desc: 'New calves born. Breeding costs Vitality.' },
    { id: 'migration', name: 'Migration Season', color: '#fbbf24', icon: '🌊', turnsPerSeason: 6, desc: 'Whales gain +2 movement. Explore new waters!' },
];

export class GameState {
    constructor() {
        this.tiles = new Map();
        this.units = [];
        this.visible = new Set();
        this.explored = new Set();
        this.turn = 1;
        this.year = 1;
        this.seasonIndex = 0;
        this.season = SEASONS[0];
        this.turnsInSeason = 0;
        this.resources = { vitality: 30, knowledge: 5, song: 3 };
        this.perTurnIncome = { vitality: 5, knowledge: 3, song: 2 };
        this.mapCols = 60;
        this.mapRows = 40;
        this.selectedUnit = null;
        this.playerFactionId = null;
        this.playerFaction = null;
        this.aiFactions = [];
        this.gameStarted = false;
        this.songsPerformed = [];
        this.homeTiles = new Set();
    }

    selectFaction(factionId) {
        this.playerFactionId = factionId;
        this.playerFaction = FACTIONS[factionId];
    }

    advanceTurn() {
        this.turn++;
        this.turnsInSeason++;

        const currentSeason = SEASONS[this.seasonIndex];
        if (this.turnsInSeason >= currentSeason.turnsPerSeason) {
            this.turnsInSeason = 0;
            this.seasonIndex = (this.seasonIndex + 1) % SEASONS.length;
            this.season = SEASONS[this.seasonIndex];
            if (this.seasonIndex === 0) this.year++;
        }

        // Reset unit moves
        for (const unit of this.units) {
            let baseMoves = unit.movement;
            if (this.season.id === 'migration') baseMoves += 2;
            unit.movesLeft = baseMoves;
            unit.hasActed = false;
        }

        // Per-turn income
        this.resources.vitality += this.perTurnIncome.vitality;
        this.resources.knowledge += this.perTurnIncome.knowledge;
        this.resources.song += this.perTurnIncome.song;
    }
}
