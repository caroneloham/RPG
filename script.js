// --- Constants ---
const TILE = { FLOOR: '.', WALL: '🧱', PLAYER: '🚶', EXIT: '🚪', GOLD: '💰', POTION: '✨', CHEST: '📦', ENEMY_GOBLIN: '👹', ENEMY_SKELETON: '💀', ENEMY_ORC: '👺', ENEMY_BOSS: '😈', HUB_INN: '🛌', HUB_DUNGEON_1: '①', HUB_DUNGEON_2: '②' };
const GAME_STATE = { EXPLORING: 'exploring', COMBAT: 'combat', HUB: 'hub', SHOP: 'shop', INVENTORY: 'inventory', SKILLS: 'skills', GAME_OVER: 'gameOver' };
const PLAYER_BASE_STATS = { hp: 30, mp: 10, attack: 5, defense: 2 };
const LEVEL_XP_REQUIREMENT = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000]; // XP needed to reach the *next* level (index = current level)

const ACCESSORY_TYPE = { RING: 'Anneau', AMULET: 'Amulette' };
const RARITIES = {
    COMMON:    { name: 'Commun',     color: '#b0bec5', statMultiplier: 1.0, maxStats: 1, chance: 0.50 }, // Grey-blue
    UNCOMMON:  { name: 'Incommun',   color: '#66bb6a', statMultiplier: 1.3, maxStats: 2, chance: 0.30 }, // Green
    RARE:      { name: 'Rare',       color: '#42a5f5', statMultiplier: 1.7, maxStats: 3, chance: 0.15 }, // Blue
    EPIC:      { name: 'Épique',     color: '#ab47bc', statMultiplier: 2.2, maxStats: 4, chance: 0.04 }, // Purple
    LEGENDARY: { name: 'Légendaire', color: '#ffa726', statMultiplier: 3.0, maxStats: 5, chance: 0.01 }  // Orange
};
const POSSIBLE_ACCESSORY_STATS = ['maxHp', 'maxMp', 'attack', 'defense', 'critChance', 'dodgeChance'];
const CHEST_DROP_CHANCE = 0.15; // 15% chance for eligible enemies to drop a chest

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
    'boss_troll': { name: "Troll Gardien", tile: TILE.ENEMY_BOSS, hp: 100, attack: 12, defense: 6, xp: 200, gold: 150, skills: ['s_power_strike'], canDropChest: true } // Boss always drops chest? maybe 100% chance later
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
    "dungeon1": { name: "Forêt Sombre", floors: 2, mapGenerator: (floor) => generateSimpleDungeon(15, 10, floor, 3 + floor, 1 + floor), bossFloor: null },
    "dungeon2": { name: "Cavernes Oubliées", floors: 3, mapGenerator: (floor) => generateSimpleDungeon(20, 15, floor, 4 + floor, 2 + floor), bossFloor: 3, bossType: 'boss_troll' }
};

// --- Game State Variables ---
let player;
let currentDungeon = { id: null, floor: 0, map: [], enemies: {}, items: {} };
let gameState = GAME_STATE.HUB;
let combatState = { active: false, enemy: null, enemyCurrentHp: 0, playerTempDefense: 0, enemyType: null, enemyPosKey: null, playerTurn: true };
let messageLog = [];

// --- DOM Elements ---
const mapDisplay = document.getElementById('map-display');
const combatDisplay = document.getElementById('combat-display');
const shopContent = document.getElementById('shop-content');
const shopModal = document.getElementById('shop-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const inventoryDisplay = document.getElementById('inventory-display');
const skillsDisplay = document.getElementById('skills-display');
const mainViewDivs = [mapDisplay, combatDisplay, inventoryDisplay, skillsDisplay];
const statLevel = document.getElementById('stat-level');
const statXP = document.getElementById('stat-xp');
const statXPNext = document.getElementById('stat-xp-next');
const statHP = document.getElementById('stat-hp');
const statMaxHP = document.getElementById('stat-max-hp');
const statMP = document.getElementById('stat-mp');
const statMaxMP = document.getElementById('stat-max-mp');
const statAttack = document.getElementById('stat-attack');
const statDefense = document.getElementById('stat-defense');
const statCrit = document.getElementById('stat-crit');
const statDodge = document.getElementById('stat-dodge');
const statGold = document.getElementById('stat-gold');
const statWeapon = document.getElementById('stat-weapon');
const statArmor = document.getElementById('stat-armor');
const statRing1 = document.getElementById('stat-ring1');
const statRing2 = document.getElementById('stat-ring2');
const statAmulet = document.getElementById('stat-amulet');
const hpBar = document.getElementById('hp-bar');
const mpBar = document.getElementById('mp-bar');
const xpBar = document.getElementById('xp-bar');
const playerStatsPanel = document.getElementById('player-stats');
const messageLogElement = document.getElementById('message-log');
const locationInfo = document.getElementById('location-info');
const gameOverScreen = document.getElementById('game-over-screen');
const shopGoldDisplay = document.getElementById('shop-gold-display');
const returnHubBtn = document.getElementById('return-hub-btn');
const shopBtn = document.getElementById('shop-btn');

// --- Utility Functions ---
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function logMessage(message) {
    console.log(message.replace(/<[^>]*>/g, '')); // Log plain text to console
    messageLog.unshift(message); // Add to the beginning (newest first)
    if (messageLog.length > 20) { // Limit log size
        messageLog.pop(); // Remove the oldest message
    }
    renderLog();
}

function showView(viewElement) {
    mainViewDivs.forEach(div => div.classList.add('hidden'));
    if (viewElement) {
        viewElement.classList.remove('hidden');
    }
    // Handle modal visibility separately
    if (gameState === GAME_STATE.SHOP) {
        shopModal.style.display = 'flex';
        modalBackdrop.style.display = 'block';
    } else {
        shopModal.style.display = 'none';
        modalBackdrop.style.display = 'none';
    }
}

// --- Rendering Functions ---
function renderAll() {
    renderStats();
    renderLocationInfo();
    GameManager.updateButtonStates();

    switch (gameState) {
        case GAME_STATE.HUB:
        case GAME_STATE.EXPLORING:
            showView(mapDisplay);
            renderDungeon();
            break;
        case GAME_STATE.COMBAT:
            showView(combatDisplay);
            renderCombat();
            break;
        case GAME_STATE.SHOP:
            showView(null); // No main view, only modal
            renderShop();
            break;
        case GAME_STATE.INVENTORY:
            showView(inventoryDisplay);
            renderInventory();
            break;
        case GAME_STATE.SKILLS:
            showView(skillsDisplay);
            renderSkills();
            break;
        case GAME_STATE.GAME_OVER:
            showView(null); // No main view
            gameOverScreen.classList.remove('hidden'); // Show game over screen
            break;
        default:
            showView(mapDisplay); // Fallback
            renderDungeon();
    }
    // Ensure game over screen is hidden if not in game over state
    if (gameState !== GAME_STATE.GAME_OVER) {
        gameOverScreen.classList.add('hidden');
    }
}

// Helper function to display accessory name with color and tooltip
function formatAccessoryName(accessory) {
    if (!accessory) return 'Aucun';
    const rarityInfo = RARITIES[accessory.rarity];
    // Use innerHTML in the place where this is called, not here directly
    // The title attribute creates the tooltip on hover
    return `<span style="color:${rarityInfo.color};" title="${getAccessoryTooltip(accessory)}">${accessory.name || 'Accessoire inconnu'}</span>`;
}

// Helper function for accessory tooltip text
function getAccessoryTooltip(accessory) {
    if (!accessory || !accessory.stats) return '';
    let tooltip = `${accessory.type} [${RARITIES[accessory.rarity].name}]\n`;
    for (const stat in accessory.stats) {
        let statText = stat;
        let suffix = '';
        if (stat === 'maxHp') statText = 'PV Max';
        else if (stat === 'maxMp') statText = 'PM Max';
        else if (stat === 'attack') statText = 'Attaque';
        else if (stat === 'defense') statText = 'Défense';
        else if (stat === 'critChance') { statText = 'Critique'; suffix = '%'; }
        else if (stat === 'dodgeChance') { statText = 'Esquive'; suffix = '%'; }
        tooltip += `${statText}: +${accessory.stats[stat]}${suffix}\n`;
    }
    return tooltip.trim();
}

function renderStats() {
    const calculatedStats = calculatePlayerStats();
    const currentXP = player.xp;
    const currentLevelXP = LEVEL_XP_REQUIREMENT[player.level - 1] || 0;
    const nextLevelXP = LEVEL_XP_REQUIREMENT[player.level] || Infinity; // XP needed for *next* level

    statLevel.textContent = player.level;
    statXP.textContent = currentXP;
    statXPNext.textContent = nextLevelXP !== Infinity ? nextLevelXP : 'MAX';
    statHP.textContent = player.hp;
    statMaxHP.textContent = calculatedStats.maxHp;
    statMP.textContent = player.mp;
    statMaxMP.textContent = calculatedStats.maxMp;
    statAttack.textContent = calculatedStats.attack;
    statDefense.textContent = calculatedStats.defense;
    statCrit.textContent = `${calculatedStats.critChance || 0}%`;
    statDodge.textContent = `${calculatedStats.dodgeChance || 0}%`;
    statGold.textContent = player.gold;

    // Equipment display - Use innerHTML for accessories to render the styled span
    statWeapon.textContent = player.equipment.weapon ? Items[player.equipment.weapon].name : 'Aucune';
    statArmor.textContent = player.equipment.armor ? Items[player.equipment.armor].name : 'Aucune';
    statRing1.innerHTML = formatAccessoryName(player.equipment.ring1);
    statRing2.innerHTML = formatAccessoryName(player.equipment.ring2);
    statAmulet.innerHTML = formatAccessoryName(player.equipment.amulet);

    // Update bars
    const hpPercent = calculatedStats.maxHp > 0 ? (player.hp / calculatedStats.maxHp) * 100 : 0;
    const mpPercent = calculatedStats.maxMp > 0 ? (player.mp / calculatedStats.maxMp) * 100 : 0;
    let xpPercent = 0;
    if (nextLevelXP !== Infinity && player.level > 0) {
        const xpForThisLevel = nextLevelXP - currentLevelXP; // Total XP needed for this level span
        const xpGainedThisLevel = currentXP - currentLevelXP; // XP gained since last level up
        xpPercent = xpForThisLevel > 0 ? Math.max(0, Math.min(100,(xpGainedThisLevel / xpForThisLevel) * 100)) : 100;
    } else if (nextLevelXP === Infinity) { // Max level
        xpPercent = 100;
    } else { // Should not happen if level >= 1
        xpPercent = 0;
    }


    hpBar.style.width = `${hpPercent}%`;
    mpBar.style.width = `${mpPercent}%`;
    xpBar.style.width = `${xpPercent}%`;

    hpBar.textContent = `${player.hp}/${calculatedStats.maxHp}`;
    mpBar.textContent = `${player.mp}/${calculatedStats.maxMp}`;
    xpBar.textContent = nextLevelXP !== Infinity ? `${currentXP}/${nextLevelXP}` : 'MAX';
}

function renderLocationInfo() {
    let locationName = "Inconnu";
    if (gameState === GAME_STATE.HUB || currentDungeon.id === 'hub') {
        locationName = Dungeons['hub'].name;
    } else if (currentDungeon.id && Dungeons[currentDungeon.id]) {
        locationName = `${Dungeons[currentDungeon.id].name} - Étage ${currentDungeon.floor}`;
    }
    locationInfo.textContent = `Lieu: ${locationName}`;
}

function renderLog() {
    messageLogElement.innerHTML = '<h3>Journal</h3>' + messageLog.map(msg => `<p>${msg}</p>`).join('');
    messageLogElement.scrollTop = 0; // Scroll to top to show newest message
}

function renderDungeon() {
    let mapHTML = '';
    if (!currentDungeon.map || currentDungeon.map.length === 0) {
        mapDisplay.innerHTML = '<p>Erreur: Carte non chargée.</p>';
        return;
    }
    const mapHeight = currentDungeon.map.length;
    const mapWidth = currentDungeon.map[0].length;

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const posKey = `${x},${y}`;
            let mapChar = currentDungeon.map[y][x];
            let tileClasses = ['tile'];
            let tileContent = ''; // Use this for emojis/text inside the tile
            let title = ''; // Tooltip text

            if (player.pos.x === x && player.pos.y === y) {
                tileClasses.push('tile-player');
                tileContent = TILE.PLAYER;
                title = "Vous";
            } else if (currentDungeon.enemies[posKey]) {
                const enemyData = currentDungeon.enemies[posKey];
                const enemyInfo = Enemies[enemyData.type];
                tileContent = enemyInfo.tile;
                tileClasses.push('tile-enemy');
                if (enemyInfo.tile === TILE.ENEMY_GOBLIN) tileClasses.push('tile-enemy-g');
                else if (enemyInfo.tile === TILE.ENEMY_SKELETON) tileClasses.push('tile-enemy-s');
                else if (enemyInfo.tile === TILE.ENEMY_ORC) tileClasses.push('tile-enemy-o');
                else if (enemyInfo.tile === TILE.ENEMY_BOSS) tileClasses.push('tile-enemy-b');
                title = enemyInfo.name;
            } else if (currentDungeon.items[posKey]) {
                const item = currentDungeon.items[posKey];
                if (item.type === 'chest') {
                    tileClasses.push('tile-item', 'tile-chest');
                    tileContent = TILE.CHEST;
                    title = "Coffre";
                } else if (item.type === 'gold') {
                    tileClasses.push('tile-item', 'tile-gold');
                    tileContent = TILE.GOLD;
                    title = `${item.value} Or`;
                } else if (item.type === 'potion') {
                    tileClasses.push('tile-item', 'tile-potion');
                    tileContent = TILE.POTION;
                    title = Items[item.itemId] ? Items[item.itemId].name : "Potion";
                }
            } else { // Map tile
                switch (mapChar) {
                    case TILE.WALL: tileClasses.push('tile-wall'); tileContent = TILE.WALL; title = "Mur"; break;
                    case TILE.FLOOR: tileClasses.push('tile-floor'); tileContent = ''; break; // Keep floor visually empty
                    case TILE.EXIT: tileClasses.push('tile-exit'); tileContent = TILE.EXIT; title = "Sortie"; break;
                    case TILE.HUB_INN: tileClasses.push('tile-hub', 'tile-hub-inn'); tileContent = TILE.HUB_INN; title = "Auberge"; break;
                    case TILE.HUB_DUNGEON_1: tileClasses.push('tile-hub', 'tile-hub-dungeon', 'dungeon-1'); tileContent = TILE.HUB_DUNGEON_1; title = Dungeons['dungeon1'] ? Dungeons['dungeon1'].name : "Donjon 1"; break;
                    case TILE.HUB_DUNGEON_2: tileClasses.push('tile-hub', 'tile-hub-dungeon', 'dungeon-2'); tileContent = TILE.HUB_DUNGEON_2; title = Dungeons['dungeon2'] ? Dungeons['dungeon2'].name : "Donjon 2"; break;
                    default: tileClasses.push('tile-floor'); tileContent = '';
                }
            }
            // Add floor background even if there's content on it, unless it's a wall
            if (mapChar !== TILE.WALL) {
                tileClasses.push('tile-floor-bg'); // Add background class
            }

            mapHTML += `<span class="${tileClasses.join(' ')}" title="${title}">${tileContent}</span>`;
        }
        mapHTML += '\n'; // Use CSS grid/flexbox for layout instead of <br>
    }
    mapDisplay.innerHTML = mapHTML;
}

