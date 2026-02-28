/* 🐋 Whale Civilization 3 — Main Game Logic */
import './index.css';
import { GameState, FACTIONS, FACTION_LIST, SEASONS } from './core/GameState.js';
import { hexToPixel, pixelToHex, hexKey, hexDistance, hexesInRange, hexNeighbors } from './core/HexGrid.js';
import { Camera } from './core/Camera.js';
import { generateMap, findStartPosition } from './core/MapGenerator.js';
import { createUnit, UNIT_TYPES } from './data/units.js';
import { TECHS, TECH_LIST } from './data/techs.js';
import { WHALE_FACTS, getRandomFact } from './data/encyclopedia.js';
import { MapRenderer } from './render/MapRenderer.js';
import { UnitRenderer } from './render/UnitRenderer.js';
import { MinimapRenderer } from './render/MinimapRenderer.js';
import { addFloatingText, renderFloatingTexts } from './render/FloatingText.js';
import { emitParticles, renderParticles } from './render/ParticleSystem.js';
import { resolveCombat } from './systems/CombatSystem.js';
import { feedUnit, bubbleNetFeed } from './systems/FeedingSystem.js';
import { performSing, purchaseVerse, SONG_VERSES } from './systems/SongSystem.js';
import { spawnSeasonalResources } from './systems/SeasonSystem.js';
import { processBreeeding, matureCalves } from './systems/PodSystem.js';
import { hasSave } from './systems/SaveSystem.js';
import { resumeAudio, playWhaleCall, playClick } from './systems/SoundSystem.js';
import { startTutorial, advanceTutorial } from './systems/TutorialSystem.js';
import { checkVictory } from './systems/VictorySystem.js';
import { doAITurn } from './ai/AIController.js';
import { getReachableHexes } from './ai/Pathfinding.js';

// ─── State ─────────────────────────────────────────
const state = new GameState();
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const camera = new Camera(canvas.width, canvas.height);

let mapRenderer, unitRenderer, minimapRenderer;
let lastTime = 0;
let moveRangeHexes = [];
let clickStartPos = null;
let isDragging = false;

// ─── Game Settings ───────────────────────────────
const gameSettings = { mapCols: 60, mapRows: 40, aiCount: 3 };

// ─── Tech State ──────────────────────────────────
let playerResearched = new Set();
let researchingTech = null;
let researchTurnsLeft = 0;

// ─── Idle Unit Tracking ──────────────────────────
function getIdleUnits() {
    return state.units.filter(u =>
        u.factionId === state.playerFactionId && u.movesLeft > 0 && !u.hasActed
    );
}

function updateIdleBadge() {
    const idle = getIdleUnits();
    const badge = document.getElementById('idle-badge');
    const btn = document.getElementById('next-turn-btn');
    if (idle.length > 0) {
        badge.textContent = `${idle.length} idle`;
        badge.classList.remove('hidden');
        btn.textContent = '';
        btn.innerHTML = `🐋 ${idle.length} idle`;
    } else {
        badge.classList.add('hidden');
        btn.textContent = 'Next Turn ⏭️';
    }
}

// ─── Toast ──────────────────────────────────────
function showToast(text, duration = 4000) {
    const toast = document.getElementById('toast');
    toast.textContent = text;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); toast.classList.add('hidden'); }, duration);
}

