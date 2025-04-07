// --- Constants ---
const TILE = { FLOOR: '.', WALL: '🧱', PLAYER: '🚶', EXIT: '🚪', GOLD: '💰', POTION: '✨', CHEST: '📦', ENEMY_GOBLIN: '👹', ENEMY_SKELETON: '💀', ENEMY_ORC: '👺', ENEMY_BOSS: '😈', HUB_INN: '🛌', HUB_DUNGEON_1: '①', HUB_DUNGEON_2: '②' };
const GAME_STATE = { EXPLORING: 'exploring', COMBAT: 'combat', HUB: 'hub', SHOP: 'shop', INVENTORY: 'inventory', SKILLS: 'skills', GAME_OVER: 'gameOver' };
const PLAYER_BASE_STATS = { hp: 30, mp: 10, attack: 5, defense: 2 };
const LEVEL_XP_REQUIREMENT = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000];

const ACCESSORY_TYPE = { RING: 'Anneau', AMULET: 'Amulette' };
const RARITIES = {
    COMMON:    { name: 'Commun',     color: '#b0bec5', statMultiplier: 1.0, maxStats: 1, chance: 0.50 },
    UNCOMMON:  { name: 'Incommun',   color: '#66bb6a', statMultiplier: 1.3, maxStats: 2, chance: 0.30 },
    RARE:      { name: 'Rare',       color: '#42a5f5', statMultiplier: 1.7, maxStats: 3, chance: 0.15 },
    EPIC:      { name: 'Épique',     color: '#ab47bc', statMultiplier: 2.2, maxStats: 4, chance: 0.04 },
    LEGENDARY: { name: 'Légendaire', color: '#ffa726', statMultiplier: 3.0, maxStats: 5, chance: 0.01 }
};
const POSSIBLE_ACCESSORY_STATS = ['maxHp', 'maxMp', 'attack', 'defense', 'critChance', 'dodgeChance'];
const CHEST_DROP_CHANCE = 0.15;

// --- Game Data ---
const Items = {
    'w_dagger': { name: "Dague", type: 'weapon', attack: 2, cost: 50, icon: '🗡️' },
    'w_sword': { name: "Épée Courte", type: 'weapon', attack: 5, cost: 150, icon: '⚔️' },
    'w_axe': { name: "Hache", type: 'weapon', attack: 8, cost: 300, icon: '🪓' },
    'w_staff': { name: "Bâton Magique", type: 'weapon', attack: 4, mpBonus: 5, cost: 500, icon: '🪄' },
    'w_greatsword': { name: "Espadon", type: 'weapon', attack: 12, cost: 800, icon: '🔪' },
    'a_leather': { name: "Cuir", type: 'armor', defense: 2, cost: 75, icon: '👕' },
    'a_studded': { name: "Cuir Clouté", type: 'armor', defense: 4, cost: 150, icon: '🧥'},
    'a_chain': { name: "Mailles", type: 'armor', defense: 6, cost: 300, icon: '⛓️' },
    'a_plate': { name: "Plaques", type: 'armor', defense: 9, cost: 600, icon: '🛡️' },
    'a_fullplate': { name: "Harnois", type: 'armor', defense: 12, cost: 1000, icon: '🏰'},
    'p_heal_s': { name: "Potion Soin (P)", type: 'potion', effect: 'heal', value: 20, cost: 30, icon: '❤️' },
    'p_mana_s': { name: "Potion Mana (P)", type: 'potion', effect: 'mana', value: 15, cost: 40, icon: '💧' },
};
const Skills = {
    's_power_strike': { name: "Frappe Puissante", type: 'active', mpCost: 3, effect: 'damage', multiplier: 1.5, target: 'enemy', cost: 100, icon: '💥' },
    's_quick_block': { name: "Parade Rapide", type: 'active', mpCost: 2, effect: 'defense_boost', value: 5, duration: 1, target: 'player', cost: 150, icon: '🛡️' },
    's_heal_light': { name: "Soin Léger", type: 'active', mpCost: 4, effect: 'heal', value: 25, target: 'player', cost: 250, icon: '❤️‍🩹' },
    's_focus': { name: "Focalisation", type: 'passive', effect: 'stat_boost', stat: 'maxMp', value: 5, cost: 400, icon: '🧠' },
    's_toughness': { name: "Robustesse", type: 'passive', effect: 'stat_boost', stat: 'maxHp', value: 10, cost: 500, icon: '💪' },
    's_fireball': { name: "Boule de Feu", type: 'active', mpCost: 5, effect: 'magic_damage', baseDamage: 10, target: 'enemy', cost: 750, icon: '🔥' },
    's_heavy_strike': { name: "Frappe Lourde", type: 'active', mpCost: 5, effect: 'damage', multiplier: 2.0, target: 'enemy', cost: 1100, icon: '🔨' },
    's_battle_focus': { name: "Concentration", type: 'passive', effect: 'stat_boost', stat: 'attack', value: 1, cost: 1500, icon: '🎯' },
    's_divine_blessing': { name: "Bénédiction", type: 'active', mpCost: 10, effect: 'heal', value: 60, target: 'player', cost: 1800, icon: '🌟' },
    's_master_defense': { name: "Maître Défenseur", type: 'passive', effect: 'stat_boost', stat: 'defense', value: 2, cost: 2000, icon: '🧱' }
};
const Enemies = {
    'goblin': { name: "Gobelin", tile: TILE.ENEMY_GOBLIN, hp: 15, attack: 4, defense: 1, xp: 15, gold: 5, skills: [], canDropChest: false },
    'skeleton': { name: "Squelette", tile: TILE.ENEMY_SKELETON, hp: 25, attack: 6, defense: 3, xp: 30, gold: 15, skills: [], canDropChest: true },
    'orc': { name: "Orc", tile: TILE.ENEMY_ORC, hp: 40, attack: 8, defense: 4, xp: 50, gold: 30, skills: ['s_power_strike'], canDropChest: true },
    'boss_troll': { name: "Troll Gardien", tile: TILE.ENEMY_BOSS, hp: 100, attack: 12, defense: 6, xp: 200, gold: 150, skills: ['s_power_strike'], canDropChest: true }
};
const Dungeons = {
    "hub": { name: "Village", map: [
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱",
        "🧱...........①.🧱",
        "🧱.🧱🧱🧱.🧱🧱🧱🧱🧱🧱🧱.🧱",
        "🧱.🧱.🧱.🧱🛌....🧱.🧱",
        "🧱.🧱🧱🧱.🧱🧱🧱🧱🧱🧱🧱.🧱",
        "🧱...........②.🧱",
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱"
    ], fixed: true, enemies: {}, items: {} },
    "dungeon1": { name: "Forêt Sombre", floors: 2, mapGenerator: () => generateSimpleDungeon(15, 10, 1, 3, 1), bossFloor: null },
    "dungeon2": { name: "Cavernes Oubliées", floors: 3, mapGenerator: (floor) => generateSimpleDungeon(20, 15, floor, 4 + floor, 2 + floor), bossFloor: 3, bossType: 'boss_troll' }
};

// --- Game State Variables ---
let player;
let currentDungeon = { id: null, floor: 0, map: [], enemies: {}, items: {} };
let gameState = GAME_STATE.HUB;
let combatState = { active: false, enemy: null, enemyCurrentHp: 0, playerTempDefense: 0, enemyType: null, enemyPosKey: null, playerTurn: true };
let messageLog = [];

// --- DOM Elements (Global Variable) ---
let DOM = {}; // Populated after DOMContentLoaded

// --- Utility Functions ---
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function logMessage(message) {
    // Basic sanitization for console log, keep HTML for display
    console.log(message.replace(/<span.*?>(.*?)<\/span>/g, '$1').replace(/<[^>]*>/g, ''));
    messageLog.unshift(message); // Add to the beginning
    if (messageLog.length > 20) { // Limit log size
        messageLog.pop(); // Remove the oldest message
    }
    renderLog(); // Update the visual log
}

function showView(viewElement) {
    if (!DOM || !DOM.mainViewDivs || !DOM.shopModal || !DOM.modalBackdrop) {
        console.error("showView called before DOM is ready or elements are missing.");
        return;
    }
    console.log(`showView: Current State = ${gameState}`); // Debug Log

    // Hide all main views first
    DOM.mainViewDivs.forEach(div => {
        if (div) div.classList.add('hidden'); // Check if div exists before adding class
    });

    // Show the requested main view (if any)
    if (viewElement) {
        viewElement.classList.remove('hidden');
    }

    // Handle Shop Modal Visibility Separately
    if (gameState === GAME_STATE.SHOP) {
        console.log("showView: Setting shop modal VISIBLE"); // Debug Log
        DOM.shopModal.classList.remove('hidden');
        DOM.modalBackdrop.style.display = 'block';
        // Additional check after trying to show
        if (DOM.shopModal.classList.contains('hidden')) {
            console.error("showView ERROR: Shop modal STILL hidden after trying to show!");
        }
    } else {
        if (!DOM.shopModal.classList.contains('hidden')) {
            console.log("showView: Setting shop modal HIDDEN"); // Debug Log
            DOM.shopModal.classList.add('hidden');
            DOM.modalBackdrop.style.display = 'none';
        }
    }
}