function renderCombat() {
    if (!combatState.active || !combatState.enemy) {
        combatDisplay.innerHTML = "<p>Erreur: État de combat invalide.</p>";
        return;
    }
    const enemy = combatState.enemy;
    const playerStats = calculatePlayerStats();
    let combatHTML = `
        <h2>Combat !</h2>
        <div class="combat-participants">
            <div class="combatant-info">
                <h3>Vous (${TILE.PLAYER})</h3>
                <p>PV: ${player.hp}/${playerStats.maxHp}</p>
                <p>PM: ${player.mp}/${playerStats.maxMp}</p>
                <p>Att: ${playerStats.attack}</p>
                <p>Déf: ${playerStats.defense + combatState.playerTempDefense}</p>
                <p>Crit: ${playerStats.critChance}% / Esq: ${playerStats.dodgeChance}% </p>
                ${combatState.playerTempDefense > 0 ? '<p style="font-size:0.9em; color:lightblue;">(Défense +'+combatState.playerTempDefense+' temporaire)</p>' : ''}
            </div>
            <div class="combatant-info">
                <h3>${enemy.name} (${enemy.tile})</h3>
                <p>PV: ${combatState.enemyCurrentHp}/${enemy.hp}</p>
                <p>Att: ${enemy.attack}</p>
                <p>Déf: ${enemy.defense}</p>
                <!-- Enemies don't have crit/dodge currently -->
            </div>
        </div>
        <div class="combat-actions ${combatState.playerTurn ? '' : 'disabled'}">
            <button class="action-button" onclick="CombatManager.playerAction('attack')" ${!combatState.playerTurn ? 'disabled' : ''}>⚔️ Attaquer</button>
            <button class="action-button" onclick="CombatManager.showSkillSelection()" ${!combatState.playerTurn ? 'disabled' : ''}>✨ Compétence</button>
            <button class="action-button" onclick="CombatManager.showItemSelection()" ${!combatState.playerTurn ? 'disabled' : ''}>🎒 Objet</button>
            <button class="action-button" onclick="CombatManager.playerAction('defend')" ${!combatState.playerTurn ? 'disabled' : ''}>🛡️ Défendre</button>
            <button class="action-button" onclick="CombatManager.playerAction('flee')" ${enemy.tile === TILE.ENEMY_BOSS || !combatState.playerTurn ? 'disabled' : ''}>🏃 Fuir</button>
        </div>
        <div id="combat-skill-selection" class="combat-sub-actions hidden"></div>
        <div id="combat-item-selection" class="combat-sub-actions hidden"></div>
    `;
    combatDisplay.innerHTML = combatHTML;
}


function renderShop() {
    shopGoldDisplay.textContent = player.gold;
    let shopHTML = '';
    const itemCategories = { 'Armes': [], 'Armures': [], 'Consommables': [], 'Compétences': [], 'Vendre': [] };

    // Populate buy categories
    for (const id in Items) {
        const item = Items[id];
        if (item.type === 'weapon') itemCategories['Armes'].push(id);
        else if (item.type === 'armor') itemCategories['Armures'].push(id);
        else if (item.type === 'potion') itemCategories['Consommables'].push(id);
    }
    for (const id in Skills) { if (!player.skills.includes(id)) itemCategories['Compétences'].push(id); }

    // Populate sell category (only non-equipped weapons/armor in inventory)
    for(const itemId in player.inventory) {
        if(player.inventory[itemId] > 0 && Items[itemId] && (Items[itemId].type === 'weapon' || Items[itemId].type === 'armor')) {
            // Check if it's NOT equipped
            if(player.equipment.weapon !== itemId && player.equipment.armor !== itemId) {
                itemCategories['Vendre'].push(itemId);
            }
        }
    }

    // Generate HTML
    for (const categoryName in itemCategories) {
        if (itemCategories[categoryName].length > 0 || categoryName === 'Vendre') {
            shopHTML += `<div class="shop-category"><h3>${categoryName}</h3>`;
            if (categoryName === 'Vendre') {
                shopHTML += '<p class="shop-sell-info">Vendez votre équipement non utilisé (50% prix).</p>';
                if (itemCategories['Vendre'].length === 0) shopHTML += "<p><i>Rien à vendre pour le moment. Déséquipez des objets pour les vendre.</i></p>";
            }
            itemCategories[categoryName].forEach(id => {
                let item, cost, effectText, icon, actionButton;
                const isSelling = categoryName === 'Vendre';
                if (isSelling) {
                    item = Items[id];
                    cost = Math.floor(item.cost * 0.5); // Sell price
                    effectText = `Quantité: ${player.inventory[id]}`;
                    icon = item.icon || '❓';
                    actionButton = `<button class="shop-button modal-button sell-button" onclick="ShopManager.sellItem('${id}')">Vendre 1 (💰 ${cost})</button>`;
                } else if (categoryName === 'Compétences') {
                    item = Skills[id];
                    cost = item.cost;
                    effectText = getSkillDescription(item) + (item.type === 'active' ? ` (Coût: ${item.mpCost}${TILE.POTION})` : ' (Passif)');
                    icon = item.icon || '❓';
                    const canAfford = player.gold >= cost;
                    actionButton = `<button class="shop-button modal-button buy-button" data-item-id="${id}" onclick="ShopManager.learnSkill('${id}')" ${!canAfford ? 'disabled' : ''}>Apprendre</button>`;
                } else { // Buying weapons, armor, potions
                    item = Items[id];
                    cost = item.cost;
                    if (item.type === 'weapon') effectText = `Att +${item.attack || 0}${item.mpBonus ? ', PM Max +'+item.mpBonus : ''}`;
                    else if (item.type === 'armor') effectText = `Déf +${item.defense || 0}`;
                    else if (item.type === 'potion') effectText = item.effect === 'heal' ? `Soigne ${item.value} PV` : `Rend ${item.value} PM`;
                    else effectText = '';
                    icon = item.icon || '❓';
                    const canAfford = player.gold >= cost;
                    actionButton = `<button class="shop-button modal-button buy-button" data-item-id="${id}" onclick="ShopManager.buyItem('${id}')" ${!canAfford ? 'disabled' : ''}>Acheter</button>`;
                }
                shopHTML += `
                    <div class="shop-item">
                        <span class="shop-item-icon">${icon}</span>
                        <div class="shop-item-info">
                            <span class="shop-item-name">${item.name}</span>
                            <span class="shop-item-effect">${effectText}</span>
                        </div>
                        ${!isSelling ? `<span class="shop-item-cost">💰 ${cost}</span>` : ''}
                        ${actionButton}
                    </div>`;
            });
            shopHTML += `</div>`;
        }
    }
    shopContent.innerHTML = shopHTML;
}