// ─── Start Game ───────────────────────────────────
function startGame(factionId) {
    state.selectFaction(factionId);
    state.mapCols = gameSettings.mapCols;
    state.mapRows = gameSettings.mapRows;
    state.tiles = generateMap(state.mapCols, state.mapRows);

    const starts = [];
    const playerStart = findStartPosition(state.tiles, state.mapCols, state.mapRows, starts);
    starts.push(playerStart);

    // Player starting pod
    const fc = state.playerFaction.color;
    state.units.push(createUnit('matriarch', factionId, fc, playerStart.q, playerStart.r));
    state.units.push(createUnit('bull', factionId, fc, playerStart.q + 1, playerStart.r));
    state.units.push(createUnit('adult', factionId, fc, playerStart.q - 1, playerStart.r));
    state.units.push(createUnit('adult', factionId, fc, playerStart.q, playerStart.r + 1));
    state.units.push(createUnit('scout', factionId, fc, playerStart.q + 1, playerStart.r - 1));

    // AI factions
    const aiFactionIds = FACTION_LIST.filter(f => f.id !== factionId).map(f => f.id)
        .sort(() => Math.random() - 0.5).slice(0, gameSettings.aiCount);

    for (const aiId of aiFactionIds) {
        const aiFac = FACTIONS[aiId];
        const aiStart = findStartPosition(state.tiles, state.mapCols, state.mapRows, starts);
        starts.push(aiStart);
        state.aiFactions.push({ id: aiId, faction: aiFac, startPos: aiStart });
        state.units.push(createUnit('matriarch', aiId, aiFac.color, aiStart.q, aiStart.r));
        state.units.push(createUnit('bull', aiId, aiFac.color, aiStart.q + 1, aiStart.r));
        state.units.push(createUnit('adult', aiId, aiFac.color, aiStart.q - 1, aiStart.r));
        state.units.push(createUnit('adult', aiId, aiFac.color, aiStart.q, aiStart.r + 1));
    }

    updateFogOfWar();
    spawnSeasonalResources(state);

    const startPixel = hexToPixel(playerStart.q, playerStart.r);
    camera.centerOn(startPixel.x, startPixel.y);

    mapRenderer = new MapRenderer(canvas, camera, state);
    unitRenderer = new UnitRenderer(ctx, state);
    minimapRenderer = new MinimapRenderer(document.getElementById('minimap-canvas'), camera, state);

    document.getElementById('faction-picker').classList.add('hidden');
    state.gameStarted = true;

    updateTopBar();
    showToast(`🐋 The ${state.playerFaction.name} begins their journey!`);
    playWhaleCall(state.playerFactionId);
    startTutorial();

    const fact = getRandomFact(state.playerFactionId);
    if (fact) showToast(`💡 ${fact}`, 6000);

    updateGoalsPanel();
    updateIdleBadge();
    updateAdvisor();

    mapRenderer.resize();
    requestAnimationFrame(gameLoop);
}

// ─── Fog of War ──────────────────────────────────
function updateFogOfWar() {
    state.visible.clear();
    const playerUnits = state.units.filter(u => u.factionId === state.playerFactionId);
    for (const unit of playerUnits) {
        let vision = unit.vision;
        if (state.playerFaction.visionBonus) vision += state.playerFaction.visionBonus;
        const visHexes = hexesInRange(unit.q, unit.r, vision);
        for (const h of visHexes) {
            const key = hexKey(h.q, h.r);
            if (state.tiles.has(key)) {
                state.visible.add(key);
                state.explored.add(key);
            }
        }
    }
}

// ─── Move Range ──────────────────────────────────
function updateMoveRange() {
    moveRangeHexes = [];
    if (!state.selectedUnit || state.selectedUnit.movesLeft <= 0) return;
    const reachable = getReachableHexes(state.selectedUnit, state.selectedUnit.movesLeft, state);
    moveRangeHexes = [...reachable];
}

// ─── Top Bar ─────────────────────────────────────
function updateTopBar() {
    document.getElementById('res-vitality').textContent = state.resources.vitality;
    document.getElementById('res-knowledge').textContent = state.resources.knowledge;
    document.getElementById('res-song').textContent = state.resources.song;
    document.getElementById('res-vitality-income').textContent = `+${state.perTurnIncome.vitality}`;
    document.getElementById('res-knowledge-income').textContent = `+${state.perTurnIncome.knowledge}`;
    document.getElementById('res-song-income').textContent = `+${state.perTurnIncome.song}`;
    document.getElementById('season-name').textContent = state.season.name;
    document.getElementById('season-icon').textContent = state.season.icon;
    document.getElementById('year-num').textContent = state.year;
    document.getElementById('turn-num').textContent = state.turn;
}