// --- Rendering Functions ---
function renderAll() {
    if (!DOM || !player) { console.warn("renderAll: DOM ou joueur non initialisé."); return; }
    console.log(`renderAll: Current State = ${gameState}`); // Debug Log
    try {
        renderStats();
        renderLocationInfo();
        GameManager.updateButtonStates();

        switch (gameState) {
            case GAME_STATE.HUB:
            case GAME_STATE.EXPLORING:
                showView(DOM.mapDisplay);
                renderDungeon();
                break;
            case GAME_STATE.COMBAT:
                showView(DOM.combatDisplay);
                renderCombat();
                break;
            case GAME_STATE.SHOP:
                 // renderShop is called, showView handles the modal visibility
                showView(null);
                renderShop();
                break;
            case GAME_STATE.INVENTORY:
                showView(DOM.inventoryDisplay);
                renderInventory();
                break;
            case GAME_STATE.SKILLS:
                showView(DOM.skillsDisplay);
                renderSkills();
                break;
            case GAME_STATE.GAME_OVER:
                showView(null); // Hide main views
                if (DOM.gameOverScreen) DOM.gameOverScreen.classList.remove('hidden');
                break;
            default: // Fallback if state is unknown
                console.warn("renderAll: État de jeu inconnu -", gameState);
                showView(DOM.mapDisplay);
                renderDungeon();
        }

        // Ensure game over screen is hidden if not in game over state
        if (gameState !== GAME_STATE.GAME_OVER && DOM.gameOverScreen) {
            DOM.gameOverScreen.classList.add('hidden');
        }
    } catch (error) {
        console.error("Erreur majeure dans renderAll:", error);
        logMessage("ERREUR CRITIQUE DE RENDU - Vérifiez la console.");
    }
}

function formatAccessoryName(accessory) {
    if (!accessory) return 'Aucun';
    const rarityInfo = RARITIES[accessory.rarity];
    if (!rarityInfo) return 'Accessoire Inconnu';
    return `<span style="color:${rarityInfo.color}; font-weight:bold;" title="${getAccessoryTooltip(accessory)}">${accessory.name || 'Accessoire'}</span>`;
}

function getAccessoryTooltip(accessory) {
    if (!accessory || !accessory.stats) return '';
    let tooltip = `${accessory.type} [${RARITIES[accessory.rarity]?.name || 'Inconnue'}]\n`;
    for (const stat in accessory.stats) {
         if (!accessory.stats.hasOwnProperty(stat)) continue;
        let statText = stat; let suffix = '';
        if (stat === 'maxHp') statText = 'PV Max'; else if (stat === 'maxMp') statText = 'PM Max';
        else if (stat === 'attack') statText = 'Attaque'; else if (stat === 'defense') statText = 'Défense';
        else if (stat === 'critChance') { statText = 'Critique'; suffix = '%'; }
        else if (stat === 'dodgeChance') { statText = 'Esquive'; suffix = '%'; }
        tooltip += `${statText}: +${accessory.stats[stat]}${suffix}\n`;
    }
    return tooltip.trim();
}

function renderStats() {
    if (!player || !DOM.statLevel) { console.warn("renderStats: Player or DOM elements missing."); return; }
    try {
        const calculatedStats = calculatePlayerStats();
        const currentXP = player.xp; const currentLevelXP = LEVEL_XP_REQUIREMENT[player.level - 1] || 0; const nextLevelXP = LEVEL_XP_REQUIREMENT[player.level] || Infinity;
        DOM.statLevel.textContent = player.level; DOM.statXP.textContent = currentXP; DOM.statXPNext.textContent = nextLevelXP !== Infinity ? nextLevelXP : 'MAX';
        DOM.statHP.textContent = player.hp; DOM.statMaxHP.textContent = calculatedStats.maxHp; DOM.statMP.textContent = player.mp; DOM.statMaxMP.textContent = calculatedStats.maxMp;
        DOM.statAttack.textContent = calculatedStats.attack; DOM.statDefense.textContent = calculatedStats.defense;
        if (DOM.statCrit) DOM.statCrit.textContent = `${calculatedStats.critChance || 0}%`; if (DOM.statDodge) DOM.statDodge.textContent = `${calculatedStats.dodgeChance || 0}%`;
        DOM.statGold.textContent = player.gold;
        DOM.statWeapon.textContent = player.equipment.weapon ? Items[player.equipment.weapon]?.name || '?' : 'Aucune'; DOM.statArmor.textContent = player.equipment.armor ? Items[player.equipment.armor]?.name || '?' : 'Aucune';
        if (DOM.statRing1) DOM.statRing1.innerHTML = formatAccessoryName(player.equipment.ring1); if (DOM.statRing2) DOM.statRing2.innerHTML = formatAccessoryName(player.equipment.ring2); if (DOM.statAmulet) DOM.statAmulet.innerHTML = formatAccessoryName(player.equipment.amulet);
        const hpPercent = calculatedStats.maxHp > 0 ? Math.min(100, (player.hp / calculatedStats.maxHp) * 100) : 0; const mpPercent = calculatedStats.maxMp > 0 ? Math.min(100, (player.mp / calculatedStats.maxMp) * 100) : 0;
        let xpPercent = 0; if (nextLevelXP !== Infinity) { const xpForLevel = nextLevelXP - currentLevelXP; const xpGained = currentXP - currentLevelXP; xpPercent = xpForLevel > 0 ? Math.min(100, (xpGained / xpForLevel) * 100) : 100; } else { xpPercent = 100; }
        DOM.hpBar.style.width = `${hpPercent}%`; DOM.mpBar.style.width = `${mpPercent}%`; DOM.xpBar.style.width = `${xpPercent}%`;
        DOM.hpBar.textContent = `${player.hp}/${calculatedStats.maxHp}`; DOM.mpBar.textContent = `${player.mp}/${calculatedStats.maxMp}`; DOM.xpBar.textContent = nextLevelXP !== Infinity ? `${currentXP}/${nextLevelXP}` : 'MAX';
    } catch(error) { console.error("Erreur dans renderStats:", error); }
}

function renderLocationInfo() {
    if (!DOM.locationInfo) return;
    let locationName = "Inconnu";
    if (!currentDungeon || !currentDungeon.id) locationName = "Nulle Part";
    else if (gameState === GAME_STATE.HUB || currentDungeon.id === 'hub') locationName = Dungeons['hub']?.name || "Village";
    else if (Dungeons[currentDungeon.id]) locationName = `${Dungeons[currentDungeon.id].name} - Étage ${currentDungeon.floor}`;
    DOM.locationInfo.textContent = `Lieu: ${locationName}`;
}

function renderLog() {
    if(DOM.messageLogElement) {
        try { DOM.messageLogElement.innerHTML = '<h3>Log</h3>' + messageLog.map(msg => `<p>${msg}</p>`).join(''); DOM.messageLogElement.scrollTop = 0; }
        catch(error) { console.error("Erreur dans renderLog:", error); }
    }
}

function renderDungeon() {
    if (!DOM.mapDisplay) return;
    let mapHTML = '';
    if (!currentDungeon?.map?.length) { DOM.mapDisplay.innerHTML = '<p style="color: white;">Erreur: Carte non chargée.</p>'; return; }
    try {
        const mapHeight = currentDungeon.map.length; const mapWidth = currentDungeon.map[0].length;
        for (let y = 0; y < mapHeight; y++) { for (let x = 0; x < mapWidth; x++) {
                const posKey = `${x},${y}`; let mapChar = currentDungeon.map[y]?.[x] || TILE.WALL; let tileClasses = ['tile']; let title = '';
                if (player && player.pos.x === x && player.pos.y === y) { tileClasses.push('tile-player'); title = "Vous"; }
                else if (currentDungeon.enemies?.[posKey]) { const enemyData = currentDungeon.enemies[posKey]; const enemyInfo = Enemies[enemyData.type]; if(enemyInfo){ tileClasses.push('tile-enemy'); if (enemyInfo.tile === TILE.ENEMY_GOBLIN) tileClasses.push('tile-enemy-g'); else if (enemyInfo.tile === TILE.ENEMY_SKELETON) tileClasses.push('tile-enemy-s'); else if (enemyInfo.tile === TILE.ENEMY_ORC) tileClasses.push('tile-enemy-o'); else if (enemyInfo.tile === TILE.ENEMY_BOSS) tileClasses.push('tile-enemy-b'); else tileClasses.push('tile-enemy-g'); title = enemyInfo.name; } else { tileClasses.push('tile-floor'); } }
                else if (currentDungeon.items?.[posKey]) { const item = currentDungeon.items[posKey]; if (item.type === 'chest') { tileClasses.push('tile-chest'); title = "Coffre"; } else { tileClasses.push('tile-item'); if (item.type === 'gold') { tileClasses.push('tile-gold'); title = `${item.value} Or`; } else if (item.type === 'potion') { tileClasses.push('tile-potion'); title = Items[item.itemId]?.name || "Potion"; } } }
                else { switch (mapChar) { case TILE.WALL: tileClasses.push('tile-wall'); title = "Mur"; break; case TILE.FLOOR: tileClasses.push('tile-floor'); break; case TILE.EXIT: tileClasses.push('tile-exit'); title = "Sortie"; break; case TILE.HUB_INN: tileClasses.push('tile-hub', 'tile-hub-inn'); title = "Auberge"; break; case TILE.HUB_DUNGEON_1: tileClasses.push('tile-hub', 'tile-hub-dungeon', 'dungeon-1'); title = Dungeons['dungeon1']?.name || "Donjon 1"; break; case TILE.HUB_DUNGEON_2: tileClasses.push('tile-hub', 'tile-hub-dungeon', 'dungeon-2'); title = Dungeons['dungeon2']?.name || "Donjon 2"; break; default: tileClasses.push('tile-floor'); } }
                mapHTML += `<span class="${tileClasses.join(' ')}" title="${title}"></span>`; } mapHTML += '\n'; }
        DOM.mapDisplay.innerHTML = mapHTML;
    } catch(error) { console.error("Erreur dans renderDungeon:", error); DOM.mapDisplay.innerHTML = "<p style='color:red'>Erreur affichage carte.</p>"; }
}