function renderInventory() {
    let inventoryHTML = `<h2>🎒 Inventaire</h2>`;

    // Equipment Section
    inventoryHTML += `<h3>Équipement</h3><div class="inventory-section">`;
    inventoryHTML += `<div class="list-item"><span>🗡️ Arme: <strong id="inv-eq-weapon"></strong></span>${player.equipment.weapon ? `<button class="inventory-button" onclick="InventoryManager.unequipItem('weapon')">Déséquiper</button>` : ''}</div>`;
    inventoryHTML += `<div class="list-item"><span>👕 Armure: <strong id="inv-eq-armor"></strong></span>${player.equipment.armor ? `<button class="inventory-button" onclick="InventoryManager.unequipItem('armor')">Déséquiper</button>` : ''}</div>`;
    inventoryHTML += `<div class="list-item"><span>💍 Anneau 1: <strong id="inv-eq-ring1"></strong></span>${player.equipment.ring1 ? `<button class="inventory-button" onclick="InventoryManager.unequipAccessory('ring1')">Déséquiper</button>` : ''}</div>`;
    inventoryHTML += `<div class="list-item"><span>💍 Anneau 2: <strong id="inv-eq-ring2"></strong></span>${player.equipment.ring2 ? `<button class="inventory-button" onclick="InventoryManager.unequipAccessory('ring2')">Déséquiper</button>` : ''}</div>`;
    inventoryHTML += `<div class="list-item"><span>📿 Amulette: <strong id="inv-eq-amulet"></strong></span>${player.equipment.amulet ? `<button class="inventory-button" onclick="InventoryManager.unequipAccessory('amulet')">Déséquiper</button>` : ''}</div>`;
    inventoryHTML += `</div>`; // End Equipment Section

    // Consumables Section
    inventoryHTML += `<h3>Objets Consommables</h3><div class="inventory-section">`;
    let hasConsumables = false;
    for (const itemId in player.inventory) {
        if (player.inventory[itemId] > 0 && Items[itemId] && Items[itemId].type === 'potion') {
            hasConsumables = true;
            const item = Items[itemId];
            inventoryHTML += `<div class="list-item"><span>${item.icon || '?'} <strong>${item.name}</strong> x ${player.inventory[itemId]}</span><span> <button class="inventory-button use-button" onclick="InventoryManager.usePotion('${itemId}')">Utiliser</button> </span></div>`;
        }
    }
    if (!hasConsumables) inventoryHTML += "<p><i>Aucun consommable.</i></p>";
    inventoryHTML += `</div>`; // End Consumables Section

     // Other Inventory (Weapons/Armor not equipped)
    inventoryHTML += `<h3>Équipement en Stock</h3><div class="inventory-section">`;
    let hasOtherItems = false;
    for (const itemId in player.inventory) {
        if (player.inventory[itemId] > 0 && Items[itemId] && (Items[itemId].type === 'weapon' || Items[itemId].type === 'armor')) {
            // Only show if *not* currently equipped
            if (player.equipment.weapon !== itemId && player.equipment.armor !== itemId) {
                hasOtherItems = true;
                const item = Items[itemId];
                let statsText = '';
                if (item.type === 'weapon') statsText = `Att+${item.attack || 0}${item.mpBonus ? ', PM+' + item.mpBonus : ''}`;
                else if (item.type === 'armor') statsText = `Déf+${item.defense || 0}`;
                inventoryHTML += `
                    <div class="list-item">
                        <span>${item.icon || '?'} <strong>${item.name}</strong> x ${player.inventory[itemId]} <em>(${statsText})</em></span>
                        <span> <button class="inventory-button equip-button" onclick="InventoryManager.equipItem('${itemId}')">Équiper</button> </span>
                    </div>`;
            }
        }
    }
    if (!hasOtherItems) inventoryHTML += "<p><i>Aucun équipement en stock.</i></p>";
    inventoryHTML += `</div>`; // End Other Inventory Section


    // Accessories Section
    inventoryHTML += `<h3>Accessoires en Stock</h3><div class="inventory-section">`;
    if (player.accessoriesInventory.length === 0) {
        inventoryHTML += "<p><i>Aucun accessoire dans l'inventaire. Trouvez des coffres !</i></p>";
    } else {
        player.accessoriesInventory.forEach(acc => {
            if (!acc) return; // Safety check for null/undefined accessories
            const rarityInfo = RARITIES[acc.rarity];
            let statsHTML = '<em class="accessory-stats">';
            let statsCount = 0;
            for (const stat in acc.stats) {
                 let statText = stat.replace('maxHp', 'PV+').replace('maxMp', 'PM+').replace('attack', 'Att+').replace('defense', 'Def+').replace('critChance', 'Crit%').replace('dodgeChance', 'Esq%');
                 statsHTML += `${statsCount > 0 ? ', ' : ''}${statText}${acc.stats[stat]}`;
                 statsCount++;
            }
            statsHTML += '</em>';
            inventoryHTML += `
                <div class="list-item accessory-item">
                    <span class="accessory-name" style="color:${rarityInfo.color};" title="${getAccessoryTooltip(acc)}">
                        ${acc.type === ACCESSORY_TYPE.RING ? '💍' : '📿'} <strong>${acc.name || 'Accessoire'}</strong> [${rarityInfo.name}]
                    </span>
                    ${statsHTML}
                    <button class="inventory-button equip-button" onclick="InventoryManager.equipAccessory('${acc.id}')">Équiper</button>
                </div>`;
        });
    }
    inventoryHTML += `</div>`; // End Accessories Section

    inventoryHTML += '<hr><button class="modal-button" onclick="GameManager.closeInventory()">Fermer</button>';
    inventoryDisplay.innerHTML = inventoryHTML;

    // Update equipped item names within the inventory modal itself AFTER setting innerHTML
    // Use innerHTML for accessories to render the formatted span
    document.getElementById('inv-eq-weapon').innerHTML = player.equipment.weapon ? Items[player.equipment.weapon].name : 'Aucune';
    document.getElementById('inv-eq-armor').innerHTML = player.equipment.armor ? Items[player.equipment.armor].name : 'Aucune';
    document.getElementById('inv-eq-ring1').innerHTML = formatAccessoryName(player.equipment.ring1);
    document.getElementById('inv-eq-ring2').innerHTML = formatAccessoryName(player.equipment.ring2);
    document.getElementById('inv-eq-amulet').innerHTML = formatAccessoryName(player.equipment.amulet);
}

function renderSkills() {
    let skillsHTML = `<h2>✨ Compétences</h2>`;
    if (player.skills.length === 0) {
        skillsHTML += "<p><i>Vous n'avez appris aucune compétence. Visitez la boutique !</i></p>";
    } else {
        let actives = player.skills.filter(id => Skills[id] && Skills[id].type === 'active');
        let passives = player.skills.filter(id => Skills[id] && Skills[id].type === 'passive');

        skillsHTML += "<h3>Actives</h3><div class='inventory-section'>";
        if (actives.length > 0) {
            actives.forEach(skillId => {
                const skill = Skills[skillId];
                skillsHTML += `<div class="list-item"><span>${skill.icon || '?'} <strong>${skill.name}</strong></span><em>${getSkillDescription(skill)} (Coût: ${skill.mpCost}${TILE.POTION})</em></div>`;
            });
        } else skillsHTML += "<p><i>Aucune compétence active connue.</i></p>";
        skillsHTML += "</div>";

        skillsHTML += "<h3>Passives</h3><div class='inventory-section'>";
        if (passives.length > 0) {
            passives.forEach(skillId => {
                const skill = Skills[skillId];
                skillsHTML += `<div class="list-item"><span>${skill.icon || '?'} <strong>${skill.name}</strong></span><em>${getSkillDescription(skill)}</em></div>`;
            });
        } else skillsHTML += "<p><i>Aucune compétence passive connue.</i></p>";
        skillsHTML += "</div>";
    }
    skillsHTML += '<hr><button class="modal-button" onclick="GameManager.closeSkills()">Fermer</button>';
    skillsDisplay.innerHTML = skillsHTML;
}


function getSkillDescription(skill) {
    if (!skill || !skill.effect) return "Effet inconnu.";
    switch(skill.effect) {
        case 'damage': return `Inflige ${skill.multiplier}x dégâts d'Attaque.`;
        case 'magic_damage': return `Inflige ~${skill.baseDamage} dégâts magiques.`; // Use ~ for random variance
        case 'heal': return `Restaure ${skill.value} PV.`;
        case 'stat_boost':
            let statName = skill.stat;
            let suffix = '';
            if (skill.stat === 'maxHp') statName = "PV Max";
            else if (skill.stat === 'maxMp') statName = "PM Max";
            else if (skill.stat === 'attack') statName = "Attaque";
            else if (skill.stat === 'defense') statName = "Défense";
            else if (skill.stat === 'critChance') { statName = "Critique"; suffix = '%'; }
            else if (skill.stat === 'dodgeChance') { statName = "Esquive"; suffix = '%'; }
            return `Augmente ${statName} de ${skill.value}${suffix}.`;
        case 'defense_boost': return `Augmente la Défense de ${skill.value} pendant 1 tour.`;
        default: return "Effet non spécifié.";
    }
}

function calculatePlayerStats() {
    // Start with base stats + level bonus
    let combinedStats = {
        maxHp: PLAYER_BASE_STATS.hp + (player.levelBonus.maxHp || 0),
        maxMp: PLAYER_BASE_STATS.mp + (player.levelBonus.maxMp || 0),
        attack: PLAYER_BASE_STATS.attack + (player.levelBonus.attack || 0),
        defense: PLAYER_BASE_STATS.defense + (player.levelBonus.defense || 0),
        critChance: 0, // Base crit chance
        dodgeChance: 0  // Base dodge chance
    };

    // Add equipment stats (weapon, armor)
    if (player.equipment.weapon && Items[player.equipment.weapon]) {
        combinedStats.attack += Items[player.equipment.weapon].attack || 0;
        combinedStats.maxMp += Items[player.equipment.weapon].mpBonus || 0;
    }
    if (player.equipment.armor && Items[player.equipment.armor]) {
        combinedStats.defense += Items[player.equipment.armor].defense || 0;
    }

    // Add passive skill bonuses
    player.skills.forEach(skillId => {
        const skill = Skills[skillId];
        if (skill && skill.type === 'passive' && skill.effect === 'stat_boost') {
            if (combinedStats.hasOwnProperty(skill.stat)) {
                combinedStats[skill.stat] += skill.value;
            }
        }
    });

    // Add accessory stats
    const accessorySlots = ['ring1', 'ring2', 'amulet'];
    accessorySlots.forEach(slot => {
        const accessory = player.equipment[slot];
        if (accessory && accessory.stats) {
            for (const statName in accessory.stats) {
                if (combinedStats.hasOwnProperty(statName)) {
                    combinedStats[statName] += accessory.stats[statName];
                } else {
                    // Initialize if stat doesn't exist (though it should via base stats or definition)
                    combinedStats[statName] = accessory.stats[statName];
                }
            }
        }
    });

    // Ensure stats don't go below reasonable minimums
    combinedStats.maxHp = Math.max(1, combinedStats.maxHp);
    combinedStats.maxMp = Math.max(0, combinedStats.maxMp);
    combinedStats.attack = Math.max(0, combinedStats.attack);
    combinedStats.defense = Math.max(0, combinedStats.defense);
    combinedStats.critChance = Math.max(0, combinedStats.critChance);
    combinedStats.dodgeChance = Math.max(0, combinedStats.dodgeChance);

    return combinedStats;
}