// ─── Selection Panel ─────────────────────────────
function updateSelectionPanel() {
    const panel = document.getElementById('selection-panel');
    const unit = state.selectedUnit;
    if (!unit) { panel.classList.add('hidden'); return; }

    panel.classList.remove('hidden');
    document.getElementById('sel-name').textContent = unit.typeName;
    document.getElementById('sel-faction').textContent = `Lv ${unit.level} · ${FACTIONS[unit.factionId]?.name || unit.factionId}`;

    const statsHtml = `
        <span>❤️ HP <b>${unit.hp}/${unit.maxHp}</b></span>
        <span>⚔️ Strength <b>${unit.strength}</b></span>
        <span>🐾 Moves <b>${unit.movesLeft}/${unit.movement}</b></span>
        <span>👁️ Vision <b>${unit.vision}</b></span>
        <span>⭐ XP <b>${unit.xp}/${unit.xpToLevel}</b></span>
        <span>📍 Tile <b>${getTileName(unit.q, unit.r)}</b></span>
    `;
    document.getElementById('sel-stats').innerHTML = statsHtml;
    document.getElementById('sel-desc').textContent = unit.desc || '';

    // Actions
    const actionsDiv = document.getElementById('sel-actions');
    actionsDiv.innerHTML = '';
    if (unit.factionId !== state.playerFactionId) return;

    const canAct = unit.movesLeft > 0 && !unit.hasActed;

    // Feed
    const feedBtn = document.createElement('button');
    feedBtn.className = 'ui-btn action-btn';
    feedBtn.textContent = '🍽️ Feed';
    feedBtn.disabled = !canAct;
    feedBtn.title = canAct ? 'Gather resources from current tile' : 'No moves left';
    feedBtn.onclick = () => doFeed(unit);
    actionsDiv.appendChild(feedBtn);

    // Sing
    const singBtn = document.createElement('button');
    singBtn.className = 'ui-btn action-btn';
    singBtn.textContent = '🎵 Sing';
    singBtn.disabled = !canAct || state.season.id !== 'song';
    singBtn.title = state.season.id === 'song' ? 'Perform a song for culture points' : 'Only available during Song Season';
    singBtn.onclick = () => doSing(unit);
    actionsDiv.appendChild(singBtn);

    // Attack (if enemy adjacent)
    const adjacent = hexNeighbors(unit.q, unit.r);
    const adjEnemy = state.units.find(u =>
        u.factionId !== unit.factionId &&
        adjacent.some(a => a.q === u.q && a.r === u.r)
    );
    if (adjEnemy && canAct) {
        const atkBtn = document.createElement('button');
        atkBtn.className = 'ui-btn action-btn';
        atkBtn.textContent = `⚔️ Attack ${adjEnemy.typeName}`;
        atkBtn.onclick = () => doAttack(unit, adjEnemy);
        actionsDiv.appendChild(atkBtn);
    }
}

function getTileName(q, r) {
    const tile = state.tiles.get(hexKey(q, r));
    return tile ? tile.biome.name : 'Unknown';
}

// ─── Actions ─────────────────────────────────────
function doFeed(unit) {
    const tile = state.tiles.get(hexKey(unit.q, unit.r));
    if (!tile) return;
    const result = feedUnit(unit, tile, state);
    const pos = hexToPixel(unit.q, unit.r);
    if (result.vitality) addFloatingText(`+${result.vitality} 🐟`, pos.x, pos.y, '#4ecdc4');
    if (result.knowledge) addFloatingText(`+${result.knowledge} 🔬`, pos.x, pos.y - 15, '#8b5cf6');
    if (result.song) addFloatingText(`+${result.song} 🎵`, pos.x, pos.y - 30, '#fbbf24');
    emitParticles(pos.x, pos.y, '#4ecdc4', 6);
    updateTopBar();
    updateSelectionPanel();
    updateIdleBadge();
    advanceTutorial('feed');
}