function renderCombat() {
    if (!DOM.combatDisplay) return;
    if (!combatState.active || !combatState.enemy) { DOM.combatDisplay.innerHTML = "<p>Erreur Combat.</p>"; return; }
    try {
        const enemy = combatState.enemy; const playerStats = calculatePlayerStats();
        let combatHTML = `<h2>Combat !</h2><div class="combat-participants"><div class="combatant-info"><h3>Vous (🚶)</h3><p>PV: ${player.hp}/${playerStats.maxHp}</p><p>PM: ${player.mp}/${playerStats.maxMp}</p><p>Att: ${playerStats.attack}</p><p>Déf: ${playerStats.defense + combatState.playerTempDefense}</p>${combatState.playerTempDefense > 0 ? '<p style="font-size:0.9em; color:lightblue;">(Défense +'+combatState.playerTempDefense+' temp.)</p>' : ''}</div><div class="combatant-info"><h3>${enemy.name} (${enemy.tile})</h3><p>PV: ${combatState.enemyCurrentHp}/${enemy.hp}</p><p>Att: ${enemy.attack}</p><p>Déf: ${enemy.defense}</p></div></div><div class="combat-actions"><button class="action-button" onclick="CombatManager.playerAction('attack')">⚔️ Attaquer</button><button class="action-button" onclick="CombatManager.showSkillSelection()">✨ Compétence</button><button class="action-button" onclick="CombatManager.showItemSelection()">🎒 Objet</button><button class="action-button" onclick="CombatManager.playerAction('defend')">🛡️ Défendre</button><button class="action-button" onclick="CombatManager.playerAction('flee')" ${enemy.tile === TILE.ENEMY_BOSS ? 'disabled' : ''}>🏃 Fuir</button></div><div id="combat-skill-selection" class="hidden"></div><div id="combat-item-selection" class="hidden"></div>`;
        DOM.combatDisplay.innerHTML = combatHTML;
    } catch(error) { console.error("Erreur dans renderCombat:", error); DOM.combatDisplay.innerHTML = "<p style='color:red'>Erreur affichage combat.</p>"; }
}

function renderShop() {
    console.log("renderShop: Début de l'exécution."); // LOGGING
    if (!player || !DOM.shopGoldDisplay || !DOM.shopContent) { console.error("renderShop: Prérequis manquants (player, DOM elements)."); return; }
    try {
        DOM.shopGoldDisplay.textContent = player.gold;
        let shopHTML = ''; const itemCategories = { 'Armes': [], 'Armures': [], 'Consommables': [], 'Compétences': [], 'Vendre': [] };
        for (const id in Items) { if(!Items.hasOwnProperty(id)) continue; const item = Items[id]; if (item.type === 'weapon') itemCategories['Armes'].push(id); else if (item.type === 'armor') itemCategories['Armures'].push(id); else if (item.type === 'potion') itemCategories['Consommables'].push(id); }
        for (const id in Skills) { if(!Skills.hasOwnProperty(id)) continue; if (!player.skills.includes(id)) itemCategories['Compétences'].push(id); }
        for(const itemId in player.inventory) { if(!player.inventory.hasOwnProperty(itemId)) continue; if(player.inventory[itemId] > 0 && Items[itemId] && (Items[itemId].type === 'weapon' || Items[itemId].type === 'armor')) { if(player.equipment.weapon !== itemId && player.equipment.armor !== itemId) itemCategories['Vendre'].push(itemId); } }
        for (const categoryName in itemCategories) { if (!itemCategories.hasOwnProperty(categoryName)) continue; if (itemCategories[categoryName].length > 0 || categoryName === 'Vendre') { shopHTML += `<div class="shop-category"><h3>${categoryName}</h3>`; if (categoryName === 'Vendre') { shopHTML += '<p style="font-size: 0.9em; color: var(--text-medium);">Vendez votre équipement (50% prix).</p>'; if (itemCategories['Vendre'].length === 0) shopHTML += "<p><i>Rien à vendre.</i></p>"; } itemCategories[categoryName].forEach(id => { let itemData, cost, effectText, icon, actionButton; const isSelling = categoryName === 'Vendre'; let itemName = 'Objet Inconnu'; try { if (isSelling) { itemData = Items[id]; cost = Math.floor(itemData?.cost * 0.5 || 0); effectText = `Qté: ${player.inventory[id]}`; icon = itemData?.icon || '❓'; itemName = itemData?.name || '?'; actionButton = `<button class="shop-button modal-button" onclick="ShopManager.sellItem('${id}')">Vendre 1 (💰 ${cost})</button>`; } else if (categoryName === 'Compétences') { itemData = Skills[id]; cost = itemData?.cost || 0; effectText = getSkillDescription(itemData) + (itemData?.type === 'active' ? ` (${itemData?.mpCost}💧)` : ' (P)'); icon = itemData?.icon || '❓'; itemName = itemData?.name || '?'; const canAfford = player.gold >= cost; actionButton = `<button class="shop-button modal-button" data-item-id="${id}" onclick="ShopManager.learnSkill('${id}')" ${!canAfford || cost <= 0 ? 'disabled' : ''}>Apprendre</button>`; } else { itemData = Items[id]; cost = itemData?.cost || 0; if (itemData?.type === 'weapon') effectText = `Att+${itemData.attack||0}${itemData.mpBonus ? ',PM+'+itemData.mpBonus : ''}`; else if (itemData?.type === 'armor') effectText = `Déf+${itemData.defense||0}`; else if (itemData?.type === 'potion') effectText = itemData.effect === 'heal' ? `Soigne ${itemData.value}PV` : `Rend ${itemData.value}PM`; else effectText = ''; icon = itemData?.icon || '❓'; itemName = itemData?.name || '?'; const canAfford = player.gold >= cost; actionButton = `<button class="shop-button modal-button" data-item-id="${id}" onclick="ShopManager.buyItem('${id}')" ${!canAfford || cost <= 0 ? 'disabled' : ''}>Acheter</button>`; } shopHTML += `<div class="shop-item"><span class="shop-item-icon">${icon}</span><div class="shop-item-info"><span class="shop-item-name">${itemName}</span><span class="shop-item-effect">${effectText}</span></div>${!isSelling ? `<span class="shop-item-cost">💰 ${cost}</span>` : ''}${actionButton}</div>`; } catch (e) { console.error(`Erreur rendu item ${id} boutique:`, e); shopHTML += `<div class='shop-item' style='color:red;'>Erreur rendu item ${id}</div>`; } }); shopHTML += `</div>`; } }
        DOM.shopContent.innerHTML = shopHTML;
        console.log("renderShop: Contenu HTML généré et appliqué."); // LOGGING
    } catch (error) { console.error("Erreur majeure dans renderShop:", error); if (DOM.shopContent) DOM.shopContent.innerHTML = "<p style='color:red;'>Erreur chargement boutique.</p>"; }
    console.log("renderShop: Fin de l'exécution."); // LOGGING
}