// --- Dungeon Generation ---
function generateSimpleDungeon(width, height, floor, maxEnemies, maxItems) {
    let map = Array.from({ length: height }, () => Array(width).fill(TILE.WALL));
    let enemies = {}; let items = {}; let startPos = { x: -1, y: -1 }; let exitPos = { x: -1, y: -1 };
    let currentX = Math.floor(width / 2); let currentY = Math.floor(height / 2);
    map[currentY][currentX] = TILE.FLOOR; startPos = {x: currentX, y: currentY};
    let floorTiles = 1; const targetFloorTiles = Math.floor(width * height * 0.4); // Target % of floor space
    let directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]; let steps = 0; const maxSteps = width * height * 5;

    // Random Walk (simplified carving)
    while (floorTiles < targetFloorTiles && steps < maxSteps) {
        directions.sort(() => Math.random() - 0.5); // Shuffle directions
        let moved = false;
        for (let i = 0; i < directions.length; i++) {
            let [dx, dy] = directions[i];
            // Move two steps to potentially create wider corridors/rooms
            let nextX = currentX + dx * 2; let nextY = currentY + dy * 2;
            // Check bounds (stay away from outer walls)
            if (nextX > 0 && nextX < width - 1 && nextY > 0 && nextY < height - 1) {
                 // Carve path
                 if (map[currentY + dy][currentX + dx] === TILE.WALL) { map[currentY + dy][currentX + dx] = TILE.FLOOR; floorTiles++; }
                 if (map[nextY][nextX] === TILE.WALL) { map[nextY][nextX] = TILE.FLOOR; floorTiles++; }
                 currentX = nextX; currentY = nextY;
                 moved = true;
                 break; // Move successful
            }
        }
        // If stuck, jump to a random existing floor tile
        if (!moved) {
            let floorCoords = [];
            for(let y=1; y < height-1; y++) { for(let x=1; x < width-1; x++) { if (map[y][x] === TILE.FLOOR) floorCoords.push({x, y}); } }
            if(floorCoords.length > 0){
                const randCoord = floorCoords[getRandomInt(0, floorCoords.length - 1)];
                currentX = randCoord.x; currentY = randCoord.y;
            } else {
                break; // No floor tiles to jump to? Bail out.
            }
        }
        steps++;
    }

    // Place Exit far from Start
    let maxDist = -1; let floorCoords = [];
    for(let y=1; y < height-1; y++) { for(let x=1; x < width-1; x++) { if (map[y][x] === TILE.FLOOR) { floorCoords.push({x,y}); let dist = Math.abs(x - startPos.x) + Math.abs(y - startPos.y); if (dist > maxDist) { maxDist = dist; exitPos = { x, y }; } } } }

    if (exitPos.x !== -1 && map[exitPos.y][exitPos.x] === TILE.FLOOR) {
        map[exitPos.y][exitPos.x] = TILE.EXIT;
    } else if (floorCoords.length > 0) { // Fallback if furthest point wasn't suitable
        const fallbackExitPos = floorCoords[getRandomInt(0, floorCoords.length - 1)];
        exitPos = {x: fallbackExitPos.x, y: fallbackExitPos.y};
        map[exitPos.y][exitPos.x] = TILE.EXIT;
    } else { // Emergency fallback
        map[currentY][currentX] = TILE.EXIT; exitPos = {x: currentX, y: currentY};
    }

    // Get valid spawn coordinates (not start, not exit)
    let availableCoords = floorCoords.filter(c => (c.x !== startPos.x || c.y !== startPos.y) && (c.x !== exitPos.x || c.y !== exitPos.y));

    // Place Enemies
    let enemyCount = 0; let tries = 0;
    const enemyTypes = floor <= 1 ? ['goblin'] : (floor <= 2 ? ['goblin', 'skeleton'] : ['skeleton', 'orc']);
    while(enemyCount < maxEnemies && tries < maxEnemies * 10 && availableCoords.length > 0) {
        let randIndex = getRandomInt(0, availableCoords.length - 1);
        let pos = availableCoords.splice(randIndex, 1)[0]; // Remove coordinate to avoid overlap
        const posKey = `${pos.x},${pos.y}`;
        // Double check map tile just in case
        if (!enemies[posKey] && !items[posKey] && map[pos.y][pos.x] === TILE.FLOOR) {
            const enemyType = enemyTypes[getRandomInt(0, enemyTypes.length - 1)];
            enemies[posKey] = { type: enemyType, originalPos: { ...pos } };
            enemyCount++;
        }
        tries++;
    }

    // Place Boss (if applicable)
    const dungeonData = Dungeons[currentDungeon.id];
    if (dungeonData && dungeonData.bossFloor === floor && dungeonData.bossType) {
        let bossPlaced = false;
        // Try placing near exit first (but not on it)
        let possibleBossSpots = [];
        for(let dy = -1; dy <= 1; dy++){ for(let dx = -1; dx <= 1; dx++){ if(Math.abs(dx) + Math.abs(dy) !== 1) continue; // Only adjacent tiles
            let checkX = exitPos.x + dx; let checkY = exitPos.y + dy;
            const checkKey = `${checkX},${checkY}`;
            if (checkX > 0 && checkX < width - 1 && checkY > 0 && checkY < height - 1 && map[checkY][checkX] === TILE.FLOOR && !enemies[checkKey] && !items[checkKey]) {
                possibleBossSpots.push({x: checkX, y: checkY});
            }
        }}

        if(possibleBossSpots.length > 0) {
            const bossPos = possibleBossSpots[getRandomInt(0, possibleBossSpots.length-1)];
            const bossKey = `${bossPos.x},${bossPos.y}`;
            enemies[bossKey] = { type: dungeonData.bossType, originalPos: { ...bossPos } };
            bossPlaced = true;
            // Remove boss position from general available coords
            availableCoords = availableCoords.filter(c => c.x !== bossPos.x || c.y !== bossPos.y);
        }

        // Fallback: place boss randomly if near exit failed
        if (!bossPlaced && availableCoords.length > 0) {
            let randIndex = getRandomInt(0, availableCoords.length - 1);
            let pos = availableCoords.splice(randIndex, 1)[0];
            const posKey = `${pos.x},${pos.y}`;
            if (!enemies[posKey] && !items[posKey] && map[pos.y][pos.x] === TILE.FLOOR) {
                enemies[posKey] = { type: dungeonData.bossType, originalPos: { ...pos } };
            }
        }
    }

    // Place Items (Gold/Potions)
    let itemCount = 0; tries = 0;
    while(itemCount < maxItems && tries < maxItems * 10 && availableCoords.length > 0) {
        let randIndex = getRandomInt(0, availableCoords.length - 1);
        let pos = availableCoords.splice(randIndex, 1)[0]; // Remove coordinate
        const posKey = `${pos.x},${pos.y}`;
        if (!enemies[posKey] && !items[posKey] && map[pos.y][pos.x] === TILE.FLOOR) {
            if (Math.random() < 0.7) { // 70% chance gold
                items[posKey] = { type: 'gold', value: getRandomInt(5 * floor, 15 * floor) };
            } else { // 30% chance potion
                const potionTypes = ['p_heal_s', 'p_mana_s'];
                const potionId = potionTypes[getRandomInt(0, potionTypes.length - 1)];
                items[posKey] = { type: 'potion', itemId: potionId };
            }
            itemCount++;
        }
        tries++;
    }
    return { map, enemies, items, startPos };
}


// --- Accessory Generator ---
const AccessoryGenerator = {
    // Creates a single accessory of a given rarity
    createAccessory: function(rarityKey) {
        const rarity = RARITIES[rarityKey];
        if (!rarity) {
            console.error("Rareté invalide:", rarityKey);
            rarityKey = 'COMMON';
            rarity = RARITIES.COMMON;
        }

        const accessory = {
            id: Date.now() + '-' + Math.random().toString(36).substring(2, 9), // Unique enough ID
            type: Math.random() < 0.6 ? ACCESSORY_TYPE.RING : ACCESSORY_TYPE.AMULET, // 60% Ring, 40% Amulet
            rarity: rarityKey,
            name: '', // Will be generated later
            stats: {}
        };

        let availableStats = [...POSSIBLE_ACCESSORY_STATS]; // Copy possible stats
        const numStats = Math.min(availableStats.length, rarity.maxStats); // How many stats based on rarity

        // Assign stats
        for (let i = 0; i < numStats; i++) {
            if (availableStats.length === 0) break; // Should not happen with current numbers

            // Pick a random stat from the available ones
            const statIndex = getRandomInt(0, availableStats.length - 1);
            const statName = availableStats.splice(statIndex, 1)[0]; // Remove chosen stat

            // Determine base value range for the stat
            let baseValue = 1;
            switch (statName) {
                case 'maxHp':       baseValue = getRandomInt(5, 10); break;
                case 'maxMp':       baseValue = getRandomInt(3, 7);  break;
                case 'attack':      baseValue = getRandomInt(1, 2);  break;
                case 'defense':     baseValue = getRandomInt(1, 2);  break;
                case 'critChance':  baseValue = getRandomInt(1, 3);  break; // Percentage points
                case 'dodgeChance': baseValue = getRandomInt(1, 3);  break; // Percentage points
            }

            // Calculate final value: base * rarity multiplier * some randomness
            let value = Math.max(1, Math.round(baseValue * rarity.statMultiplier * (0.8 + Math.random() * 0.4))); // Random factor between 0.8 and 1.2
            accessory.stats[statName] = value;
        }

        // Generate a name based on the type and maybe a primary stat
        accessory.name = `${accessory.type} ${this.generateNameSuffix(accessory.stats)}`;

        return accessory;
    },

    // Generates a simple suffix like "de Force" based on the 'best' stat
    generateNameSuffix: function(stats) {
        let bestStat = '';
        let bestValue = -1;

        // Find the stat with the highest 'weighted' value (subjective weighting)
        for (const stat in stats) {
            let currentWeight = 1;
            // Give slightly more weight to attack/defense for naming purposes
            switch (stat) {
                case 'maxHp':       currentWeight = 0.2; break;
                case 'maxMp':       currentWeight = 0.3; break;
                case 'attack':      currentWeight = 1.5; break;
                case 'defense':     currentWeight = 1.2; break;
                case 'critChance':  currentWeight = 1.0; break;
                case 'dodgeChance': currentWeight = 1.0; break;
            }
            let weightedValue = stats[stat] * currentWeight;
            if (weightedValue > bestValue) {
                bestValue = weightedValue;
                bestStat = stat;
            }
        }

        // Return a suffix based on the best stat found
        switch (bestStat) {
            case 'maxHp': return "de Vitalité";
            case 'maxMp': return "d'Esprit";
            case 'attack': return "de Force";
            case 'defense': return "de Garde";
            case 'critChance': return "de Précision";
            case 'dodgeChance': return "d'Agilité";
            default: return "Mystérieux"; // Fallback if no stats or error
        }
    }
};

