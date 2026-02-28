/* 🐋 Whale Civilization 3 — Season System */

export function spawnSeasonalResources(state) {
    for (const [, tile] of state.tiles) {
        if (tile.biome.impassable) continue;
        // Reset and respawn krill/fish based on season
        if (Math.random() < 0.08) tile.hasKrill = true;
        if (Math.random() < 0.06) tile.hasFishSchool = true;
        // Storms
        tile.hasStorm = Math.random() < 0.02;
    }
}

export function getSeasonDescription(season) {
    return season.desc || '';
}