function renderInventory() { /* ... (Identique, mais utilise DOM.inventoryDisplay et DOM.invEqXYZ) ... */
    if (!player || !DOM.inventoryDisplay) return; let inventoryHTML = `<h2>🎒 Inventaire</h2>`; try {
        inventoryHTML += `<h3>Équipement</h3>`;
        inventoryHTML += `<div class="list-item"><span>🗡️ Arme: <strong id="inv-eq-weapon">${player.equipment.weapon ? Items[player.equipment.weapon]?.name || '?' : 'Aucune'}</strong></span>${player.equipment.weapon ? `<button class="inventory-button" onclick="InventoryManager.unequipItem('weapon')">Déséquiper</button>` : ''}</div>`;
        inventoryHTML += `<div class="list-item"><span>👕 Armure: <strong id="inv-eq-armor">${player.equipment.armor ? Items[player.equipment.armor]?.name || '?' : 'Aucune'}</strong></span>${player.equipment.armor ? `<button class="inventory-button" onclick="InventoryManager.unequipItem('armor')">Déséquiper</button>` : ''}</div>`;
        inventoryHTML += `<div class="list-item"><span>💍 Anneau 1: <strong id="inv-eq-ring1">${formatAccessoryName(player.equipment.ring1)}</strong></span>${player.equipment.ring1 ? `<button class="inventory-button" onclick="InventoryManager.unequipAccessory('ring1')">Déséquiper</button>` : ''}</div>`;
        inventoryHTML += `<div class="list-item"><span>💍 Anneau 2: <strong id="inv-eq-ring2">${formatAccessoryName(player.equipment.ring2)}</strong></span>${player.equipment.ring2 ? `<button class="inventory-button" onclick="InventoryManager.unequipAccessory('ring2')">Déséquiper</button>` : ''}</div>`;
        inventoryHTML += `<div class="list-item"><span>📿 Amulette: <strong id="inv-eq-amulet">${formatAccessoryName(player.equipment.amulet)}</strong></span>${player.equipment.amulet ? `<button class="inventory-button" onclick="InventoryManager.unequipAccessory('amulet')">Déséquiper</button>` : ''}</div>`;
        inventoryHTML += `<h3>Objets Consommables</h3>`; let hasConsumables = false;
        for (const itemId in player.inventory) { if(!player.inventory.hasOwnProperty(itemId)) continue; if (player.inventory[itemId] > 0 && Items[itemId]?.type === 'potion') { hasConsumables = true; const item = Items[itemId]; inventoryHTML += `<div class="list-item"><span>${item.icon || '?'} <strong>${item.name}</strong> x ${player.inventory[itemId]}</span><span> <button class="inventory-button" onclick="InventoryManager.usePotion('${itemId}')">Utiliser</button> </span></div>`; } } if (!hasConsumables) inventoryHTML += "<p><i>Aucun consommable.</i></p>";
        inventoryHTML += `<h3>Accessoires Non Équipés</h3>`; if (!player.accessoriesInventory || player.accessoriesInventory.length === 0) { inventoryHTML += "<p><i>Aucun accessoire trouvé.</i></p>"; } else { player.accessoriesInventory.forEach((acc, index) => { if (!acc) { console.warn(`Acc null index ${index}`); return; } const rarityInfo = RARITIES[acc.rarity]; if (!rarityInfo) return; let statsHTML = '<em class="accessory-stats">'; let statsCount = 0; for (const stat in acc.stats) { if (!acc.stats.hasOwnProperty(stat)) continue; let statText = stat.replace('maxHp', 'PV+').replace('maxMp', 'PM+').replace('attack', 'Att+').replace('defense', 'Def+').replace('critChance', 'Crit%').replace('dodgeChance', 'Esq%'); statsHTML += `${statsCount > 0 ? ', ' : ''}${statText}${acc.stats[stat]}`; statsCount++; } statsHTML += '</em>'; inventoryHTML += `<div class="list-item accessory-item"><span class="accessory-name" style="color:${rarityInfo.color};" title="${getAccessoryTooltip(acc)}">${acc.type === ACCESSORY_TYPE.RING ? '💍' : '📿'} <strong>${acc.name || 'Accessoire'}</strong> [${rarityInfo.name}]</span>${statsHTML}<button class="inventory-button equip-button" onclick="InventoryManager.equipAccessory('${acc.id}')">Équiper</button></div>`; }); }
        inventoryHTML += '<hr><button class="modal-button" onclick="GameManager.closeInventory()">Fermer</button>';
    } catch (error) { console.error("Erreur renderInventory:", error); inventoryHTML = "<h2>Erreur Inventaire</h2><p>Impossible d'afficher.</p><hr><button class='modal-button' onclick='GameManager.closeInventory()'>Fermer</button>"; }
    DOM.inventoryDisplay.innerHTML = inventoryHTML;
    const invEqW = document.getElementById('inv-eq-weapon'); if(invEqW) invEqW.innerHTML = player.equipment.weapon ? Items[player.equipment.weapon]?.name || '?' : 'Aucune'; const invEqA = document.getElementById('inv-eq-armor'); if(invEqA) invEqA.innerHTML = player.equipment.armor ? Items[player.equipment.armor]?.name || '?' : 'Aucune'; const invEqR1 = document.getElementById('inv-eq-ring1'); if(invEqR1) invEqR1.innerHTML = formatAccessoryName(player.equipment.ring1); const invEqR2 = document.getElementById('inv-eq-ring2'); if(invEqR2) invEqR2.innerHTML = formatAccessoryName(player.equipment.ring2); const invEqAm = document.getElementById('inv-eq-amulet'); if(invEqAm) invEqAm.innerHTML = formatAccessoryName(player.equipment.amulet);
}
function renderSkills() { /* ... (Identique, mais utilise DOM.skillsDisplay) ... */ if (!player || !DOM.skillsDisplay) return; let skillsHTML = `<h2>✨ Compétences</h2>`; try { if (!player.skills || player.skills.length === 0) { skillsHTML += "<p><i>Aucune compétence connue.</i></p>"; } else { let actives = player.skills.filter(id => Skills[id]?.type === 'active'); let passives = player.skills.filter(id => Skills[id]?.type === 'passive'); skillsHTML += "<h3>Actives</h3>"; if (actives.length > 0) { actives.forEach(id => { const s = Skills[id]; skillsHTML += `<div class="list-item"><span>${s.icon || '?'} <strong>${s.name}</strong></span><em>${getSkillDescription(s)} (Coût: ${s.mpCost}💧)</em></div>`; }); } else skillsHTML += "<p><i>Aucune compétence active.</i></p>"; skillsHTML += "<h3>Passives</h3>"; if (passives.length > 0) { passives.forEach(id => { const s = Skills[id]; skillsHTML += `<div class="list-item"><span>${s.icon || '?'} <strong>${s.name}</strong></span><em>${getSkillDescription(s)}</em></div>`; }); } else skillsHTML += "<p><i>Aucune compétence passive.</i></p>"; } skillsHTML += '<hr><button class="modal-button" onclick="GameManager.closeSkills()">Fermer</button>'; } catch (error) { console.error("Erreur renderSkills:", error); skillsHTML = "<h2>Erreur Compétences</h2><p>Impossible d'afficher.</p><hr><button class='modal-button' onclick='GameManager.closeSkills()'>Fermer</button>"; } if (DOM.skillsDisplay) DOM.skillsDisplay.innerHTML = skillsHTML; }