// --- GameManager Object ---
const GameManager = {
    initialize: function() {
        if (!this.loadGame()) {
            // Initialize new player if no save found
            player = {
                level: 1,
                xp: 0,
                hp: PLAYER_BASE_STATS.hp,
                mp: PLAYER_BASE_STATS.mp,
                gold: 20,
                pos: { x: -1, y: -1 }, // Will be set by enterHub/enterDungeon
                equipment: { weapon: null, armor: null, ring1: null, ring2: null, amulet: null },
                inventory: { 'p_heal_s': 1 }, // Start with one small heal potion
                accessoriesInventory: [],
                skills: [],
                levelBonus: { maxHp: 0, maxMp: 0, attack: 0, defense: 0 } // Stats gained from levels
            };
            this.enterHub(); // Start in the hub
        } else {
            // Game loaded successfully
            if (messageLog.length === 0) logMessage("Partie chargée.");
             // Ensure player structure is complete after loading potentially older save
             this.ensurePlayerStructure();
             // Refresh current dungeon state based on loaded ID/floor
             this.reloadCurrentDungeonState();
        }

        document.addEventListener('keydown', this.handleInput.bind(this));
        renderAll();
    },

     // Helper to ensure all necessary player fields exist after loading
    ensurePlayerStructure: function() {
        if (!player.levelBonus) player.levelBonus = { maxHp: 0, maxMp: 0, attack: 0, defense: 0 };
        if (!player.skills) player.skills = [];
        if (!player.inventory) player.inventory = {};
        if (!player.accessoriesInventory) player.accessoriesInventory = [];
        if (!player.equipment) player.equipment = {};
        if (typeof player.equipment.weapon === 'undefined') player.equipment.weapon = null;
        if (typeof player.equipment.armor === 'undefined') player.equipment.armor = null;
        if (typeof player.equipment.ring1 === 'undefined') player.equipment.ring1 = null;
        if (typeof player.equipment.ring2 === 'undefined') player.equipment.ring2 = null;
        if (typeof player.equipment.amulet === 'undefined') player.equipment.amulet = null;
        if (!player.pos) player.pos = { x: 1, y: 1}; // Failsafe position
    },

    // Helper to reload map/enemies/items based on loaded dungeon ID and floor
    reloadCurrentDungeonState: function() {
        const dungeonData = Dungeons[currentDungeon.id];
        if (!dungeonData) {
            console.error("Load Error: Unknown dungeon ID in save data:", currentDungeon.id);
            this.enterHub(); // Go to hub if saved dungeon is invalid
            return;
        }

        if (dungeonData.fixed) { // Hub
            currentDungeon.map = Dungeons['hub'].map.map(row => row.split(''));
            currentDungeon.enemies = {};
            currentDungeon.items = {};
            gameState = GAME_STATE.HUB;
             // Find a valid starting spot in the hub (might not be needed if player.pos loaded correctly)
             if(!this.isValidPosition(player.pos.x, player.pos.y, currentDungeon.map)){
                 this.setHubStartPosition();
             }
        } else { // Dungeon floor
            // Regenerate the floor to get consistent map layout *if needed*,
            // or potentially load saved enemies/items if implementing persistent floors later.
            // For now, regenerating is simpler.
            const generated = dungeonData.mapGenerator(currentDungeon.floor);
            currentDungeon.map = generated.map;
            currentDungeon.enemies = generated.enemies; // Reset enemies/items on load for now
            currentDungeon.items = generated.items;

            // Validate loaded player position against the *newly generated* map
            if (!this.isValidPosition(player.pos.x, player.pos.y, currentDungeon.map)) {
                console.warn("Loaded player position invalid for regenerated map, resetting to start.");
                player.pos = { ...generated.startPos }; // Use the generated start position
            }
             gameState = GAME_STATE.EXPLORING;
        }

        // Adjust HP/MP to current max after potentially loading different gear/levels
        const stats = calculatePlayerStats();
        player.hp = Math.min(player.hp, stats.maxHp);
        player.mp = Math.min(player.mp, stats.maxMp);

        combatState.active = false; // Ensure combat isn't active on load
        this.hideGameOver(); // Ensure game over screen is hidden
    },

    isValidPosition: function(x, y, map) {
        return y >= 0 && y < map.length && x >= 0 && x < map[y].length && map[y][x] !== TILE.WALL;
    },

    setHubStartPosition: function() {
        let foundStart = false;
        const hubMap = Dungeons['hub'].map;
        for (let y = 0; y < hubMap.length && !foundStart; y++) {
            for (let x = 0; x < hubMap[y].length && !foundStart; x++) {
                // Allow starting on floor or inn tile
                if (hubMap[y][x] === TILE.FLOOR || hubMap[y][x] === TILE.HUB_INN) {
                    player.pos = { x: x, y: y };
                    foundStart = true;
                }
            }
        }
        if (!foundStart) player.pos = { x: 1, y: 1 }; // Absolute fallback
    },


    handleInput: function(event) {
        if (gameState === GAME_STATE.GAME_OVER) return;

        // Global Escape Handler
        if (event.key === 'Escape') {
            if (gameState === GAME_STATE.SHOP) { this.exitShop(); return; }
            if (gameState === GAME_STATE.INVENTORY) { this.closeInventory(); return; }
            if (gameState === GAME_STATE.SKILLS) { this.closeSkills(); return; }
            // In combat, escape might close skill/item selection or do nothing
            if (gameState === GAME_STATE.COMBAT) {
                 if (!document.getElementById('combat-skill-selection').classList.contains('hidden')) {
                     CombatManager.hideSkillSelection(); return;
                 }
                 if (!document.getElementById('combat-item-selection').classList.contains('hidden')) {
                    CombatManager.hideItemSelection(); return;
                 }
                 // Maybe allow fleeing with Escape? For now, do nothing else.
                 return;
            }
        }

        // Movement Handling
        if (gameState === GAME_STATE.EXPLORING || gameState === GAME_STATE.HUB) {
            let dx = 0, dy = 0;
            switch (event.key) {
                case 'ArrowUp': case 'w': case 'W': dy = -1; break;
                case 'ArrowDown': case 's': case 'S': dy = 1; break;
                case 'ArrowLeft': case 'a': case 'A': dx = -1; break;
                case 'ArrowRight': case 'd': case 'D': dx = 1; break;
                case 'i': case 'I': this.toggleInventory(); return; // Inventory keybind
                case 'k': case 'K': this.toggleSkills(); return; // Skills keybind (K for Kompétences)
                default: return; // Ignore other keys for movement
            }
            event.preventDefault(); // Prevent page scrolling with arrow keys
            this.movePlayer(dx, dy);
        }

        // Combat Hotkeys (optional, could add 1-5 for actions later)
        // if (gameState === GAME_STATE.COMBAT && combatState.playerTurn) {
        //     switch(event.key) {
        //         case '1': CombatManager.playerAction('attack'); break;
        //         // Add more hotkeys if desired
        //     }
        // }
    },

    movePlayer: function(dx, dy) {
        if (!currentDungeon.map || currentDungeon.map.length === 0) return; // Map not ready

        const newX = player.pos.x + dx;
        const newY = player.pos.y + dy;

        // Check boundaries
        if (newY < 0 || newY >= currentDungeon.map.length || newX < 0 || newX >= currentDungeon.map[0].length) {
            logMessage("Impossible d'aller par là.");
            return;
        }

        const targetTileChar = currentDungeon.map[newY][newX];
        const targetPosKey = `${newX},${newY}`;

        // Check for walls
        if (targetTileChar === TILE.WALL) {
            logMessage("C'est un mur.");
            return;
        }

        // Check for enemies
        if (currentDungeon.enemies[targetPosKey]) {
            CombatManager.startCombat(currentDungeon.enemies[targetPosKey].type, targetPosKey);
            return; // Stop movement, enter combat
        }

        // --- Handle Tile Interactions (before actual move) ---
        if (targetTileChar === TILE.EXIT) {
            this.changeFloor(currentDungeon.floor + 1);
            return; // Stop movement, change floor
        }

        if (currentDungeon.id === 'hub') { // Hub-specific interactions
            if (targetTileChar === TILE.HUB_INN) {
                this.useInn();
                // Allow moving onto the Inn tile after using it
            } else if (targetTileChar === TILE.HUB_DUNGEON_1) {
                this.enterDungeon('dungeon1');
                return; // Stop movement, enter dungeon
            } else if (targetTileChar === TILE.HUB_DUNGEON_2) {
                this.enterDungeon('dungeon2');
                return; // Stop movement, enter dungeon
            }
        }

        // --- Player Actually Moves ---
        player.pos.x = newX;
        player.pos.y = newY;
        const currentPosKey = `${newX},${newY}`; // Player's new position key

        // --- Check Items/Chests on the New Tile ---
        if (currentDungeon.items[currentPosKey]) {
            const item = currentDungeon.items[currentPosKey];
            if (item.type === 'chest') {
                this.openChest(currentPosKey); // Chest opens automatically on step
            } else if (item.type === 'gold') {
                player.gold += item.value;
                logMessage(`Trouvé ${item.value} ${TILE.GOLD}.`);
                delete currentDungeon.items[currentPosKey]; // Remove gold
            } else if (item.type === 'potion') {
                InventoryManager.addInventoryItem(item.itemId, 1);
                logMessage(`Ramassé: ${Items[item.itemId]?.icon || '?'} ${Items[item.itemId]?.name || 'potion inconnue'}.`);
                delete currentDungeon.items[currentPosKey]; // Remove potion
            }
            // Note: Opening chest already saves, others don't need immediate save here
        }

        // Re-render after movement and potential item pickup/chest opening
        renderAll();
    },

     openChest: function(posKey) {
        if (!currentDungeon.items[posKey] || currentDungeon.items[posKey].type !== 'chest') return;

        logMessage(`Vous ouvrez le ${TILE.CHEST} coffre...`);
        delete currentDungeon.items[posKey]; // Remove chest from map data immediately

        // Determine rarity based on weighted chances
        let randomRoll = Math.random();
        let cumulativeChance = 0;
        let chosenRarity = 'COMMON'; // Default to common
        for (const rarityKey in RARITIES) {
            cumulativeChance += RARITIES[rarityKey].chance;
            if (randomRoll < cumulativeChance) {
                chosenRarity = rarityKey;
                break;
            }
        }

        // Generate the accessory
        const accessory = AccessoryGenerator.createAccessory(chosenRarity);
        player.accessoriesInventory.push(accessory); // Add to player's accessory inventory

        // Log the find with color
        const rarityInfo = RARITIES[chosenRarity];
        logMessage(`Trouvé: <span style="color:${rarityInfo.color}; font-weight:bold;">[${rarityInfo.name}] ${accessory.name}</span> !`);

        this.saveGame(); // Save after finding an item
        // renderAll() will be called by the movePlayer function after this returns
    },

    changeFloor: function(newFloor) {
        const dungeonData = Dungeons[currentDungeon.id];
        if (!dungeonData || dungeonData.fixed) { // Trying to change floor from hub? Go back.
             this.enterHub();
             return;
        }

        // Check if moving past the last floor
        if (newFloor > dungeonData.floors) {
            logMessage(`${dungeonData.name} terminé ! Retour au village.`);
            this.enterHub(); // Return to hub after last floor
        } else {
            logMessage(`${newFloor > currentDungeon.floor ? 'Descente' : 'Montée'} vers l'étage ${newFloor}...`);
            currentDungeon.floor = newFloor;
            const generated = dungeonData.mapGenerator(newFloor); // Generate the new floor
            currentDungeon.map = generated.map;
            currentDungeon.enemies = generated.enemies;
            currentDungeon.items = generated.items;
            player.pos = { ...generated.startPos }; // Move player to the start of the new floor
            gameState = GAME_STATE.EXPLORING;
            this.saveGame(); // Save progress upon changing floors
        }
        renderAll(); // Render the new floor/hub
    },

    enterDungeon: function(dungeonId) {
        const dungeonData = Dungeons[dungeonId];
        if (!dungeonData || dungeonData.fixed) return; // Can't enter fixed maps like Hub this way

        logMessage(`Entrée dans ${dungeonData.name}...`);
        currentDungeon.id = dungeonId;
        currentDungeon.floor = 1; // Always start at floor 1
        const generated = dungeonData.mapGenerator(1); // Generate the first floor
        currentDungeon.map = generated.map;
        currentDungeon.enemies = generated.enemies;
        currentDungeon.items = generated.items;
        player.pos = { ...generated.startPos }; // Place player at start
        gameState = GAME_STATE.EXPLORING;
        this.saveGame(); // Save upon entering a dungeon
        renderAll();
    },

    enterHub: function() {
        currentDungeon.id = 'hub';
        currentDungeon.floor = 0;
        const hubData = Dungeons['hub'];
        currentDungeon.map = hubData.map.map(row => row.split('')); // Need to split string rows into arrays
        currentDungeon.enemies = {}; // No enemies in hub
        currentDungeon.items = {}; // No items spawn in hub (maybe quests later?)

        this.setHubStartPosition(); // Set player start position
        gameState = GAME_STATE.HUB;
        logMessage(`Bienvenue au ${hubData.name} ! ${TILE.HUB_INN}: Auberge, ${TILE.SHOP ? TILE.SHOP+': Boutique, ': ''}${TILE.HUB_DUNGEON_1}/${TILE.HUB_DUNGEON_2}: Donjons.`);
        this.saveGame(); // Save when returning to hub
        renderAll();
    },

    enterShop: function() {
        if (gameState === GAME_STATE.HUB) {
             logMessage("Ouverture de la boutique...");
             gameState = GAME_STATE.SHOP;
             renderAll();
        } else {
             logMessage("La boutique n'est accessible qu'au Village.");
        }
    },
    exitShop: function() {
        if(gameState === GAME_STATE.SHOP) {
            logMessage("Fermeture de la boutique.");
            gameState = GAME_STATE.HUB; // Return to Hub state
            renderAll();
        }
    },
    useInn: function() {
        const cost = 10 + (player.level * 2); // Inn cost scales slightly with level
        if (player.gold >= cost) {
            player.gold -= cost;
            const stats = calculatePlayerStats();
            player.hp = stats.maxHp; // Full heal
            player.mp = stats.maxMp; // Full mana restore
            logMessage(`Repos à l'auberge ${TILE.HUB_INN} (-${cost} ${TILE.GOLD}). PV et PM restaurés !`);
            this.saveGame(); // Save after resting
            renderAll(); // Update stats display
        } else {
            logMessage(`Pas assez d'or pour l'auberge. (${player.gold}/${cost} ${TILE.GOLD}).`);
        }
    },
    gainXP: function(amount) {
        if (amount <= 0) return;
        player.xp += amount;
        logMessage(`+${amount} XP.`);
        this.checkLevelUp();
        renderStats(); // Update XP bar immediately
        // Save game happens within checkLevelUp if level up occurs
    },

    checkLevelUp: function() {
        const xpNeededForNextLevel = LEVEL_XP_REQUIREMENT[player.level];
        // Check if XP requirement exists and player meets or exceeds it, and not max level
        if (xpNeededForNextLevel && player.xp >= xpNeededForNextLevel && player.level < LEVEL_XP_REQUIREMENT.length) {
            player.level++;
            // Don't reset XP, keep overflow: player.xp = player.xp;
            logMessage(`⭐ Niveau ${player.level} atteint ! ⭐`);

            // Grant stat bonuses based on level up
            const hpGain = getRandomInt(3, 6);
            const mpGain = getRandomInt(1, 3);
            const attackGain = getRandomInt(1, 2);
            const defenseGain = getRandomInt(0, 1); // Defense gain is less common/smaller

            player.levelBonus.maxHp += hpGain;
            player.levelBonus.maxMp += mpGain;
            player.levelBonus.attack += attackGain;
            player.levelBonus.defense += defenseGain;

            // Restore some HP/MP on level up (e.g., 25% of new max)
            const stats = calculatePlayerStats(); // Recalculate with new levelBonus
            const hpRestore = Math.ceil(stats.maxHp * 0.25);
            const mpRestore = Math.ceil(stats.maxMp * 0.25);
            player.hp = Math.min(player.hp + hpRestore, stats.maxHp);
            player.mp = Math.min(player.mp + mpRestore, stats.maxMp);

            logMessage(`PV Max +${hpGain}, PM Max +${mpGain}, Att +${attackGain}, Déf +${defenseGain}. PV/PM partiellement restaurés.`);

            this.saveGame(); // Save after leveling up
            renderAll(); // Full render to reflect new stats and level

            // Recursively check again in case of multiple level ups from one XP gain
            this.checkLevelUp();
        }
    },

    toggleInventory: function() {
        if (gameState === GAME_STATE.INVENTORY) {
            this.closeInventory();
        } else if (gameState === GAME_STATE.EXPLORING || gameState === GAME_STATE.HUB) {
            gameState = GAME_STATE.INVENTORY;
            renderAll();
        } else {
            logMessage("Inventaire inaccessible pour le moment.");
        }
    },
    closeInventory: function() {
        // Return to the correct previous state (Hub or Exploring)
        if (currentDungeon.id === 'hub') {
            gameState = GAME_STATE.HUB;
        } else {
            gameState = GAME_STATE.EXPLORING;
        }
        renderAll();
    },
    toggleSkills: function() {
        if (gameState === GAME_STATE.SKILLS) {
            this.closeSkills();
        } else if (gameState === GAME_STATE.EXPLORING || gameState === GAME_STATE.HUB) {
            gameState = GAME_STATE.SKILLS;
            renderAll();
        } else {
            logMessage("Compétences inaccessibles pour le moment.");
        }
    },
    closeSkills: function() {
        // Return to the correct previous state
        if (currentDungeon.id === 'hub') {
            gameState = GAME_STATE.HUB;
        } else {
            gameState = GAME_STATE.EXPLORING;
        }
        renderAll();
    },
    gameOver: function() {
        logMessage("💀 GAME OVER 💀");
        gameState = GAME_STATE.GAME_OVER;
        renderAll(); // Show the game over screen
        // Optional: Could offer a "Restart" or "Load Game" button on the game over screen
    },
    hideGameOver: function() {
        // Ensure the screen is hidden if the game restarts or loads
        gameOverScreen.classList.add('hidden');
    },
    // Visual effect for taking damage
    triggerDamageFlash: function() {
        playerStatsPanel.classList.add('flash-damage');
        // Remove the class after the animation duration (adjust timeout to match CSS)
        setTimeout(() => {
            playerStatsPanel.classList.remove('flash-damage');
        }, 400); // 400ms matches the CSS animation
    },

    saveGame: function() {
        try {
            const saveData = {
                player: player,
                currentDungeonId: currentDungeon.id,
                currentDungeonFloor: currentDungeon.floor,
                // Limit message log save size to prevent huge local storage usage
                messageLog: messageLog.slice(0, 15) // Save only the last 15 messages
            };
            // Use a versioned key to avoid loading incompatible old saves
            localStorage.setItem('miniDungeonCrawlerSaveData_v3', JSON.stringify(saveData));
            console.log("Partie sauvegardée.");
        } catch (e) {
            console.error("Erreur de sauvegarde:", e);
            logMessage("Erreur lors de la sauvegarde de la partie !");
        }
    },

    loadGame: function() {
        try {
            const savedData = localStorage.getItem('miniDungeonCrawlerSaveData_v3');
            if (savedData) {
                const loadedData = JSON.parse(savedData);
                // Basic validation of loaded data
                if (!loadedData.player || !loadedData.currentDungeonId || typeof loadedData.currentDungeonFloor === 'undefined') {
                     throw new Error("Données de sauvegarde invalides ou incomplètes.");
                }

                player = loadedData.player;
                currentDungeon.id = loadedData.currentDungeonId;
                currentDungeon.floor = loadedData.currentDungeonFloor;
                messageLog = loadedData.messageLog || []; // Load log or default to empty

                // Post-load validation/setup is handled in initialize() after this returns true
                return true; // Signal that loading was successful
            } else {
                console.log("Aucune sauvegarde trouvée (v3).");
                return false; // No save file found
            }
        } catch (e) {
            console.error("Erreur de chargement:", e);
            logMessage("Erreur lors du chargement de la partie. Réinitialisation.");
            localStorage.removeItem('miniDungeonCrawlerSaveData_v3'); // Clear potentially corrupted save
            return false; // Signal that loading failed
        }
    },
    returnToHub: function() {
        if (gameState === GAME_STATE.EXPLORING) {
             logMessage("Retour au village...");
             this.enterHub();
        } else if (gameState === GAME_STATE.HUB) {
             logMessage("Vous êtes déjà au village.");
        } else {
             logMessage("Impossible de retourner au village maintenant.");
        }
    },
    updateButtonStates: function() {
        // Disable "Return to Hub" unless exploring a dungeon
        returnHubBtn.disabled = !(gameState === GAME_STATE.EXPLORING);
        // Disable "Shop" unless in the Hub
        shopBtn.disabled = !(gameState === GAME_STATE.HUB);
    }
};