function doSing(unit) {
    const result = performSing(unit, state);
    const pos = hexToPixel(unit.q, unit.r);
    addFloatingText(`+${result.song} 🎵`, pos.x, pos.y, '#c084fc');
    emitParticles(pos.x, pos.y, '#c084fc', 10);
    playWhaleCall(unit.factionId);
    updateTopBar();
    updateSelectionPanel();
    updateIdleBadge();
    advanceTutorial('sing');
}

function doAttack(attacker, defender) {
    const result = resolveCombat(attacker, defender, state);
    const pos = hexToPixel(defender.q, defender.r);
    addFloatingText(`-${result.atkDmg}`, pos.x, pos.y, '#ef4444');
    emitParticles(pos.x, pos.y, '#ef4444', 12);

    if (result.defenderKilled) {
        state.units = state.units.filter(u => u !== defender);
        addFloatingText('💀 Killed!', pos.x, pos.y - 20, '#fbbf24');
        if (attacker.factionId === state.playerFactionId) {
            state.resources.vitality += 5;
            addFloatingText('+10 XP +5 🐟', hexToPixel(attacker.q, attacker.r).x, hexToPixel(attacker.q, attacker.r).y - 15, '#fbbf24');
        }
    }
    if (result.attackerKilled) {
        state.units = state.units.filter(u => u !== attacker);
        state.selectedUnit = null;
    }

    attacker.hasActed = true;
    attacker.movesLeft = 0;
    updateTopBar();
    updateSelectionPanel();
    updateFogOfWar();
    updateIdleBadge();
}

// ─── Map Click ───────────────────────────────────
function handleMapDown(e) {
    clickStartPos = { x: e.clientX, y: e.clientY };
    isDragging = false;
}

function handleMapClick(e) {
    if (isDragging) return;
    if (!state.gameStarted) return;

    const world = camera.screenToWorld(e.clientX, e.clientY);
    const hex = pixelToHex(world.x, world.y);
    const key = hexKey(hex.q, hex.r);

    // Check if clicking a unit
    const clickedUnit = state.units.find(u => u.q === hex.q && u.r === hex.r);

    if (clickedUnit && clickedUnit.factionId === state.playerFactionId) {
        state.selectedUnit = clickedUnit;
        updateMoveRange();
        updateSelectionPanel();
        playClick();
        advanceTutorial('select');
        return;
    }

    // Check if moving selected unit
    if (state.selectedUnit && moveRangeHexes.includes(key)) {
        const unit = state.selectedUnit;
        const fromQ = unit.q, fromR = unit.r;

        // Check for enemy at destination
        const enemy = state.units.find(u => u.q === hex.q && u.r === hex.r && u.factionId !== unit.factionId);
        if (enemy) {
            // Move adjacent and attack
            doAttack(unit, enemy);
            return;
        }

        unit.q = hex.q;
        unit.r = hex.r;
        unit.movesLeft--;

        if (unitRenderer) unitRenderer.animateMove(unit, fromQ, fromR, hex.q, hex.r);

        updateFogOfWar();
        updateMoveRange();
        updateSelectionPanel();
        updateIdleBadge();
        advanceTutorial('move');
        return;
    }

    // Deselect
    state.selectedUnit = null;
    moveRangeHexes = [];
    updateSelectionPanel();
}

// ─── Panning ─────────────────────────────────────
function handleMouseMove(e) {
    if (e.buttons === 1 && clickStartPos) {
        const dx = e.clientX - clickStartPos.x;
        const dy = e.clientY - clickStartPos.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging = true;
        if (isDragging) {
            camera.pan(-e.movementX, -e.movementY);
        }
    }
}

function handleWheel(e) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    camera.zoomAt(factor, e.clientX, e.clientY);
}