function calculatePlayerStats() { /* ... (Identique à la version précédente) ... */ if (!player) return PLAYER_BASE_STATS; let combinedStats = { maxHp: PLAYER_BASE_STATS.hp + (player.levelBonus?.maxHp || 0), maxMp: PLAYER_BASE_STATS.mp + (player.levelBonus?.maxMp || 0), attack: PLAYER_BASE_STATS.attack + (player.levelBonus?.attack || 0), defense: PLAYER_BASE_STATS.defense + (player.levelBonus?.defense || 0), critChance: 0, dodgeChance: 0 }; if (player.equipment?.weapon && Items[player.equipment.weapon]) { const w = Items[player.equipment.weapon]; combinedStats.attack += w.attack || 0; combinedStats.maxMp += w.mpBonus || 0; } if (player.equipment?.armor && Items[player.equipment.armor]) { combinedStats.defense += Items[player.equipment.armor].defense || 0; } player.skills?.forEach(skillId => { const skill = Skills[skillId]; if (skill?.type === 'passive' && skill.effect === 'stat_boost' && combinedStats.hasOwnProperty(skill.stat)) { combinedStats[skill.stat] += skill.value; } }); ['ring1', 'ring2', 'amulet'].forEach(slot => { const accessory = player.equipment?.[slot]; if (accessory?.stats) { for (const statName in accessory.stats) { if (accessory.stats.hasOwnProperty(statName) && combinedStats.hasOwnProperty(statName)) { combinedStats[statName] += accessory.stats[statName]; } } } }); combinedStats.maxHp = Math.max(1, combinedStats.maxHp); combinedStats.maxMp = Math.max(0, combinedStats.maxMp); combinedStats.attack = Math.max(0, combinedStats.attack); combinedStats.defense = Math.max(0, combinedStats.defense); combinedStats.critChance = Math.max(0, combinedStats.critChance); combinedStats.dodgeChance = Math.max(0, combinedStats.dodgeChance); return combinedStats; }
function generateSimpleDungeon(w, h, f, maxE, maxI) { /* ... (Identique à la version précédente) ... */ let m=Array.from({length:h},()=>Array(w).fill(TILE.WALL)),e={},i={},sP={x:-1,y:-1},eP={x:-1,y:-1},cX=Math.floor(w/2),cY=Math.floor(h/2);m[cY][cX]=TILE.FLOOR;sP={x:cX,y:cY};let fT=1;const tFT=Math.floor(w*h*0.4);let d=[[0,-1],[0,1],[-1,0],[1,0]],st=0,mS=w*h*5;while(fT<tFT&&st<mS){d.sort(()=>Math.random()-0.5);let mv=false;for(let k=0;k<d.length;k++){let[dx,dy]=d[k],nX=cX+dx*2,nY=cY+dy*2;if(nX>0&&nX<w-1&&nY>0&&nY<h-1){if(m[cY+dy]?.[cX+dx]===TILE.WALL){m[cY+dy][cX+dx]=TILE.FLOOR;fT++;}if(m[nY]?.[nX]===TILE.WALL){m[nY][nX]=TILE.FLOOR;fT++;}cX=nX;cY=nY;mv=true;break;}}if(!mv){let fC=[];for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(m[y]?.[x]===TILE.FLOOR)fC.push({x,y});if(fC.length>0){const rC=fC[getRandomInt(0,fC.length-1)];cX=rC.x;cY=rC.y;}else break;}st++;}let mD=-1,fC=[];for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(m[y]?.[x]===TILE.FLOOR){fC.push({x,y});let ds=Math.abs(x-sP.x)+Math.abs(y-sP.y);if(ds>mD){mD=ds;eP={x,y};}}if(eP.x!==-1&&m[eP.y]?.[eP.x]===TILE.FLOOR)m[eP.y][eP.x]=TILE.EXIT;else if(fC.length>0){const fEP=fC[getRandomInt(0,fC.length-1)];eP={x:fEP.x,y:fEP.y};m[eP.y][eP.x]=TILE.EXIT;}else{m[cY][cX]=TILE.EXIT;eP={x:cX,y:cY};}let eC=0,t=0;const eT=f<=1?['goblin']:(f<=2?['goblin','skeleton']:['skeleton','orc']);let aC=fC.filter(c=>(c.x!==sP.x||c.y!==sP.y)&&(c.x!==eP.x||c.y!==eP.y));while(eC<maxE&&t<maxE*10&&aC.length>0){let rI=getRandomInt(0,aC.length-1),p=aC.splice(rI,1)[0],pK=`${p.x},${p.y}`;if(!e[pK]&&!i[pK]&&m[p.y]?.[p.x]===TILE.FLOOR){const eTy=eT[getRandomInt(0,eT.length-1)];e[pK]={type:eTy,originalPos:{...p}};eC++;}t++;}const dD=Dungeons[currentDungeon?.id];if(dD&&dD.bossFloor===f&&dD.bossType){let bP=false,pBS=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(Math.abs(dx)+Math.abs(dy)!==1)continue;let cX=eP.x+dx,cY=eP.y+dy,cK=`${cX},${cY}`;if(cX>0&&cX<w-1&&cY>0&&cY<h-1&&m[cY]?.[cX]===TILE.FLOOR&&!e[cK]&&!i[cK])pBS.push({x:cX,y:cY});}if(pBS.length>0){const bPos=pBS[getRandomInt(0,pBS.length-1)],bK=`${bPos.x},${bPos.y}`;e[bK]={type:dD.bossType,originalPos:{...bPos}};bP=true;aC=aC.filter(c=>c.x!==bPos.x||c.y!==bPos.y);}if(!bP&&aC.length>0){let rI=getRandomInt(0,aC.length-1),p=aC.splice(rI,1)[0],pK=`${p.x},${p.y}`;if(!e[pK]&&!i[pK]&&m[p.y]?.[p.x]===TILE.FLOOR)e[pK]={type:dD.bossType,originalPos:{...p}};}}let iC=0;t=0;while(iC<maxI&&t<maxI*10&&aC.length>0){let rI=getRandomInt(0,aC.length-1),p=aC.splice(rI,1)[0],pK=`${p.x},${p.y}`;if(!e[pK]&&!i[pK]&&m[p.y]?.[p.x]===TILE.FLOOR){if(Math.random()<0.7)i[pK]={type:'gold',value:getRandomInt(5*f,15*f)};else{const pT=['p_heal_s','p_mana_s'],pId=pT[getRandomInt(0,pT.length-1)];i[pK]={type:'potion',itemId:pId};}iC++;}t++;}return{map:m,enemies:e,items:i,startPos:sP}; }
const AccessoryGenerator = { /* ... (Identique à la version précédente) ... */ createAccessory: function(rarityKey) { const rarity = RARITIES[rarityKey]; if (!rarity) { console.error("Rareté invalide:", rarityKey); rarityKey = 'COMMON'; rarity = RARITIES.COMMON; } const accessory = { id: Date.now() + '-' + Math.random().toString(36).substring(2, 9), type: Math.random() < 0.6 ? ACCESSORY_TYPE.RING : ACCESSORY_TYPE.AMULET, rarity: rarityKey, name: '', stats: {} }; let availableStats = [...POSSIBLE_ACCESSORY_STATS]; const numStats = Math.min(availableStats.length, rarity.maxStats); for (let i = 0; i < numStats; i++) { if (availableStats.length === 0) break; const statIndex = getRandomInt(0, availableStats.length - 1); const statName = availableStats.splice(statIndex, 1)[0]; let value = 0; let baseValue = 1; switch (statName) { case 'maxHp': baseValue = getRandomInt(5, 10); break; case 'maxMp': baseValue = getRandomInt(3, 7); break; case 'attack': baseValue = getRandomInt(1, 2); break; case 'defense': baseValue = getRandomInt(1, 2); break; case 'critChance': baseValue = getRandomInt(1, 3); break; case 'dodgeChance': baseValue = getRandomInt(1, 3); break; } value = Math.max(1, Math.round(baseValue * rarity.statMultiplier * (0.8 + Math.random() * 0.4))); accessory.stats[statName] = value; } accessory.name = `${accessory.type} ${this.generateNameSuffix(accessory.stats)}`; return accessory; }, generateNameSuffix: function(stats) { let bestStat = ''; let bestValue = -1; for (const stat in stats) { if(!stats.hasOwnProperty(stat)) continue; let currentWeight = 1; switch (stat) { case 'maxHp': currentWeight = 0.2; break; case 'maxMp': currentWeight = 0.3; break; case 'attack': currentWeight = 1.5; break; case 'defense': currentWeight = 1.2; break; } let weightedValue = stats[stat] * currentWeight; if (weightedValue > bestValue) { bestValue = weightedValue; bestStat = stat; } } switch (bestStat) { case 'maxHp': return "de Vitalité"; case 'maxMp': return "d'Esprit"; case 'attack': return "de Force"; case 'defense': return "de Garde"; case 'critChance': return "de Précision"; case 'dodgeChance': return "d'Agilité"; default: return "Mystérieux"; } } };