// --- CombatManager Object ---
const CombatManager = {
    startCombat: function(enemyType, positionKey) {
        const enemyTemplate = Enemies[enemyType];
        if (!enemyTemplate) {
            console.error("Type d'ennemi invalide:", enemyType);
            return;
        }
        // Create a copy of the enemy template for the combat instance
        combatState = {
            active: true,
            enemy: { ...enemyTemplate }, // Copy base stats
            enemyType: enemyType,
            enemyPosKey: positionKey,
            enemyCurrentHp: enemyTemplate.hp, // Set current HP
            playerTurn: true, // Player goes first
            playerTempDefense: 0 // Reset temporary defense buff
        };
        gameState = GAME_STATE.COMBAT;
        logMessage(`Un ${enemyTemplate.name} (${enemyTemplate.tile}) apparaît !`);
        renderAll(); // Render the combat screen
    },

    endCombat: function(victory) {
        const enemyName = combatState.enemy?.name || 'Ennemi inconnu';
        const enemyTile = combatState.enemy?.tile || '?';
        const { enemyPosKey, enemyType } = combatState; // Keep track of who was fought where

        // --- Reset Combat State ---
        combatState = { active: false, enemy: null, enemyType: null, enemyPosKey: null, enemyCurrentHp: 0, playerTurn: true, playerTempDefense: 0 };

        if (victory) {
            logMessage(`Victoire sur ${enemyName} (${enemyTile}) !`);

            // Remove enemy from the dungeon map data
            if (currentDungeon.enemies[enemyPosKey]) {
                delete currentDungeon.enemies[enemyPosKey];
            }

            // Grant Rewards
            const rewards = Enemies[enemyType];
            if (rewards) {
                if (rewards.gold > 0) {
                    player.gold += rewards.gold;
                    logMessage(`+${rewards.gold} ${TILE.GOLD}.`);
                }
                if (rewards.xp > 0) {
                    GameManager.gainXP(rewards.xp); // Handles XP gain and level up checks
                }

                // Chest Drop Logic
                const isBoss = enemyTile === TILE.ENEMY_BOSS;
                const dropChance = isBoss ? 1.0 : CHEST_DROP_CHANCE; // Bosses always drop? Set to 1.0

                if (rewards.canDropChest && Math.random() < dropChance) {
                    // Try to drop the chest at the enemy's position
                    const dropPos = currentDungeon.enemies[enemyPosKey]?.originalPos || player.pos; // Fallback to player pos if enemy data gone
                    const dropPosKey = `${dropPos.x},${dropPos.y}`;

                    // Check if the tile is clear (floor tile, no other item/enemy)
                     if (currentDungeon.map[dropPos.y] && currentDungeon.map[dropPos.y][dropPos.x] === TILE.FLOOR && !currentDungeon.items[dropPosKey] && !currentDungeon.enemies[dropPosKey]) {
                        currentDungeon.items[dropPosKey] = { type: 'chest' };
                        logMessage(`Le ${enemyName} laisse un ${TILE.CHEST} coffre !`);
                    } else {
                        // Maybe drop at player's feet if enemy spot blocked? For now, just log.
                        logMessage(`Le ${enemyName} a essayé de laisser un coffre, mais l'endroit était obstrué.`);
                    }
                }
            }
            GameManager.saveGame(); // Save after successful combat and rewards
        } else { // Fled or other non-victory end
            logMessage(`Vous quittez le combat contre ${enemyName}.`);
            // Do not remove the enemy from the map if fled
        }

        // Return to previous game state (Hub or Exploring)
        if (currentDungeon.id === 'hub') {
            gameState = GAME_STATE.HUB;
        } else {
            gameState = GAME_STATE.EXPLORING;
        }
        renderAll(); // Render the map/hub again
    },

    playerAction: function(actionType, selection = null) {
        if (!combatState.active || !combatState.playerTurn) return; // Not player's turn or combat inactive

        const playerStats = calculatePlayerStats();
        const enemy = combatState.enemy;
        let turnEnded = false;
        combatState.playerTempDefense = 0; // Reset temporary defense buff at start of action (unless defending)

        switch(actionType) {
            case 'attack':
                // Calculate Hit/Crit/Dodge? For now, simple attack.
                const isCrit = Math.random() * 100 < playerStats.critChance;
                const critMultiplier = isCrit ? 1.5 : 1.0; // Simple crit multiplier
                let playerDamage = Math.max(1, Math.floor((playerStats.attack * critMultiplier) - enemy.defense + getRandomInt(-1, 1)));
                combatState.enemyCurrentHp -= playerDamage;
                logMessage(`${isCrit ? '💥 Coup Critique ! ' : ''}⚔️ Attaque -> ${enemy.name} (-${playerDamage} PV).`);
                turnEnded = true;
                break;

            case 'skill':
                const skill = Skills[selection];
                if (!skill || skill.type !== 'active') { logMessage("Compétence invalide."); return; } // Invalid skill ID or type
                if (player.mp < skill.mpCost) { logMessage(`PM insuffisants (${player.mp}/${skill.mpCost} ${TILE.POTION}).`); this.showSkillSelection(); return; } // Not enough MP

                player.mp -= skill.mpCost; // Deduct MP cost
                logMessage(`✨ Utilise ${skill.name} (${skill.icon}) ! (-${skill.mpCost} ${TILE.POTION})`);
                let skillMsg = "";

                // Apply skill effect
                switch(skill.effect) {
                    case 'damage':
                        const skillCrit = Math.random() * 100 < playerStats.critChance;
                        const skillCritMult = skillCrit ? 1.5 : 1.0;
                        const skillDmg = Math.max(1, Math.floor((playerStats.attack * skill.multiplier * skillCritMult)) - enemy.defense + getRandomInt(-1, 1));
                        combatState.enemyCurrentHp -= skillDmg;
                        skillMsg = `${skillCrit ? '💥 Critique ! ' : ''}Inflige ${skillDmg} dégâts.`;
                        break;
                    case 'magic_damage':
                         // Magic usually ignores defense or uses a different resist stat (not implemented yet)
                        const magicDmg = Math.max(1, skill.baseDamage + getRandomInt(-Math.floor(skill.baseDamage*0.1), Math.floor(skill.baseDamage*0.1))); // +/- 10% damage variance
                        combatState.enemyCurrentHp -= magicDmg;
                        skillMsg = `Inflige ${magicDmg} dégâts magiques.`;
                        break;
                    case 'heal':
                        const healed = Math.min(skill.value, playerStats.maxHp - player.hp); // Can't heal above max HP
                        player.hp += healed;
                        skillMsg = `Récupère ${healed} PV.`;
                        break;
                    case 'defense_boost':
                        combatState.playerTempDefense = skill.value; // Set temporary defense
                        skillMsg = `Défense augmentée de ${skill.value} pour 1 tour.`;
                        break;
                    default:
                        skillMsg = "Effet de compétence non implémenté.";
                }
                logMessage(skillMsg);
                turnEnded = true;
                break;

            case 'item':
                const item = Items[selection];
                if (!item || item.type !== 'potion' || !player.inventory[selection] || player.inventory[selection] <= 0) {
                    logMessage("Objet invalide ou inexistant."); this.showItemSelection(); return; // Invalid item or out of stock
                }

                player.inventory[selection]--; // Consume the item
                logMessage(`🎒 Utilise ${item.name} (${item.icon}).`);
                let itemMsg = "";
                if (item.effect === 'heal') {
                    const healed = Math.min(item.value, playerStats.maxHp - player.hp);
                    player.hp += healed;
                    itemMsg = `Récupère ${healed} PV.`;
                } else if (item.effect === 'mana') {
                    const restored = Math.min(item.value, playerStats.maxMp - player.mp);
                    player.mp += restored;
                    itemMsg = `Récupère ${restored} PM.`;
                }
                 if (player.inventory[selection] <= 0) { delete player.inventory[selection]; } // Clean up empty stack in inventory

                logMessage(itemMsg);
                turnEnded = true;
                break;

            case 'defend':
                // Boost defense significantly for one turn
                combatState.playerTempDefense = Math.ceil(playerStats.defense * 0.5) + 1; // Example: 50% boost + 1
                logMessage(`🛡️ Se met en garde (Défense +${combatState.playerTempDefense} temporaire).`);
                turnEnded = true;
                break;

            case 'flee':
                if (enemy.tile === TILE.ENEMY_BOSS) { // Cannot flee bosses
                    logMessage(`Impossible de fuir le ${enemy.name} !`);
                    turnEnded = true; // Turn still ends, attempt wasted
                } else if (Math.random() < 0.6) { // 60% chance to flee successfully
                    logMessage("🏃 Fuite réussie !");
                    this.endCombat(false); // End combat, non-victory
                    return; // Exit function early, no enemy turn
                } else {
                    logMessage("🏃 Tentative de fuite échouée !");
                    turnEnded = true; // Turn ends, failed attempt
                }
                break;

            default:
                logMessage("Action inconnue.");
                return; // Do nothing if action is not recognized
        }

        this.hideSkillSelection(); // Hide sub-menus after action
        this.hideItemSelection();

        if (turnEnded) {
             // Check if enemy is defeated
            if (combatState.enemyCurrentHp <= 0) {
                combatState.enemyCurrentHp = 0; // Ensure HP doesn't go negative
                renderAll(); // Update display to show 0 HP
                // Short delay before ending combat for effect
                setTimeout(() => this.endCombat(true), 600);
            } else {
                // Enemy still alive, switch to enemy turn
                combatState.playerTurn = false;
                renderAll(); // Update display to show it's enemy turn (disable buttons etc)
                // Delay enemy action slightly for pacing
                setTimeout(() => this.enemyTurn(), 900);
            }
        } else {
            // If turn didn't end (e.g., invalid selection), just re-render
            renderAll();
        }
    },

    enemyTurn: function() {
        if (!combatState.active || combatState.playerTurn || combatState.enemyCurrentHp <= 0) {
            return; // Combat ended or not enemy's turn
        }

        const enemy = combatState.enemy;
        const playerStats = calculatePlayerStats();
        const effectivePlayerDefense = playerStats.defense + combatState.playerTempDefense;
        let enemyActionMessage = "";
        let usedSkill = false;
        let enemyDamage = 0;

        // --- Enemy AI: Decide Action ---
        // Simple AI: Chance to use skill if available, otherwise attack.
        const availableSkills = enemy.skills?.filter(id => Skills[id]); // Check if skill exists in data
        const canUseAnySkill = availableSkills && availableSkills.length > 0; // Simplified check, doesn't consider MP cost for enemies yet

        // Example: 30% chance to use a skill if one is known
        if (canUseAnySkill && Math.random() < 0.3) {
            const skillToUseId = availableSkills[getRandomInt(0, availableSkills.length - 1)];
            const skill = Skills[skillToUseId];
            if (skill && skill.effect === 'damage') { // Currently only implement enemy damage skills
                 // Enemy skills might also crit? Not implemented yet.
                 enemyDamage = Math.max(1, Math.floor((enemy.attack * skill.multiplier)) - effectivePlayerDefense + getRandomInt(-1, 2));
                 enemyActionMessage = `${enemy.name} utilise ${skill.name} (${skill.icon}) !`;
                 usedSkill = true;
            }
            // Add other enemy skill effects here (heal, buff, etc.) if needed
        }

        // Default Attack
        if (!usedSkill) {
             // Check for player dodge
             const isDodged = Math.random() * 100 < playerStats.dodgeChance;
             if(isDodged) {
                 enemyDamage = 0;
                 enemyActionMessage = `💨 Vous esquivez l'attaque de ${enemy.name} !`;
             } else {
                enemyDamage = Math.max(1, enemy.attack - effectivePlayerDefense + getRandomInt(-1, 1));
                enemyActionMessage = `${enemy.name} (${enemy.tile}) attaque !`;
             }
        }

        // Apply damage and log message
        if(enemyDamage > 0) {
            player.hp -= enemyDamage;
            enemyActionMessage += ` -> Vous subissez ${enemyDamage} dégâts.`;
            GameManager.triggerDamageFlash(); // Visual feedback for taking damage
        }
        logMessage(enemyActionMessage);


        // Check if player is defeated
        if (player.hp <= 0) {
            player.hp = 0; // HP cannot be negative
            renderStats(); // Update display to show 0 HP
            setTimeout(() => GameManager.gameOver(), 800); // Delay game over slightly
        } else {
            // Player survived, switch back to player turn
            combatState.playerTurn = true;
            renderAll(); // Update UI for player turn
        }
    },

    // --- Skill/Item Selection UI ---
    showSkillSelection: function() {
        const skillDiv = document.getElementById('combat-skill-selection');
        const itemDiv = document.getElementById('combat-item-selection');
        if (!skillDiv || !itemDiv || !combatState.playerTurn) return;

        itemDiv.classList.add('hidden'); // Hide item menu if open
        skillDiv.classList.remove('hidden'); // Show skill menu

        let html = `<h4>Compétences (PM: ${player.mp}/${calculatePlayerStats().maxMp}${TILE.POTION})</h4><div class="action-buttons-container">`;
        let usableSkills = 0;
        const activeSkills = player.skills.filter(id => Skills[id] && Skills[id].type === 'active');

        if (activeSkills.length === 0) {
            html += '<p><i>Aucune compétence active connue.</i></p>';
        } else {
            activeSkills.forEach(id => {
                const s = Skills[id];
                const canUse = player.mp >= s.mpCost;
                html += `<button class="skill-button modal-button" ${!canUse ? 'disabled' : ''} onclick="CombatManager.selectSkill('${id}')" title="${getSkillDescription(s)}">${s.icon||'?'} ${s.name} (${s.mpCost}${TILE.POTION})</button>`;
                if (canUse) usableSkills++;
            });
            if (usableSkills === 0 && activeSkills.length > 0) {
                 html += '<p><i>Pas assez de PM pour utiliser une compétence.</i></p>';
            }
        }
        html += '<button class="cancel-button modal-button" onclick="CombatManager.hideSkillSelection()">Annuler</button>';
        html += '</div>'; // Close container
        skillDiv.innerHTML = html;
    },

    hideSkillSelection: function() {
        const div = document.getElementById('combat-skill-selection');
        if (div) div.classList.add('hidden');
    },

    selectSkill: function(skillId) {
        // this.hideSkillSelection(); // Action function will hide it
        this.playerAction('skill', skillId);
    },

    showItemSelection: function() {
        const itemDiv = document.getElementById('combat-item-selection');
        const skillDiv = document.getElementById('combat-skill-selection');
         if (!itemDiv || !skillDiv || !combatState.playerTurn) return;

        skillDiv.classList.add('hidden'); // Hide skill menu
        itemDiv.classList.remove('hidden'); // Show item menu

        let html = '<h4>Objets Consommables</h4><div class="action-buttons-container">';
        let usableItems = 0;
        for(const itemId in player.inventory) {
            if (player.inventory[itemId] > 0 && Items[itemId] && Items[itemId].type === 'potion') {
                 const item = Items[itemId];
                 let itemEffectDesc = item.effect === 'heal' ? `Soigne ${item.value} PV` : `Rend ${item.value} PM`;
                html += `<button class="item-button modal-button" onclick="CombatManager.selectItem('${itemId}')" title="${itemEffectDesc}">${item.icon||'?'} ${item.name} (x${player.inventory[itemId]})</button>`;
                usableItems++;
            }
        }
        if (usableItems === 0) {
             html += '<p><i>Aucune potion dans l\'inventaire.</i></p>';
        }
        html += '<button class="cancel-button modal-button" onclick="CombatManager.hideItemSelection()">Annuler</button>';
        html += '</div>'; // Close container
        itemDiv.innerHTML = html;
    },

    hideItemSelection: function() {
        const div = document.getElementById('combat-item-selection');
        if (div) div.classList.add('hidden');
    },

    selectItem: function(itemId) {
        // this.hideItemSelection(); // Action function will hide it
        this.playerAction('item', itemId);
    }
};