// ─── Next Turn ───────────────────────────────────
function nextTurn() {
    // Breeding
    const calves = processBreeeding(state);
    for (const c of calves) {
        const pos = hexToPixel(c.q, c.r);
        addFloatingText('🍼 Calf born!', pos.x, pos.y - 20, '#f472b6');
        showToast('🍼 A new calf was born in your pod!');
    }

    // Mature calves
    const matured = matureCalves(state);
    for (const m of matured) {
        const pos = hexToPixel(m.q, m.r);
        addFloatingText('🐋 Grew up!', pos.x, pos.y - 20, '#4ecdc4');
    }

    // Research progress
    if (researchingTech) {
        researchTurnsLeft--;
        if (researchTurnsLeft <= 0) {
            playerResearched.add(researchingTech);
            showToast(`🧬 Research complete: ${TECHS[researchingTech].name}!`);
            researchingTech = null;
        }
    }

    // Remove dead units
    state.units = state.units.filter(u => u.hp > 0);

    // AI turn
    doAITurn(state);

    // Advance turn
    const oldSeason = state.season.id;
    state.advanceTurn();
    if (state.season.id !== oldSeason) {
        showToast(`${state.season.icon} ${state.season.name} begins! ${state.season.desc}`);
        spawnSeasonalResources(state);
    }

    updateFogOfWar();
    updateTopBar();
    updateSelectionPanel();
    updateMoveRange();
    updateGoalsPanel();
    updateAdvisor();
    updateIdleBadge();

    // Victory check
    const victory = checkVictory(state, playerResearched);
    if (victory) {
        showToast(`🏆 ${victory.name} Congratulations! You won in Year ${state.year}!`, 10000);
    }

    advanceTutorial('next-turn');
}

// ─── Goals Panel ──────────────────────────────────
function updateGoalsPanel() {
    const panel = document.getElementById('goals-panel');
    if (!state.gameStarted) return;
    panel.classList.remove('hidden');

    const content = document.getElementById('goals-content');
    const versesUsed = state.songsPerformed?.length || 0;
    const techsDone = playerResearched?.size || 0;
    const explored = [...state.tiles.values()].filter(t => t.explored).length;
    const totalTiles = state.tiles.size;
    const explorePercent = totalTiles > 0 ? Math.round((explored / totalTiles) * 100) : 0;
    // Home waters
    const homeCount = state.homeTiles?.size || 0;

    content.innerHTML = `
        <div class="goal-row">🎵 Song Legacy <span style="float:right">${versesUsed}/15</span>
            <div class="goal-bar"><div class="goal-fill" style="width:${Math.min(100, versesUsed / 15 * 100)}%"></div></div>
        </div>
        <div class="goal-row">🔬 Deep Knowledge <span style="float:right">${techsDone}/12</span>
            <div class="goal-bar"><div class="goal-fill" style="width:${Math.min(100, techsDone / 12 * 100)}%"></div></div>
        </div>
        <div class="goal-row">🗺️ Exploration <span style="float:right">${explorePercent}/80</span>
            <div class="goal-bar"><div class="goal-fill" style="width:${Math.min(100, explorePercent / 80 * 100)}%"></div></div>
        </div>
        <div style="color:#64748b;font-size:10px;margin-top:4px;">🏠 Home Waters: ${homeCount}/3 · Year ${state.year} · Turn ${state.turn}</div>
    `;
}

// ─── Advisor System ───────────────────────────────
let lastAdvisorTip = '';
let advisorTimer = null;

function updateAdvisor() {
    const tipEl = document.getElementById('advisor-tip');
    const textEl = document.getElementById('advisor-text');
    if (!state.gameStarted) return;

    let tip = '';
    const season = state.season;

    if (state.turn === 1) {
        tip = 'Welcome! Click your whales to move them. Each whale type has a different role — check ❓ Help for details.';
    } else if (season.id === 'song' && state.turnsInSeason === 0) {
        tip = '🎵 Song Season begins! Select each whale and press Sing to earn Song points.';
    } else if (season.id === 'breeding' && state.turnsInSeason === 0) {
        tip = '🍼 Breeding Season! If you have 20+ Vitality and 2+ whales, a calf will be born!';
    } else if (season.id === 'migration' && state.turnsInSeason === 0) {
        tip = '🌊 Migration Season! Great time to send Scouts exploring.';
    } else if (season.id === 'feeding' && state.turnsInSeason === 0) {
        tip = '🐟 Feeding Season begins! Move to food tiles and Feed to stock up Vitality.';
    } else if (state.resources.vitality < 5) {
        tip = '⚠️ Critically low Vitality! Find food tiles and Feed immediately!';
    } else if (state.resources.knowledge >= 8 && playerResearched.size === 0 && !researchingTech) {
        tip = '💡 Tip: Open 🧬 Tech Tree to spend your Knowledge on upgrades!';
    }

    if (tip && tip !== lastAdvisorTip) {
        lastAdvisorTip = tip;
        tipEl.classList.remove('hidden');
        textEl.textContent = tip;
        if (advisorTimer) clearTimeout(advisorTimer);
        advisorTimer = setTimeout(() => { tipEl.classList.add('hidden'); }, 8000);
    } else if (!tip) {
        tipEl.classList.add('hidden');
    }
}

