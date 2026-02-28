/* 🐋 Whale Civilization 3 — Save System */

const SAVE_KEY = 'whale_civ_3_save';

export function hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
}

export function saveGame(state) {
    try {
        const data = {
            turn: state.turn,
            year: state.year,
            seasonIndex: state.seasonIndex,
            resources: { ...state.resources },
            playerFactionId: state.playerFactionId,
            timestamp: Date.now(),
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.warn('Save failed:', e);
        return false;
    }
}

export function loadSave() {
    try {
        const data = localStorage.getItem(SAVE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

export function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
}