// --- GameManager Object ---
// (GameManager object remains the same, uses DOM.)
const GameManager = {
    initialize: function() {
        DOM = getElements(); // Fetch elements ONCE
        if (!this.loadGame()) {
            player = { level: 1, xp: 0, hp: PLAYER_BASE_STATS.hp, mp: PLAYER_BASE_STATS.mp, gold: 20, pos: { x: -1, y: -1 }, equipment: { weapon: null, armor: null, ring1: null, ring2: null, amulet: null }, inventory: { 'p_heal_s': 1 }, accessoriesInventory: [], skills: [], levelBonus: { maxHp: 0, maxMp: 0, attack: 0, defense: 0 } };
            this.enterHub();
        } else {
             if (messageLog.length === 0) logMessage("Partie chargée.");
             player.levelBonus = player.levelBonus || { maxHp: 0, maxMp: 0, attack: 0, defense: 0 }; player.skills = player.skills || []; player.inventory = player.inventory || {}; player.accessoriesInventory = player.accessoriesInventory || [];
             player.equipment = player.equipment || {}; player.equipment.weapon = player.equipment.weapon || null; player.equipment.armor = player.equipment.armor || null; player.equipment.ring1 = player.equipment.ring1 || null; player.equipment.ring2 = player.equipment.ring2 || null; player.equipment.amulet = player.equipment.amulet || null;
        }
        document.addEventListener('keydown', this.handleInput.bind(this));
        renderAll(); // Initial render
    },
    handleInput: function(event) { if (gameState === GAME_STATE.GAME_OVER) return; if (event.key === 'Escape') { if (gameState === GAME_STATE.SHOP) this.exitShop(); else if (gameState === GAME_STATE.INVENTORY) this.closeInventory(); else if (gameState === GAME_STATE.SKILLS) this.closeSkills(); else if (gameState === GAME_STATE.COMBAT) { CombatManager.hideSkillSelection(); CombatManager.hideItemSelection(); } return; } if (gameState === GAME_STATE.EXPLORING || gameState === GAME_STATE.HUB) { let dx = 0, dy = 0; switch (event.key) { case 'ArrowUp': case 'w': dy = -1; break; case 'ArrowDown': case 's': dy = 1; break; case 'ArrowLeft': case 'a': dx = -1; break; case 'ArrowRight': case 'd': dx = 1; break; default: return; } event.preventDefault(); this.movePlayer(dx, dy); } },
    movePlayer: function(dx, dy) { if (!currentDungeon?.map?.length || !player) return; const newX = player.pos.x + dx; const newY = player.pos.y + dy; if (newY < 0 || newY >= currentDungeon.map.length || newX < 0 || newX >= currentDungeon.map[0]?.length) { return; } const targetTileChar = currentDungeon.map[newY]?.[newX]; const targetPosKey = `${newX},${newY}`; if (targetTileChar === TILE.WALL) { return; } if (currentDungeon.enemies?.[targetPosKey]) { CombatManager.startCombat(currentDungeon.enemies[targetPosKey].type, targetPosKey); return; } if (targetTileChar === TILE.EXIT) { this.changeFloor(currentDungeon.floor + 1); return; } if (currentDungeon.id === 'hub') { if (targetTileChar === TILE.HUB_INN) { this.useInn(); return; } if (targetTileChar === TILE.HUB_DUNGEON_1) { this.enterDungeon('dungeon1'); return; } if (targetTileChar === TILE.HUB_DUNGEON_2) { this.enterDungeon('dungeon2'); return; } } player.pos.x = newX; player.pos.y = newY; const currentPosKey = `${newX},${newY}`; if (currentDungeon.items?.[currentPosKey]) { const item = currentDungeon.items[currentPosKey]; if (item.type === 'chest') { this.openChest(currentPosKey); } else if (item.type === 'gold') { player.gold += item.value; logMessage(`Trouvé ${item.value} ${TILE.GOLD}.`); delete currentDungeon.items[currentPosKey]; } else if (item.type === 'potion') { InventoryManager.addInventoryItem(item.itemId, 1); logMessage(`Ramassé: ${Items[item.itemId]?.icon || '?'} ${Items[item.itemId]?.name || 'potion'}.`); delete currentDungeon.items[currentPosKey]; } } renderAll(); },
    openChest: function(posKey) { logMessage(`Vous ouvrez le ${TILE.CHEST} coffre...`); delete currentDungeon.items[posKey]; let randomRoll = Math.random(); let cumulativeChance = 0; let chosenRarity = 'COMMON'; for (const rKey in RARITIES) { if(!RARITIES.hasOwnProperty(rKey)) continue; cumulativeChance += RARITIES[rKey].chance; if (randomRoll < cumulativeChance) { chosenRarity = rKey; break; } } const accessory = AccessoryGenerator.createAccessory(chosenRarity); player.accessoriesInventory.push(accessory); const rarityInfo = RARITIES[chosenRarity]; logMessage(`Trouvé: <span style="color:${rarityInfo.color}; font-weight:bold;">[${rarityInfo.name}] ${accessory.name}</span> !`); this.saveGame(); },
    changeFloor: function(newFloor) { const dungeonData = Dungeons[currentDungeon.id]; if (!dungeonData || dungeonData.fixed) { this.enterHub(); return; } if (newFloor > dungeonData.floors) { logMessage(`${dungeonData.name} terminé ! Retour au village.`); this.enterHub(); } else { logMessage(`${newFloor > currentDungeon.floor ? 'Descente' : 'Montée'} vers l'étage ${newFloor}...`); currentDungeon.floor = newFloor; const generated = dungeonData.mapGenerator(newFloor); currentDungeon.map = generated.map; currentDungeon.enemies = generated.enemies; currentDungeon.items = generated.items; player.pos = { ...generated.startPos }; gameState = GAME_STATE.EXPLORING; this.saveGame(); } renderAll(); },
    enterDungeon: function(dungeonId) { const dData = Dungeons[dungeonId]; if (!dData || dData.fixed) return; logMessage(`Entrée dans ${dData.name}...`); currentDungeon = { id: dungeonId, floor: 1 }; const g = dData.mapGenerator(1); currentDungeon.map = g.map; currentDungeon.enemies = g.enemies; currentDungeon.items = g.items; player.pos = { ...g.startPos }; gameState = GAME_STATE.EXPLORING; this.saveGame(); renderAll(); },
    enterHub: function() { currentDungeon = { id: 'hub', floor: 0 }; const hData = Dungeons['hub']; currentDungeon.map = hData.map.map(r => r.split('')); currentDungeon.enemies = {}; currentDungeon.items = {}; let foundStart = false; for(let y = 0; y < currentDungeon.map.length && !foundStart; y++) { for (let x = 0; x < currentDungeon.map[y].length && !foundStart; x++) { if (currentDungeon.map[y]?.[x] === TILE.FLOOR || currentDungeon.map[y]?.[x] === TILE.HUB_INN) { player.pos = { x: x, y: y }; foundStart = true; } } } if(!foundStart) player.pos = {x: 1, y: 1}; gameState = GAME_STATE.HUB; logMessage(`Bienvenue Village ! ${TILE.HUB_INN}:Auberge, ${TILE.HUB_DUNGEON_1}/${TILE.HUB_DUNGEON_2}:Donjons.`); renderAll(); },
    enterShop: function() { console.log("enterShop: Called."); if (gameState === GAME_STATE.HUB) { console.log("  -> State is HUB. Changing to SHOP."); logMessage("Ouverture boutique..."); gameState = GAME_STATE.SHOP; renderAll(); console.log("  -> renderAll called after setting state to SHOP."); } else { logMessage("Boutique accessible au Village."); console.log("  -> State is NOT HUB. Cannot open shop."); } },
    exitShop: function() { if(gameState === GAME_STATE.SHOP) { console.log("exitShop: Closing shop."); logMessage("Fermeture boutique."); gameState = GAME_STATE.HUB; renderAll(); } },
    useInn: function() { const cost = 10 + (player.level * 2); if (player.gold >= cost) { player.gold -= cost; const stats = calculatePlayerStats(); player.hp = stats.maxHp; player.mp = stats.maxMp; logMessage(`Repos ${TILE.HUB_INN} (-${cost} ${TILE.GOLD}). PV/PM Max !`); this.saveGame(); renderAll(); } else { logMessage(`Pas assez d'or (${player.gold}/${cost} ${TILE.GOLD}).`); } },
    gainXP: function(amount) { if (amount <= 0 || !player) return; player.xp += amount; logMessage(`+${amount} XP.`); this.checkLevelUp(); /* Let level up handle render */ },
    checkLevelUp: function() { if (!player) return; let leveledUp = false; while (true) { const xpNeeded = LEVEL_XP_REQUIREMENT[player.level]; if (xpNeeded && player.xp >= xpNeeded && player.level < LEVEL_XP_REQUIREMENT.length - 1 ) { const xpKept = player.xp - xpNeeded; player.level++; player.xp = xpKept; leveledUp = true; logMessage(`⭐ Niveau ${player.level} ! ⭐`); const hpGain=getRandomInt(3,6); const mpGain=getRandomInt(1,3); const attackGain=getRandomInt(1,2); const defenseGain=getRandomInt(0,1); player.levelBonus.maxHp += hpGain; player.levelBonus.maxMp += mpGain; player.levelBonus.attack += attackGain; player.levelBonus.defense += defenseGain; const stats=calculatePlayerStats(); player.hp = Math.min(player.hp + Math.ceil(stats.maxHp*0.25), stats.maxHp); player.mp = Math.min(player.mp + Math.ceil(stats.maxMp*0.25), stats.maxMp); logMessage(`Stats + | PV/PM restaurés.`); } else { break; /* Exit loop if no more level ups */ } } if (leveledUp) { this.saveGame(); renderAll(); } else { renderStats(); /* Still render stats if XP gained but no level */ } },
    toggleInventory: function() { if (gameState === GAME_STATE.INVENTORY) { this.closeInventory(); } else if (gameState === GAME_STATE.EXPLORING || gameState === GAME_STATE.HUB) { gameState = GAME_STATE.INVENTORY; renderAll(); } else { logMessage("Inventaire inaccessible."); } },
    closeInventory: function() { if (currentDungeon?.id === 'hub') gameState = GAME_STATE.HUB; else gameState = GAME_STATE.EXPLORING; renderAll(); },
    toggleSkills: function() { if (gameState === GAME_STATE.SKILLS) { this.closeSkills(); } else if (gameState === GAME_STATE.EXPLORING || gameState === GAME_STATE.HUB) { gameState = GAME_STATE.SKILLS; renderAll(); } else { logMessage("Compétences inaccessibles."); } },
    closeSkills: function() { if (currentDungeon?.id === 'hub') gameState = GAME_STATE.HUB; else gameState = GAME_STATE.EXPLORING; renderAll(); },
    gameOver: function() { logMessage("GAME OVER"); gameState = GAME_STATE.GAME_OVER; renderAll(); },
    hideGameOver: function() { if (DOM.gameOverScreen) DOM.gameOverScreen.classList.add('hidden'); },
    triggerDamageFlash: function() { if(DOM.playerStatsPanel) { DOM.playerStatsPanel.classList.add('flash-damage'); setTimeout(() => { DOM.playerStatsPanel.classList.remove('flash-damage'); }, 400); } },
    saveGame: function() { if (!player) return; try { const saveData = { player: player, currentDungeonId: currentDungeon.id, currentDungeonFloor: currentDungeon.floor, messageLog: messageLog.slice(0, 10) }; localStorage.setItem('miniDungeonCrawlerSaveData_v3', JSON.stringify(saveData)); console.log("Partie sauvegardée."); } catch (e) { console.error("Save Error:", e); logMessage("Erreur sauvegarde."); } },
    loadGame: function() { try { const savedData = localStorage.getItem('miniDungeonCrawlerSaveData_v3'); if (savedData) { const loadedData = JSON.parse(savedData); if (!loadedData.player || !loadedData.currentDungeonId || typeof loadedData.currentDungeonFloor === 'undefined') throw new Error("Données sauvegarde invalides."); player = loadedData.player; currentDungeon.id = loadedData.currentDungeonId; currentDungeon.floor = loadedData.currentDungeonFloor; messageLog = loadedData.messageLog || []; player.levelBonus = player.levelBonus || { maxHp: 0, maxMp: 0, attack: 0, defense: 0 }; player.skills = player.skills || []; player.inventory = player.inventory || {}; player.accessoriesInventory = player.accessoriesInventory || []; player.equipment = player.equipment || {}; player.equipment.weapon = player.equipment.weapon || null; player.equipment.armor = player.equipment.armor || null; player.equipment.ring1 = player.equipment.ring1 || null; player.equipment.ring2 = player.equipment.ring2 || null; player.equipment.amulet = player.equipment.amulet || null; const dungeonData = Dungeons[currentDungeon.id]; if (!dungeonData) { console.error("Save Error: Unknown dungeon", currentDungeon.id); this.enterHub(); return true; } if (dungeonData.fixed) { currentDungeon.map = Dungeons['hub'].map.map(r => r.split('')); currentDungeon.enemies = {}; currentDungeon.items = {}; gameState = GAME_STATE.HUB; } else { const generated = dungeonData.mapGenerator(currentDungeon.floor); currentDungeon.map = generated.map; currentDungeon.enemies = generated.enemies; currentDungeon.items = generated.items; if (!player.pos || player.pos.y >= currentDungeon.map.length || player.pos.x >= currentDungeon.map[0].length || currentDungeon.map[player.pos.y]?.[player.pos.x] === TILE.WALL) { console.warn("Loaded player position invalid, reset."); player.pos = { ...generated.startPos }; } gameState = GAME_STATE.EXPLORING; } const stats = calculatePlayerStats(); player.hp = Math.min(player.hp, stats.maxHp); player.mp = Math.min(player.mp, stats.maxMp); combatState.active = false; this.hideGameOver(); return true; } else { console.log("Aucune sauvegarde v3 trouvée."); return false; } } catch (e) { console.error("Load Error:", e); logMessage("Erreur chargement. Réinitialisation."); localStorage.removeItem('miniDungeonCrawlerSaveData_v3'); return false; } },
    returnToHub: function() { if (gameState === GAME_STATE.EXPLORING) { logMessage("Retour au village..."); this.enterHub(); } else if (gameState === GAME_STATE.HUB) { logMessage("Déjà au village."); } else { logMessage("Impossible maintenant."); } },
    updateButtonStates: function() { if (DOM.returnHubBtn) DOM.returnHubBtn.disabled = !(gameState === GAME_STATE.EXPLORING); if (DOM.shopBtn) DOM.shopBtn.disabled = !(gameState === GAME_STATE.HUB); },
    addTestGold: function(amount) { if (!player) return; player.gold += amount; logMessage(`CHEAT: +${amount} ${TILE.GOLD}.`); renderStats(); /* this.saveGame(); */ }
};