// ─── Help Guide ───────────────────────────────────
function openHelpGuide() {
    const modal = document.getElementById('help-modal');
    modal.classList.remove('hidden');
    document.getElementById('help-content').innerHTML = `
        <div style="font-size:13px;line-height:1.7;color:#cbd5e1;">
        <h3 style="color:var(--bio-cyan);">🐋 Resources</h3>
        <p>🐟 <b>Vitality</b> — Food/health. Gained by feeding. Used for breeding (20 cost).</p>
        <p>🔬 <b>Knowledge</b> — Science. Gained from deep tiles. Spent on Tech Tree research.</p>
        <p>🎵 <b>Song</b> — Culture. Gained by singing. Spent on Song Verses for bonuses.</p>

        <h3 style="color:var(--bio-cyan);margin-top:16px;">🐋 Unit Types</h3>
        <p>👑 <b>Matriarch</b> — Pod leader. +1 Knowledge/turn. Teaches calves.</p>
        <p>💪 <b>Bull</b> — Strongest fighter. +20% combat damage.</p>
        <p>🐋 <b>Whale</b> — Standard balanced unit.</p>
        <p>🏃 <b>Scout</b> — 5 moves, 4 vision. Weak but fast explorer.</p>
        <p>🍼 <b>Calf</b> — Baby. Cannot fight. Matures in 8 turns.</p>

        <h3 style="color:var(--bio-cyan);margin-top:16px;">🌊 Seasons (rotate every few turns)</h3>
        <p>🐟 <b>Feeding</b> — +50% food from Feed action</p>
        <p>🎵 <b>Song</b> — Can Sing! Song verse costs -30%</p>
        <p>🍼 <b>Breeding</b> — Calves born (costs 20 Vitality, need 2+ whales)</p>
        <p>🌊 <b>Migration</b> — +2 movement for all units</p>

        <h3 style="color:var(--bio-cyan);margin-top:16px;">🏆 How to Win</h3>
        <p>🎵 <b>Song Legacy</b> — Perform 15 songs</p>
        <p>🔬 <b>Deep Knowledge</b> — Research 12 technologies</p>
        <p>🗺️ <b>Exploration</b> — Explore 80% of the ocean</p>

        <h3 style="color:var(--bio-cyan);margin-top:16px;">💡 Tips</h3>
        <p>• Green dots under whales = moves remaining</p>
        <p>• Click a whale, then click a highlighted hex to move</p>
        <p>• Feed gives resources based on the biome (Kelp Forest = most food)</p>
        <p>• Krill 🦐 and Fish 🐟 on tiles give bonus resources when feeding</p>
        </div>
    `;
}