// --- ShopManager Object ---
const ShopManager = {
    buyItem: function(itemId) {
        const item = Items[itemId];
        if (!item) return; // Item doesn't exist

        if (player.gold >= item.cost) {
            player.gold -= item.cost;
            InventoryManager.addInventoryItem(itemId, 1);
            logMessage(`Achat: ${item.icon || '?'} ${item.name} (-${item.cost} ${TILE.GOLD}).`);
            renderShop(); // Update shop display (gold, potentially item availability if limited stock)
            renderStats(); // Update player gold display
            GameManager.saveGame();
        } else {
            logMessage(`Or insuffisant pour ${item.name}. (${player.gold}/${item.cost} ${TILE.GOLD}).`);
        }
    },

    sellItem: function(itemId) {
        const item = Items[itemId];
        // Can only sell weapons/armor that are in inventory and NOT equipped
        if (!item || !player.inventory[itemId] || player.inventory[itemId] <= 0 || (item.type !== 'weapon' && item.type !== 'armor')) {
            logMessage("Cet objet ne peut pas être vendu ou vous n'en avez pas.");
            return;
        }
        // Double-check it's not equipped (should be filtered by renderShop, but safe check)
        if(player.equipment.weapon === itemId || player.equipment.armor === itemId) {
            logMessage(`Vous devez déséquiper ${item.name} avant de le vendre.`);
            return;
        }

        const sellPrice = Math.floor(item.cost * 0.5); // Sell for 50% of base cost
        player.inventory[itemId]--; // Remove one item
        player.gold += sellPrice; // Add gold

        logMessage(`Vente: ${item.icon || '?'} ${item.name} (+${sellPrice} ${TILE.GOLD}).`);

        if (player.inventory[itemId] <= 0) {
            delete player.inventory[itemId]; // Remove item entry if count reaches zero
        }

        renderShop(); // Update shop display (item list, gold)
        renderStats(); // Update player gold display
        GameManager.saveGame();
    },

    learnSkill: function(skillId) {
        const skill = Skills[skillId];
        if (!skill) return; // Skill doesn't exist
        if (player.skills.includes(skillId)) { logMessage(`Vous connaissez déjà ${skill.name}.`); return; } // Already known

        if (player.gold >= skill.cost) {
            player.gold -= skill.cost;
            player.skills.push(skillId); // Add skill ID to player's list
            logMessage(`Compétence apprise: ${skill.icon || '?'} ${skill.name} (-${skill.cost} ${TILE.GOLD}).`);

            // If it's a passive stat boost, apply its effect immediately (recalculate stats)
            if (skill.type === 'passive' && skill.effect === 'stat_boost') {
                logMessage(`Effet passif de ${skill.name} est maintenant actif !`);
                // Recalculate stats and potentially adjust current HP/MP if max changed
                const oldStats = calculatePlayerStats(); // Need stats *before* the recalculation below
                const newStats = calculatePlayerStats(); // This recalculates including the new skill
                // Prevent death from max HP reduction, adjust current HP/MP proportionally or just cap
                player.hp = Math.min(player.hp, newStats.maxHp);
                player.mp = Math.min(player.mp, newStats.maxMp);
                // Optionally grant the increased HP/MP immediately if max increased
                // player.hp += Math.max(0, newStats.maxHp - oldStats.maxHp);
                // player.mp += Math.max(0, newStats.maxMp - oldStats.maxMp);
            }

            renderShop(); // Update shop (remove learned skill)
            renderAll(); // Update stats panel if needed
            GameManager.saveGame();
        } else {
            logMessage(`Or insuffisant pour apprendre ${skill.name}. (${player.gold}/${skill.cost} ${TILE.GOLD}).`);
        }
    }
};