// --- CombatManager Object ---
const CombatManager = { startCombat: function(enemyType, positionKey) { const enemyTemplate = Enemies[enemyType]; if (!enemyTemplate) return; combatState = { active: true, enemy: { ...enemyTemplate }, enemyType: enemyType, enemyPosKey: positionKey, enemyCurrentHp: enemyTemplate.hp, playerTurn: true, playerTempDefense: 0 }; gameState = GAME_STATE.COMBAT; logMessage(`Un ${enemyTemplate.name} (${enemyTemplate.tile}) apparaît !`); renderAll(); }, endCombat: function(victory) { const { name: enemyName, tile: enemyTile } = combatState.enemy || {name:'?', tile:'?'}; const { enemyPosKey, enemyType } = combatState; const wasActive = combatState.active; combatState = { active: false, enemy: null, enemyType: null, enemyPosKey: null, enemyCurrentHp: 0, playerTurn: true, playerTempDefense: 0 }; if (!wasActive) return; if (victory) { logMessage(`Victoire sur ${enemyName} (${enemyTile}) !`); if (currentDungeon.enemies && currentDungeon.enemies[enemyPosKey]) delete currentDungeon.enemies[enemyPosKey]; const rewards = Enemies[enemyType]; if (rewards) { if (rewards.gold > 0) { player.gold += rewards.gold; logMessage(`+${rewards.gold} ${TILE.GOLD}.`); } if (rewards.xp > 0) { GameManager.gainXP(rewards.xp); } if (rewards.canDropChest && Math.random() < CHEST_DROP_CHANCE) { const dropPos = player.pos; const dropPosKey = `${dropPos.x},${dropPos.y}`; if (currentDungeon.map[dropPos.y]?.[dropPos.x] === TILE.FLOOR && !currentDungeon.items?.[dropPosKey] && !currentDungeon.enemies?.[dropPosKey]) { currentDungeon.items[dropPosKey] = { type: 'chest' }; logMessage(`Le ${enemyName} laisse un ${TILE.CHEST} coffre !`); } } } if(currentDungeon.id === 'hub') gameState = GAME_STATE.HUB; else gameState = GAME_STATE.EXPLORING; GameManager.saveGame(); } renderAll(); }, playerAction: function(actionType, selection = null) { if (!combatState.active || !combatState.playerTurn || !player) return; const playerStats = calculatePlayerStats(); const enemy = combatState.enemy; let turnEnded = false; combatState.playerTempDefense = 0; try { switch(actionType) { case 'attack': const playerDamage = Math.max(1, playerStats.attack - enemy.defense + getRandomInt(-1, 1)); combatState.enemyCurrentHp -= playerDamage; logMessage(`⚔️ Attaque -> ${enemy.name} (-${playerDamage} PV).`); turnEnded = true; break; case 'skill': const skill = Skills[selection]; if (!skill || skill.type !== 'active') { logMessage("Compétence invalide."); return; } if (player.mp < skill.mpCost) { logMessage(`PM insuffisants (${player.mp}/${skill.mpCost}).`); this.showSkillSelection(); return; } player.mp -= skill.mpCost; logMessage(`✨ Utilise ${skill.name} (${skill.icon}) ! (-${skill.mpCost} PM)`); let skillMsg = ""; switch(skill.effect) { case 'damage': const skillDmg = Math.max(1, Math.floor((playerStats.attack * skill.multiplier)) - enemy.defense + getRandomInt(-1, 1)); combatState.enemyCurrentHp -= skillDmg; skillMsg = `Inflige ${skillDmg} dégâts.`; break; case 'magic_damage': const magicDmg = Math.max(1, skill.baseDamage + getRandomInt(-2, 2)); combatState.enemyCurrentHp -= magicDmg; skillMsg = `Inflige ${magicDmg} dégâts magiques.`; break; case 'heal': const healed = Math.min(skill.value, playerStats.maxHp - player.hp); player.hp += healed; skillMsg = `Récupère ${healed} PV.`; break; case 'defense_boost': combatState.playerTempDefense = skill.value; skillMsg = `Défense +${skill.value} (1 tour).`; break; default: skillMsg = "Effet non implémenté."; } logMessage(skillMsg); turnEnded = true; break; case 'item': const item = Items[selection]; if (!item || item.type !== 'potion' || !player.inventory[selection] || player.inventory[selection] <= 0) { logMessage("Objet invalide."); this.showItemSelection(); return; } player.inventory[selection]--; logMessage(`🎒 Utilise ${item.name} (${item.icon}).`); let itemMsg = ""; if (item.effect === 'heal') { const healed = Math.min(item.value, playerStats.maxHp - player.hp); player.hp += healed; itemMsg = `Récupère ${healed} PV.`; } else if (item.effect === 'mana') { const restored = Math.min(item.value, playerStats.maxMp - player.mp); player.mp += restored; itemMsg = `Récupère ${restored} PM.`; } if (player.inventory[selection] <= 0) delete player.inventory[selection]; logMessage(itemMsg); turnEnded = true; break; case 'defend': combatState.playerTempDefense = Math.ceil(playerStats.defense * 0.5) + 1; logMessage(`🛡️ Défense (Déf+${combatState.playerTempDefense} temporaire).`); turnEnded = true; break; case 'flee': if (enemy.tile === TILE.ENEMY_BOSS) { logMessage(`Impossible de fuir ${enemy.name} !`); turnEnded = true; } else if (Math.random() < 0.6) { logMessage("🏃 Fuite réussie !"); this.endCombat(false); return; } else { logMessage("🏃 Fuite échouée !"); turnEnded = true; } break; default: logMessage("Action inconnue."); return; } } catch(e) { console.error("Erreur playerAction:", e); logMessage("Erreur action."); } this.hideSkillSelection(); this.hideItemSelection(); if (turnEnded) { if (combatState.enemyCurrentHp <= 0) { combatState.enemyCurrentHp = 0; renderAll(); setTimeout(() => this.endCombat(true), 500); } else { combatState.playerTurn = false; renderAll(); setTimeout(() => this.enemyTurn(), 800); } } else { renderAll(); } }, enemyTurn: function() { if (!combatState.active || combatState.playerTurn || combatState.enemyCurrentHp <= 0 || !player) return; const enemy = combatState.enemy; const playerStats = calculatePlayerStats(); const effectivePlayerDefense = playerStats.defense + combatState.playerTempDefense; let enemyActionMessage = ""; let usedSkill = false; try { if (enemy.skills && enemy.skills.includes('s_power_strike') && Math.random() < 0.3) { const skill = Skills['s_power_strike']; const enemyDmg = Math.max(1, Math.floor((enemy.attack * skill.multiplier)) - effectivePlayerDefense + getRandomInt(-1, 2)); player.hp -= enemyDmg; enemyActionMessage = `${enemy.name} ${skill.icon} -> Vous (-${enemyDmg} PV) !`; usedSkill = true; } if (!usedSkill) { const enemyDmg = Math.max(1, enemy.attack - effectivePlayerDefense + getRandomInt(-1, 1)); player.hp -= enemyDmg; enemyActionMessage = `${enemy.name} attaque -> Vous (-${enemyDmg} PV).`; } } catch(e) { console.error("Erreur enemyTurn:", e); enemyActionMessage="Erreur IA."; } logMessage(enemyActionMessage); if(player.hp < playerStats.maxHp * 0.3) GameManager.triggerDamageFlash(); if (player.hp <= 0) { player.hp = 0; renderStats(); setTimeout(() => GameManager.gameOver(), 500); } else { combatState.playerTurn = true; renderAll(); } }, showSkillSelection: function() { const sdiv=document.getElementById('combat-skill-selection'), idiv=document.getElementById('combat-item-selection'); if(!sdiv||!idiv) return; idiv.classList.add('hidden'); sdiv.classList.remove('hidden'); let h=`<h4>Comp. (PM:${player.mp}/${calculatePlayerStats().maxMp}💧)</h4>`, u=0, a=player.skills.filter(id=>Skills[id]?.type==='active'); if(a.length===0) h+='<p><i>Aucune.</i></p>'; else { a.forEach(id=>{const s=Skills[id], c=player.mp>=s.mpCost; h+=`<button class="skill-button modal-button" ${!c?'disabled':''} onclick="CombatManager.selectSkill('${id}')">${s.icon||'?'} ${s.name} (${s.mpCost}💧)</button>`; if(c) u++;}); if(u===0) h+='<p><i>PM insuffisants.</i></p>';} h+='<button class="skill-button modal-button" onclick="CombatManager.hideSkillSelection()">Annuler</button>'; sdiv.innerHTML = h; }, hideSkillSelection: function() { const d=document.getElementById('combat-skill-selection'); if(d) d.classList.add('hidden'); }, selectSkill: function(id) { this.hideSkillSelection(); this.playerAction('skill', id); }, showItemSelection: function() { const idiv=document.getElementById('combat-item-selection'), sdiv=document.getElementById('combat-skill-selection'); if(!idiv||!sdiv) return; sdiv.classList.add('hidden'); idiv.classList.remove('hidden'); let h='<h4>Objet</h4>', u=0; for(const i in player.inventory){ if(!player.inventory.hasOwnProperty(i)) continue; if(player.inventory[i]>0 && Items[i]?.type==='potion'){ h+=`<button class="item-button modal-button" onclick="CombatManager.selectItem('${i}')">${Items[i].icon||'?'} ${Items[i].name} (x${player.inventory[i]})</button>`; u++; } } if(u===0) h+='<p><i>Aucune potion.</i></p>'; h+='<button class="item-button modal-button" onclick="CombatManager.hideItemSelection()">Annuler</button>'; idiv.innerHTML=h; }, hideItemSelection: function() { const d=document.getElementById('combat-item-selection'); if(d) d.classList.add('hidden'); }, selectItem: function(id) { this.hideItemSelection(); this.playerAction('item', id); } };