// ─── Encyclopedia ─────────────────────────────────
function openEncyclopedia() {
    const modal = document.getElementById('encyclopedia-modal');
    modal.classList.remove('hidden');
    const content = document.getElementById('encyclopedia-content');
    const species = Object.values(WHALE_FACTS);
    content.innerHTML = species.map(s => `
        <div class="tech-card" style="margin-bottom:12px;">
            <h4>${s.name}</h4>
            <p><i>${s.scientific}</i></p>
            <p>Size: ${s.size} | Weight: ${s.weight}</p>
            <p>Diet: ${s.diet} | Lifespan: ${s.lifespan}</p>
            <ul style="margin-top:6px;padding-left:16px;">
                ${s.facts.map(f => `<li style="color:#94a3b8;font-size:11px;margin:2px 0;">${f}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

// ─── Tech Tree ────────────────────────────────────
function openTechTree() {
    const modal = document.getElementById('tech-modal');
    modal.classList.remove('hidden');
    const grid = document.getElementById('tech-grid');
    grid.innerHTML = TECH_LIST.map(t => {
        const researched = playerResearched.has(t.id);
        const isResearching = researchingTech === t.id;
        const canResearch = !researched && !researchingTech && state.resources.knowledge >= t.cost;
        return `
            <div class="tech-card ${researched ? 'researched' : ''}" data-tech="${t.id}">
                <div class="tech-icon">${t.icon}</div>
                <h4>${t.name}</h4>
                <p>${t.desc}</p>
                <p>Cost: ${t.cost} 🔬 · ${t.turns} turns</p>
                ${researched ? '<p style="color:#4ecdc4;">✓ Researched</p>' :
                isResearching ? `<p style="color:#fbbf24;">Researching... (${researchTurnsLeft} turns)</p>` :
                    canResearch ? `<button class="ui-btn action-btn" onclick="window._startResearch('${t.id}')">Research</button>` :
                        '<p style="color:#64748b;">Not available</p>'}
            </div>
        `;
    }).join('');
}

window._startResearch = function (techId) {
    const tech = TECHS[techId];
    if (!tech || state.resources.knowledge < tech.cost) return;
    state.resources.knowledge -= tech.cost;
    researchingTech = techId;
    researchTurnsLeft = tech.turns;
    showToast(`🧬 Researching ${tech.name}... (${tech.turns} turns)`);
    updateTopBar();
    openTechTree(); // Refresh
};

// ─── Song Panel ───────────────────────────────────
function openSongPanel() {
    const modal = document.getElementById('song-modal');
    modal.classList.remove('hidden');
    const grid = document.getElementById('song-grid');
    grid.innerHTML = SONG_VERSES.map(v => {
        let cost = v.cost;
        if (state.season.id === 'song') cost = Math.floor(cost * 0.7);
        const canBuy = state.resources.song >= cost;
        return `
            <div class="tech-card" data-verse="${v.id}">
                <div class="tech-icon">${v.icon}</div>
                <h4>${v.name}</h4>
                <p>${v.effect}</p>
                <p>Cost: ${cost} 🎵${state.season.id === 'song' ? ' (30% off!)' : ''}</p>
                ${canBuy ? `<button class="ui-btn action-btn" onclick="window._buyVerse('${v.id}')">Purchase</button>` :
                '<p style="color:#64748b;">Not enough Song</p>'}
            </div>
        `;
    }).join('');
}

window._buyVerse = function (verseId) {
    const result = purchaseVerse(verseId, state);
    if (result) {
        showToast(`🎵 Learned: ${result.verse.name}!`);
        updateTopBar();
        openSongPanel();
    }
};

// ─── Faction Picker ──────────────────────────────
function initFactionPicker() {
    const grid = document.getElementById('faction-grid');
    grid.innerHTML = FACTION_LIST.map(f => `
        <div class="faction-card" data-faction="${f.id}">
            <span class="faction-emoji">${f.emoji}</span>
            <h3>${f.name}</h3>
            <p>${f.bonus}</p>
        </div>
    `).join('');

    grid.querySelectorAll('.faction-card').forEach(card => {
        card.addEventListener('click', () => {
            startGame(card.dataset.faction);
        });
    });
}

// ─── Game Loop ───────────────────────────────────
function gameLoop(time) {
    const dt = time - lastTime;
    lastTime = time;

    if (!state.gameStarted) { requestAnimationFrame(gameLoop); return; }

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    camera.resize(canvas.width, canvas.height);

    mapRenderer.render(moveRangeHexes);
    unitRenderer.render(dt);
    renderParticles(ctx, dt);
    renderFloatingTexts(ctx, camera);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    minimapRenderer.render();

    requestAnimationFrame(gameLoop);
}

// ─── Event Listeners ──────────────────────────────
function bindUI() {
    // Next Turn — cycles idle units first
    document.getElementById('next-turn-btn').addEventListener('click', () => {
        const idle = getIdleUnits();
        if (idle.length > 0) {
            const unit = idle[0];
            state.selectedUnit = unit;
            const pos = hexToPixel(unit.q, unit.r);
            camera.centerOn(pos.x, pos.y);
            updateMoveRange();
            updateSelectionPanel();
            return;
        }
        nextTurn();
    });

    // Map interactions
    canvas.addEventListener('mousedown', handleMapDown);
    canvas.addEventListener('click', handleMapClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Close selection panel
    document.getElementById('sel-close').addEventListener('click', () => {
        state.selectedUnit = null;
        moveRangeHexes = [];
        updateSelectionPanel();
    });

    // Modals
    document.getElementById('btn-tech').addEventListener('click', openTechTree);
    document.getElementById('btn-song-panel').addEventListener('click', openSongPanel);
    document.getElementById('btn-encyclopedia').addEventListener('click', openEncyclopedia);
    document.getElementById('btn-help').addEventListener('click', openHelpGuide);

    document.getElementById('tech-close').addEventListener('click', () => document.getElementById('tech-modal').classList.add('hidden'));
    document.getElementById('song-close').addEventListener('click', () => document.getElementById('song-modal').classList.add('hidden'));
    document.getElementById('encyclopedia-close').addEventListener('click', () => document.getElementById('encyclopedia-modal').classList.add('hidden'));
    document.getElementById('help-close').addEventListener('click', () => document.getElementById('help-modal').classList.add('hidden'));

    // Goals toggle
    document.getElementById('goals-toggle')?.addEventListener('click', () => {
        const content = document.getElementById('goals-content');
        const btn = document.getElementById('goals-toggle');
        if (content.style.display === 'none') {
            content.style.display = '';
            btn.textContent = '−';
        } else {
            content.style.display = 'none';
            btn.textContent = '+';
        }
    });
}

// ─── Init ─────────────────────────────────────────
function init() {
    const mainMenu = document.getElementById('main-menu');
    const factionPicker = document.getElementById('faction-picker');
    const settingsScreen = document.getElementById('game-settings');

    factionPicker.classList.add('hidden');
    settingsScreen.classList.add('hidden');

    // Main Menu buttons
    const continueBtn = document.getElementById('menu-continue');
    const newGameBtn = document.getElementById('menu-new-game');
    const menuEncyclopediaBtn = document.getElementById('menu-encyclopedia');

    if (hasSave()) continueBtn.classList.remove('hidden');

    continueBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        factionPicker.classList.remove('hidden');
        initFactionPicker();
    });

    // New Game → Settings
    newGameBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        settingsScreen.classList.remove('hidden');
    });

    // Settings: Map size buttons
    document.querySelectorAll('.map-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.map-size-btn').forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = '';
            });
            btn.classList.add('active');
            btn.style.borderColor = 'var(--bio-cyan)';
            gameSettings.mapCols = parseInt(btn.dataset.cols);
            gameSettings.mapRows = parseInt(btn.dataset.rows);
        });
    });

    // Settings: AI count slider
    const aiSlider = document.getElementById('ai-count-slider');
    const aiLabel = document.getElementById('ai-count-label');
    aiSlider.addEventListener('input', () => {
        gameSettings.aiCount = parseInt(aiSlider.value);
        aiLabel.textContent = aiSlider.value;
    });

    // Settings: Back
    document.getElementById('settings-back').addEventListener('click', () => {
        settingsScreen.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    });

    // Settings: Start → faction picker
    document.getElementById('settings-start').addEventListener('click', () => {
        settingsScreen.classList.add('hidden');
        factionPicker.classList.remove('hidden');
        initFactionPicker();
    });

    menuEncyclopediaBtn.addEventListener('click', openEncyclopedia);

    bindUI();
    document.addEventListener('click', () => resumeAudio(), { once: true });
}

init();