// --- InventoryManager Object ---
const InventoryManager = {
    addInventoryItem: function(itemId, quantity) {
        if (!Items[itemId] || quantity <= 0) return; // Validate item and quantity
        if (!player.inventory[itemId]) {
            player.inventory[itemId] = 0; // Initialize if first time picking up
        }
        player.inventory[itemId] += quantity;
    },

    // Equip weapon or armor from inventory
    equipItem: function(itemId) {
        const item = Items[itemId];
        // Ensure item exists, is in inventory, and is equippable type
        if (!item || !player.inventory[itemId] || player.inventory[itemId] <= 0 || (item.type !== 'weapon' && item.type !== 'armor')) {
            logMessage("Impossible d'équiper cet objet.");
            return;
        }

        let type = item.type; // 'weapon' or 'armor'
        let currentEquipped = player.equipment[type];

        // If something is already equipped in that slot, unequip it first
        if (currentEquipped) {
             this.addInventoryItem(currentEquipped, 1); // Add the old item back to inventory
             logMessage(`Déséquipé automatiquement: ${Items[currentEquipped].icon || '?'} ${Items[currentEquipped].name}.`);
        }

        // Equip the new item
        player.equipment[type] = itemId;
        // Remove one instance from inventory
        player.inventory[itemId]--;
        if (player.inventory[itemId] <= 0) {
            delete player.inventory[itemId]; // Clean up inventory if count is zero
        }

        logMessage(`Équipé: ${item.icon || '?'} ${item.name}.`);
        renderAll(); // Update stats panel and inventory display
        GameManager.saveGame();
    },

    // Unequip weapon or armor, putting it back into inventory
    unequipItem: function(type) { // type is 'weapon' or 'armor'
        let currentEquipped = player.equipment[type];
        if(currentEquipped) {
            const item = Items[currentEquipped];
            this.addInventoryItem(currentEquipped, 1); // Add back to inventory
            player.equipment[type] = null; // Clear the equipment slot
            logMessage(`Déséquipé: ${item.icon || '?'} ${item.name}.`);
            renderAll(); // Update stats and inventory
            GameManager.saveGame();
        } else {
            logMessage("Rien à déséquiper dans cet emplacement.");
        }
    },

    // Use a potion from inventory (outside combat)
    usePotion: function(itemId) {
        // Prevent usage during shop/skills view or combat (use combat action instead)
        if (gameState === GAME_STATE.SHOP || gameState === GAME_STATE.SKILLS || gameState === GAME_STATE.COMBAT) {
            logMessage("Ne peut pas utiliser d'objet maintenant.");
            return;
        }
        const item = Items[itemId];
        if (!item || item.type !== 'potion' || !player.inventory[itemId] || player.inventory[itemId] <= 0) {
            logMessage("Impossible d'utiliser cet objet.");
            return;
        }

        player.inventory[itemId]--; // Consume the potion
        const playerStats = calculatePlayerStats(); // Get current max HP/MP
        logMessage(`Utilisé: ${item.icon || '?'} ${item.name}.`);
        let msg = "";

        if (item.effect === 'heal') {
            const healed = Math.min(item.value, playerStats.maxHp - player.hp); // Heal up to max HP
            if (healed > 0) {
                player.hp += healed;
                msg = `Récupère ${healed} PV.`;
            } else {
                msg = "Points de vie déjà au maximum.";
            }
        } else if (item.effect === 'mana') {
            const restored = Math.min(item.value, playerStats.maxMp - player.mp); // Restore up to max MP
            if (restored > 0) {
                player.mp += restored;
                msg = `Récupère ${restored} PM.`;
            } else {
                msg = "Points de mana déjà au maximum.";
            }
        }
        logMessage(msg);

        if (player.inventory[itemId] <= 0) {
            delete player.inventory[itemId]; // Clean up inventory
        }

        renderAll(); // Update stats display and inventory
        GameManager.saveGame();
    },

    // Equip an accessory from the accessories inventory
    equipAccessory: function(accessoryId) {
        // Find the accessory in the player's accessory inventory
        const accIndex = player.accessoriesInventory.findIndex(acc => acc && acc.id === accessoryId);
        if (accIndex === -1) {
            logMessage("Accessoire introuvable dans l'inventaire.");
            return;
        }
        const accessory = player.accessoriesInventory[accIndex];
        let targetSlot = null;

        // Determine target slot based on accessory type
        if (accessory.type === ACCESSORY_TYPE.RING) {
            // Find an empty ring slot
            if (!player.equipment.ring1) targetSlot = 'ring1';
            else if (!player.equipment.ring2) targetSlot = 'ring2';
            else {
                 logMessage("Les deux emplacements d'anneau sont occupés. Déséquipez-en un d'abord.");
                 return; // Both slots full
            }
        } else if (accessory.type === ACCESSORY_TYPE.AMULET) {
            if (!player.equipment.amulet) targetSlot = 'amulet';
            else {
                logMessage("L'emplacement d'amulette est occupé. Déséquipez-la d'abord.");
                return; // Slot full
            }
        } else {
            logMessage("Type d'accessoire inconnu.");
            return; // Should not happen
        }

        // Check if the target slot already has an item (shouldn't happen with the checks above, but good practice)
        const currentlyEquipped = player.equipment[targetSlot];
        if(currentlyEquipped) {
             // Unequip the old one first - put it back in accessory inventory
             player.accessoriesInventory.push(currentlyEquipped);
             logMessage(`Déséquipement automatique: ${formatAccessoryName(currentlyEquipped)} remis dans l'inventaire.`);
        }

        // Equip the new accessory
        player.equipment[targetSlot] = accessory;
        // Remove it from the inventory list
        player.accessoriesInventory.splice(accIndex, 1);

        const rarityInfo = RARITIES[accessory.rarity];
        logMessage(`Équipé: <span style="color:${rarityInfo.color};">[${rarityInfo.name}] ${accessory.name}</span> dans l'emplacement ${targetSlot}.`);

        renderAll(); // Update stats and inventory
        GameManager.saveGame();
    },

    // Unequip an accessory from a specific slot
    unequipAccessory: function(slot) { // slot is 'ring1', 'ring2', or 'amulet'
        const accessory = player.equipment[slot];
        if (!accessory) {
            logMessage(`L'emplacement ${slot} est déjà vide.`);
            return;
        }

        // Add the unequipped accessory back to the inventory
        player.accessoriesInventory.push(accessory);
        // Clear the equipment slot
        player.equipment[slot] = null;

        const rarityInfo = RARITIES[accessory.rarity];
        logMessage(`Déséquipé: <span style="color:${rarityInfo.color};">[${rarityInfo.name}] ${accessory.name}</span> (depuis ${slot}). Remis dans l'inventaire.`);

        renderAll(); // Update stats and inventory
        GameManager.saveGame();
    }
};

// --- Initialize Game ---
window.onload = () => {
    GameManager.initialize();
}; // Start the game once the DOM is fully loaded