// --- ShopManager Object ---
const ShopManager = { buyItem: function(itemId) { const item = Items[itemId]; if (!item || item.cost <= 0) return; if (player.gold >= item.cost) { player.gold -= item.cost; InventoryManager.addInventoryItem(itemId, 1); logMessage(`Achat: ${item.icon} ${item.name} (-${item.cost} ${TILE.GOLD}).`); renderShop(); renderStats(); GameManager.saveGame(); } else { logMessage(`Or insuffisant (${player.gold}/${item.cost}).`); } }, sellItem: function(itemId) { const item = Items[itemId]; if (!item || !player.inventory[itemId] || player.inventory[itemId] <= 0 || (item.type !== 'weapon' && item.type !== 'armor')) { logMessage("Invendable."); return; } if(player.equipment.weapon === itemId || player.equipment.armor === itemId) { logMessage(`Déséquipez ${item.name} avant vente.`); return; } const sellPrice = Math.floor(item.cost * 0.5); player.inventory[itemId]--; player.gold += sellPrice; logMessage(`Vente: ${item.icon} ${item.name} (+${sellPrice} ${TILE.GOLD}).`); if (player.inventory[itemId] <= 0) delete player.inventory[itemId]; renderShop(); renderStats(); GameManager.saveGame(); }, learnSkill: function(skillId) { const skill = Skills[skillId]; if (!skill || player.skills.includes(skillId) || skill.cost <= 0) return; if (player.gold >= skill.cost) { player.gold -= skill.cost; player.skills.push(skillId); logMessage(`Appris: ${skill.icon} ${skill.name} (-${skill.cost} ${TILE.GOLD}).`); if (skill.type === 'passive') { logMessage(`Effet passif ${skill.name} actif !`); const oldStats = calculatePlayerStats(); const newStats = calculatePlayerStats(); player.hp = Math.min(player.hp + Math.max(0, newStats.maxHp - oldStats.maxHp), newStats.maxHp); player.mp = Math.min(player.mp + Math.max(0, newStats.maxMp - oldStats.maxMp), newStats.maxMp); } renderShop(); renderAll(); GameManager.saveGame(); } else { logMessage(`Or insuffisant (${player.gold}/${skill.cost}).`); } } };

// --- InventoryManager Object ---
const InventoryManager = { addInventoryItem: function(itemId, quantity) { if (!Items[itemId] || quantity <= 0) return; if (!player.inventory[itemId]) player.inventory[itemId] = 0; player.inventory[itemId] += quantity; }, equipItem: function(itemId) { const item = Items[itemId]; if (!item || !player.inventory?.[itemId] || player.inventory[itemId] <= 0 || (item.type !== 'weapon' && item.type !== 'armor')) { logMessage("Impossible d'équiper."); return; } let type = item.type; let currentEquipped = player.equipment[type]; if (currentEquipped) { this.addInventoryItem(currentEquipped, 1); logMessage(`Déséquipé: ${Items[currentEquipped]?.icon || '?'} ${Items[currentEquipped]?.name || '?'}.`); } player.equipment[type] = itemId; player.inventory[itemId]--; if (player.inventory[itemId] <= 0) delete player.inventory[itemId]; logMessage(`Équipé: ${item.icon} ${item.name}.`); renderAll(); GameManager.saveGame(); }, unequipItem: function(type) { let currentEquipped = player.equipment[type]; if(currentEquipped) { const item = Items[currentEquipped]; this.addInventoryItem(currentEquipped, 1); player.equipment[type] = null; logMessage(`Déséquipé: ${item?.icon || '?'} ${item?.name || '?'}.`); renderAll(); GameManager.saveGame(); } else logMessage("Rien à déséquiper."); }, usePotion: function(itemId) { if (gameState === GAME_STATE.SHOP || gameState === GAME_STATE.SKILLS || gameState === GAME_STATE.COMBAT) { logMessage("Ne peut pas utiliser maintenant."); return; } const item = Items[itemId]; if (!item || item.type !== 'potion' || !player.inventory?.[itemId] || player.inventory[itemId] <= 0) { logMessage("Impossible d'utiliser."); return; } player.inventory[itemId]--; const playerStats = calculatePlayerStats(); logMessage(`Utilisé: ${item.icon} ${item.name}.`); let msg = ""; if (item.effect === 'heal') { const healed = Math.min(item.value, playerStats.maxHp - player.hp); if (healed > 0) { player.hp += healed; msg = `+${healed} PV.`; } else msg = "PV déjà max."; } else if (item.effect === 'mana') { const restored = Math.min(item.value, playerStats.maxMp - player.mp); if (restored > 0) { player.mp += restored; msg = `+${restored} PM.`; } else msg = "PM déjà max."; } logMessage(msg); if (player.inventory[itemId] <= 0) delete player.inventory[itemId]; renderAll(); GameManager.saveGame(); }, equipAccessory: function(accessoryId) { const accIndex = player.accessoriesInventory?.findIndex(acc => acc && acc.id === accessoryId); if (accIndex === -1 || accIndex === undefined) { logMessage("Accessoire introuvable."); return; } const accessory = player.accessoriesInventory[accIndex]; let targetSlot = null; if (accessory.type === ACCESSORY_TYPE.RING) { if (!player.equipment.ring1) targetSlot = 'ring1'; else if (!player.equipment.ring2) targetSlot = 'ring2'; else { logMessage("Anneaux pleins."); return; } } else if (accessory.type === ACCESSORY_TYPE.AMULET) { if (!player.equipment.amulet) targetSlot = 'amulet'; else { logMessage("Amulette pleine."); return; } } else { logMessage("Type inconnu."); return; } const currentlyEquipped = player.equipment[targetSlot]; if(currentlyEquipped) { player.accessoriesInventory.push(currentlyEquipped); } player.accessoriesInventory.splice(accIndex, 1); player.equipment[targetSlot] = accessory; const rarityInfo = RARITIES[accessory.rarity]; logMessage(`Équipé: <span style="color:${rarityInfo?.color || '#fff'};">[${rarityInfo?.name || '?'}] ${accessory.name}</span>.`); renderAll(); GameManager.saveGame(); }, unequipAccessory: function(slot) { const accessory = player.equipment[slot]; if (!accessory) { return; } player.accessoriesInventory.push(accessory); player.equipment[slot] = null; const rarityInfo = RARITIES[accessory.rarity]; logMessage(`Déséquipé: <span style="color:${rarityInfo?.color || '#fff'};">[${rarityInfo?.name || '?'}] ${accessory.name}</span>.`); renderAll(); GameManager.saveGame(); } };

// --- Initialize Game ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Initializing Game Manager...");
    try {
        GameManager.initialize();
    } catch (error) {
        console.error("ERREUR FATALE lors de l'initialisation:", error);
        // Display a user-friendly error message maybe
        document.body.innerHTML = "<h1 style='color:red; text-align:center;'>Erreur Critique lors du chargement du jeu. Vérifiez la console (F12).</h1>";
    }
});
// --- FIN DU FICHIER SCRIPT.JS ---
