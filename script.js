// --- Constants ---
const TILE = { FLOOR: '.', WALL: '🧱', PLAYER: '🚶', EXIT: '🚪', GOLD: '💰', POTION: '✨', CHEST: '📦', ENEMY_GOBLIN: '👹', ENEMY_SKELETON: '💀', ENEMY_ORC: '👺', ENEMY_BOSS: '😈', HUB_INN: '🛌', HUB_DUNGEON_1: '①', HUB_DUNGEON_2: '②' };
const GAME_STATE = { EXPLORING: 'exploring', COMBAT: 'combat', HUB: 'hub', SHOP: 'shop', INVENTORY: 'inventory', SKILLS: 'skills', GAME_OVER: 'gameOver' };
const PLAYER_BASE_STATS = { hp: 30, mp: 10, attack: 5, defense: 2 };
const LEVEL_XP_REQUIREMENT = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000]; // Added more levels

const ACCESSORY_TYPE = { RING: 'Anneau', AMULET: 'Amulette' };
const RARITIES = {
    COMMON:    { name: 'Commun',     color: '#b0bec5', statMultiplier: 1.0, maxStats: 1, chance: 0.50 }, // Gris-bleu
    UNCOMMON:  { name: 'Incommun',   color: '#66bb6a', statMultiplier: 1.3, maxStats: 2, chance: 0.30 }, // Vert
    RARE:      { name: 'Rare',       color: '#42a5f5', statMultiplier: 1.7, maxStats: 3, chance: 0.15 }, // Bleu
    EPIC:      { name: 'Épique',     color: '#ab47bc', statMultiplier: 2.2, maxStats: 4, chance: 0.04 }, // Violet
    LEGENDARY: { name: 'Légendaire', color: '#ffa726', statMultiplier: 3.0, maxStats: 5, chance: 0.01 }  // Orange
};
const POSSIBLE_ACCESSORY_STATS = ['maxHp', 'maxMp', 'attack', 'defense', 'critChance', 'dodgeChance'];
const CHEST_DROP_CHANCE = 0.15; // 15% chance for eligible enemies

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
    "dungeon1": { name: "Forêt Sombre", floors: 2, mapGenerator: () => generateSimpleDungeon(15, 10, 1, 3, 1), bossFloor: null },
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
const statCrit = document.getElementById('stat-crit'); // New Stat element
const statDodge = document.getElementById('stat-dodge'); // New Stat element
const statGold = document.getElementById('stat-gold');
const statWeapon = document.getElementById('stat-weapon');
const statArmor = document.getElementById('stat-armor');
const statRing1 = document.getElementById('stat-ring1'); // New Equipment element
const statRing2 = document.getElementById('stat-ring2'); // New Equipment element
const statAmulet = document.getElementById('stat-amulet'); // New Equipment element
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
    console.log(message.replace(/<[^>]*>/g, '')); // Log without HTML tags
    messageLog.unshift(message); // Add to the beginning
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
            gameOverScreen.classList.remove('hidden'); // Show game over screen using class
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
    const nextLevelXP = LEVEL_XP_REQUIREMENT[player.level] || Infinity;

    statLevel.textContent = player.level;
    statXP.textContent = currentXP;
    statXPNext.textContent = nextLevelXP !== Infinity ? nextLevelXP : 'MAX';
    statHP.textContent = player.hp;
    statMaxHP.textContent = calculatedStats.maxHp;
    statMP.textContent = player.mp;
    statMaxMP.textContent = calculatedStats.maxMp;
    statAttack.textContent = calculatedStats.attack;
    statDefense.textContent = calculatedStats.defense;
    if (statCrit) statCrit.textContent = `${calculatedStats.critChance || 0}%`;
    if (statDodge) statDodge.textContent = `${calculatedStats.dodgeChance || 0}%`;
    statGold.textContent = player.gold;

    // Equipment display
    statWeapon.textContent = player.equipment.weapon ? Items[player.equipment.weapon].name : 'Aucune';
    statArmor.textContent = player.equipment.armor ? Items[player.equipment.armor].name : 'Aucune';
    if (statRing1) statRing1.innerHTML = formatAccessoryName(player.equipment.ring1);
    if (statRing2) statRing2.innerHTML = formatAccessoryName(player.equipment.ring2);
    if (statAmulet) statAmulet.innerHTML = formatAccessoryName(player.equipment.amulet);

    // Update bars
    const hpPercent = calculatedStats.maxHp > 0 ? (player.hp / calculatedStats.maxHp) * 100 : 0;
    const mpPercent = calculatedStats.maxMp > 0 ? (player.mp / calculatedStats.maxMp) * 100 : 0;
    let xpPercent = 0;
     if (nextLevelXP !== Infinity) {
         const xpForThisLevel = nextLevelXP - currentLevelXP;
         const xpGainedThisLevel = currentXP - currentLevelXP;
         xpPercent = xpForThisLevel > 0 ? (xpGainedThisLevel / xpForThisLevel) * 100 : 100;
     } else {
         xpPercent = 100; // Max level
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
    messageLogElement.innerHTML = '<h3>Log</h3>' + messageLog.map(msg => `<p>${msg}</p>`).join('');
    messageLogElement.scrollTop = 0; // Scroll to top (newest message)
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
            let title = '';

            if (player.pos.x === x && player.pos.y === y) {
                tileClasses.push('tile-player');
                title = "Vous";
            } else if (currentDungeon.enemies[posKey]) {
                const enemyData = currentDungeon.enemies[posKey];
                const enemyInfo = Enemies[enemyData.type];
                tileClasses.push('tile-enemy');
                if (enemyInfo.tile === TILE.ENEMY_GOBLIN) tileClasses.push('tile-enemy-g');
                else if (enemyInfo.tile === TILE.ENEMY_SKELETON) tileClasses.push('tile-enemy-s');
                else if (enemyInfo.tile === TILE.ENEMY_ORC) tileClasses.push('tile-enemy-o');
                else if (enemyInfo.tile === TILE.ENEMY_BOSS) tileClasses.push('tile-enemy-b');
                else tileClasses.push('tile-enemy-g');
                title = enemyInfo.name;
            } else if (currentDungeon.items[posKey]) {
                const item = currentDungeon.items[posKey];
                 if (item.type === 'chest') { // Check for chest first
                    tileClasses.push('tile-chest');
                    title = "Coffre";
                } else { // Then other items
                    tileClasses.push('tile-item');
                    if (item.type === 'gold') {
                        tileClasses.push('tile-gold');
                        title = `${item.value} Or`;
                    } else if (item.type === 'potion') {
                        tileClasses.push('tile-potion');
                        title = Items[item.itemId] ? Items[item.itemId].name : "Potion";
                    }
                }
            } else { // Map tile
                switch (mapChar) {
                    case TILE.WALL: tileClasses.push('tile-wall'); title = "Mur"; break;
                    case TILE.FLOOR: tileClasses.push('tile-floor'); break;
                    case TILE.EXIT: tileClasses.push('tile-exit'); title = "Sortie"; break;
                    case TILE.HUB_INN: tileClasses.push('tile-hub', 'tile-hub-inn'); title = "Auberge"; break;
                    case TILE.HUB_DUNGEON_1: tileClasses.push('tile-hub', 'tile-hub-dungeon', 'dungeon-1'); title = Dungeons['dungeon1'] ? Dungeons['dungeon1'].name : "Donjon 1"; break;
                    case TILE.HUB_DUNGEON_2: tileClasses.push('tile-hub', 'tile-hub-dungeon', 'dungeon-2'); title = Dungeons['dungeon2'] ? Dungeons['dungeon2'].name : "Donjon 2"; break;
                    default: tileClasses.push('tile-floor');
                }
            }
            mapHTML += `<span class="${tileClasses.join(' ')}" title="${title}"></span>`;
        }
        mapHTML += '\n';
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
                <h3>Vous (🚶)</h3>
                <p>PV: ${player.hp}/${playerStats.maxHp}</p>
                <p>PM: ${player.mp}/${playerStats.maxMp}</p>
                <p>Att: ${playerStats.attack}</p>
                <p>Déf: ${playerStats.defense + combatState.playerTempDefense}</p>
                ${combatState.playerTempDefense > 0 ? '<p style="font-size:0.9em; color:lightblue;">(Défense +'+combatState.playerTempDefense+' temporaire)</p>' : ''}
            </div>
            <div class="combatant-info">
                <h3>${enemy.name} (${enemy.tile})</h3>
                <p>PV: ${combatState.enemyCurrentHp}/${enemy.hp}</p>
                <p>Att: ${enemy.attack}</p>
                <p>Déf: ${enemy.defense}</p>
            </div>
        </div>
        <div class="combat-actions">
            <button class="action-button" onclick="CombatManager.playerAction('attack')">⚔️ Attaquer</button>
            <button class="action-button" onclick="CombatManager.showSkillSelection()">✨ Compétence</button>
            <button class="action-button" onclick="CombatManager.showItemSelection()">🎒 Objet</button>
            <button class="action-button" onclick="CombatManager.playerAction('defend')">🛡️ Défendre</button>
            <button class="action-button" onclick="CombatManager.playerAction('flee')" ${enemy.tile === TILE.ENEMY_BOSS ? 'disabled' : ''}>🏃 Fuir</button>
        </div>
        <div id="combat-skill-selection" class="hidden"></div>
        <div id="combat-item-selection" class="hidden"></div>
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

    // Populate sell category (only non-equipped weapons/armor)
    for(const itemId in player.inventory) {
        if(player.inventory[itemId] > 0 && Items[itemId] && (Items[itemId].type === 'weapon' || Items[itemId].type === 'armor')) {
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
                shopHTML += '<p style="font-size: 0.9em; color: var(--text-medium);">Vendez votre équipement non utilisé (50% prix).</p>';
                if (itemCategories['Vendre'].length === 0) shopHTML += "<p><i>Rien à vendre.</i></p>";
            }
            itemCategories[categoryName].forEach(id => {
                let item, cost, effectText, icon, actionButton;
                const isSelling = categoryName === 'Vendre';
                if (isSelling) {
                    item = Items[id]; cost = Math.floor(item.cost * 0.5);
                    effectText = `Quantité: ${player.inventory[id]}`; icon = item.icon || '❓';
                    actionButton = `<button class="shop-button modal-button" onclick="ShopManager.sellItem('${id}')">Vendre 1 (💰 ${cost})</button>`;
                } else if (categoryName === 'Compétences') {
                    item = Skills[id]; cost = item.cost;
                    effectText = getSkillDescription(item) + (item.type === 'active' ? ` (Coût: ${item.mpCost}💧)` : ' (Passif)');
                    icon = item.icon || '❓'; const canAfford = player.gold >= cost;
                    actionButton = `<button class="shop-button modal-button" data-item-id="${id}" onclick="ShopManager.learnSkill('${id}')" ${!canAfford ? 'disabled' : ''}>Apprendre</button>`;
                } else {
                    item = Items[id]; cost = item.cost;
                    if (item.type === 'weapon') effectText = `Att +${item.attack || 0}${item.mpBonus ? ', PM Max +'+item.mpBonus : ''}`;
                    else if (item.type === 'armor') effectText = `Déf +${item.defense || 0}`;
                    else if (item.type === 'potion') effectText = item.effect === 'heal' ? `Soigne ${item.value} PV` : `Rend ${item.value} PM`;
                    else effectText = '';
                    icon = item.icon || '❓'; const canAfford = player.gold >= cost;
                    actionButton = `<button class="shop-button modal-button" data-item-id="${id}" onclick="ShopManager.buyItem('${id}')" ${!canAfford ? 'disabled' : ''}>Acheter</button>`;
                }
                shopHTML += `
                    <div class="shop-item">
                        <span class="shop-item-icon">${icon}</span>
                        <div class="shop-item-info"><span class="shop-item-name">${item.name}</span><span class="shop-item-effect">${effectText}</span></div>
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
    inventoryHTML += `<h3>Équipement</h3>`;
    inventoryHTML += `<div class="list-item"><span>🗡️ Arme: <strong id="inv-eq-weapon">${player.equipment.weapon ? Items[player.equipment.weapon].name : 'Aucune'}</strong></span>${player.equipment.weapon ? `<button class="inventory-button" onclick="InventoryManager.unequipItem('weapon')">Déséquiper</button>` : ''}</div>`;
    inventoryHTML += `<div class="list-item"><span>👕 Armure: <strong id="inv-eq-armor">${player.equipment.armor ? Items[player.equipment.armor].name : 'Aucune'}</strong></span>${player.equipment.armor ? `<button class="inventory-button" onclick="InventoryManager.unequipItem('armor')">Déséquiper</button>` : ''}</div>`;
    inventoryHTML += `<div class="list-item"><span>💍 Anneau 1: <strong id="inv-eq-ring1">${formatAccessoryName(player.equipment.ring1)}</strong></span>${player.equipment.ring1 ? `<button class="inventory-button" onclick="InventoryManager.unequipAccessory('ring1')">Déséquiper</button>` : ''}</div>`;
    inventoryHTML += `<div class="list-item"><span>💍 Anneau 2: <strong id="inv-eq-ring2">${formatAccessoryName(player.equipment.ring2)}</strong></span>${player.equipment.ring2 ? `<button class="inventory-button" onclick="InventoryManager.unequipAccessory('ring2')">Déséquiper</button>` : ''}</div>`;
    inventoryHTML += `<div class="list-item"><span>📿 Amulette: <strong id="inv-eq-amulet">${formatAccessoryName(player.equipment.amulet)}</strong></span>${player.equipment.amulet ? `<button class="inventory-button" onclick="InventoryManager.unequipAccessory('amulet')">Déséquiper</button>` : ''}</div>`;

    // Consumables Section
    inventoryHTML += `<h3>Objets Consommables</h3>`;
    let hasConsumables = false;
    for (const itemId in player.inventory) {
        if (player.inventory[itemId] > 0 && Items[itemId] && Items[itemId].type === 'potion') {
            hasConsumables = true;
            const item = Items[itemId];
            inventoryHTML += `<div class="list-item"><span>${item.icon || '?'} <strong>${item.name}</strong> x ${player.inventory[itemId]}</span><span> <button class="inventory-button" onclick="InventoryManager.usePotion('${itemId}')">Utiliser</button> </span></div>`;
        }
    }
    if (!hasConsumables) inventoryHTML += "<p><i>Aucun consommable.</i></p>";

    // Accessories Section
    inventoryHTML += `<h3>Accessoires Non Équipés</h3>`;
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

    inventoryHTML += '<hr><button class="modal-button" onclick="GameManager.closeInventory()">Fermer</button>';
    inventoryDisplay.innerHTML = inventoryHTML;

    // Update equipped item names within the inventory modal itself (using innerHTML for accessory format)
    const invEqWeapon = document.getElementById('inv-eq-weapon'); if(invEqWeapon) invEqWeapon.innerHTML = player.equipment.weapon ? Items[player.equipment.weapon].name : 'Aucune';
    const invEqArmor = document.getElementById('inv-eq-armor'); if(invEqArmor) invEqArmor.innerHTML = player.equipment.armor ? Items[player.equipment.armor].name : 'Aucune';
    const invEqRing1 = document.getElementById('inv-eq-ring1'); if(invEqRing1) invEqRing1.innerHTML = formatAccessoryName(player.equipment.ring1);
    const invEqRing2 = document.getElementById('inv-eq-ring2'); if(invEqRing2) invEqRing2.innerHTML = formatAccessoryName(player.equipment.ring2);
    const invEqAmulet = document.getElementById('inv-eq-amulet'); if(invEqAmulet) invEqAmulet.innerHTML = formatAccessoryName(player.equipment.amulet);
}

function renderSkills() {
    let skillsHTML = `<h2>✨ Compétences</h2>`;
    if (player.skills.length === 0) {
        skillsHTML += "<p><i>Vous n'avez appris aucune compétence. Visitez la boutique !</i></p>";
    } else {
        let actives = player.skills.filter(id => Skills[id] && Skills[id].type === 'active');
        let passives = player.skills.filter(id => Skills[id] && Skills[id].type === 'passive');

        skillsHTML += "<h3>Actives</h3>";
        if (actives.length > 0) {
            actives.forEach(skillId => {
                const skill = Skills[skillId];
                skillsHTML += `<div class="list-item"><span>${skill.icon || '?'} <strong>${skill.name}</strong></span><em>${getSkillDescription(skill)} (Coût: ${skill.mpCost}💧)</em></div>`;
            });
        } else skillsHTML += "<p><i>Aucune compétence active connue.</i></p>";

        skillsHTML += "<h3>Passives</h3>";
        if (passives.length > 0) {
            passives.forEach(skillId => {
                const skill = Skills[skillId];
                skillsHTML += `<div class="list-item"><span>${skill.icon || '?'} <strong>${skill.name}</strong></span><em>${getSkillDescription(skill)}</em></div>`;
            });
        } else skillsHTML += "<p><i>Aucune compétence passive connue.</i></p>";
    }
    skillsHTML += '<hr><button class="modal-button" onclick="GameManager.closeSkills()">Fermer</button>';
    skillsDisplay.innerHTML = skillsHTML;
}


function getSkillDescription(skill) {
    if (!skill || !skill.effect) return "Effet inconnu.";
    switch(skill.effect) {
        case 'damage': return `Inflige ${skill.multiplier}x dégâts d'Attaque.`;
        case 'magic_damage': return `Inflige ${skill.baseDamage} dégâts magiques (environ).`;
        case 'heal': return `Restaure ${skill.value} PV.`;
        case 'stat_boost':
            let statName = skill.stat;
            if (skill.stat === 'maxHp') statName = "PV Max";
            else if (skill.stat === 'maxMp') statName = "PM Max";
            else if (skill.stat === 'attack') statName = "Attaque";
            else if (skill.stat === 'defense') statName = "Défense";
            else if (skill.stat === 'critChance') statName = "Critique";
            else if (skill.stat === 'dodgeChance') statName = "Esquive";
            return `Augmente ${statName} de ${skill.value}${statName.includes('%')?'%':''}.`;
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
                    // Initialize if stat doesn't exist (shouldn't happen with current setup)
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
    let floorTiles = 1; const targetFloorTiles = Math.floor(width * height * 0.4);
    let directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]; let steps = 0; const maxSteps = width * height * 5;

    while (floorTiles < targetFloorTiles && steps < maxSteps) {
        directions.sort(() => Math.random() - 0.5); let moved = false;
        for (let i = 0; i < directions.length; i++) {
            let [dx, dy] = directions[i]; let nextX = currentX + dx * 2; let nextY = currentY + dy * 2;
            if (nextX > 0 && nextX < width - 1 && nextY > 0 && nextY < height - 1) {
                 if (map[currentY + dy][currentX + dx] === TILE.WALL) { map[currentY + dy][currentX + dx] = TILE.FLOOR; floorTiles++; }
                 if (map[nextY][nextX] === TILE.WALL) { map[nextY][nextX] = TILE.FLOOR; floorTiles++; }
                 currentX = nextX; currentY = nextY; moved = true; break;
            }
        }
        if (!moved) {
            let floorCoords = [];
            for(let y=1; y < height-1; y++) { for(let x=1; x < width-1; x++) { if (map[y][x] === TILE.FLOOR) floorCoords.push({x, y}); } }
            if(floorCoords.length > 0){ const randCoord = floorCoords[getRandomInt(0, floorCoords.length - 1)]; currentX = randCoord.x; currentY = randCoord.y; } else break;
        } steps++;
    }

     let maxDist = -1; let floorCoords = [];
     for(let y=1; y < height-1; y++) { for(let x=1; x < width-1; x++) { if (map[y][x] === TILE.FLOOR) { floorCoords.push({x,y}); let dist = Math.abs(x - startPos.x) + Math.abs(y - startPos.y); if (dist > maxDist) { maxDist = dist; exitPos = { x, y }; } } } }
     if (exitPos.x !== -1 && map[exitPos.y][exitPos.x] === TILE.FLOOR) { map[exitPos.y][exitPos.x] = TILE.EXIT; }
     else if (floorCoords.length > 0) { const fallbackExitPos = floorCoords[getRandomInt(0, floorCoords.length - 1)]; exitPos = {x: fallbackExitPos.x, y: fallbackExitPos.y}; map[exitPos.y][exitPos.x] = TILE.EXIT; }
     else { map[currentY][currentX] = TILE.EXIT; exitPos = {x: currentX, y: currentY}; }

    let enemyCount = 0; let tries = 0; const enemyTypes = floor <= 1 ? ['goblin'] : (floor <= 2 ? ['goblin', 'skeleton'] : ['skeleton', 'orc']);
    let availableCoords = floorCoords.filter(c => (c.x !== startPos.x || c.y !== startPos.y) && (c.x !== exitPos.x || c.y !== exitPos.y));

    while(enemyCount < maxEnemies && tries < maxEnemies * 10 && availableCoords.length > 0) {
        let randIndex = getRandomInt(0, availableCoords.length - 1); let pos = availableCoords.splice(randIndex, 1)[0];
        const posKey = `${pos.x},${pos.y}`;
        if (!enemies[posKey] && !items[posKey] && map[pos.y][pos.x] === TILE.FLOOR) {
            const enemyType = enemyTypes[getRandomInt(0, enemyTypes.length - 1)];
            enemies[posKey] = { type: enemyType, originalPos: { ...pos } }; enemyCount++;
        } tries++;
    }

    const dungeonData = Dungeons[currentDungeon.id];
    if (dungeonData && dungeonData.bossFloor === floor && dungeonData.bossType) {
        let bossPlaced = false; let possibleBossSpots = [];
        for(let dy = -1; dy <= 1; dy++){ for(let dx = -1; dx <= 1; dx++){ if(Math.abs(dx) + Math.abs(dy) !== 1) continue; let checkX = exitPos.x + dx; let checkY = exitPos.y + dy; const checkKey = `${checkX},${checkY}`; if (checkX > 0 && checkX < width - 1 && checkY > 0 && checkY < height - 1 && map[checkY][checkX] === TILE.FLOOR && !enemies[checkKey] && !items[checkKey]) { possibleBossSpots.push({x: checkX, y: checkY}); } } }
        if(possibleBossSpots.length > 0) { const bossPos = possibleBossSpots[getRandomInt(0, possibleBossSpots.length-1)]; const bossKey = `${bossPos.x},${bossPos.y}`; enemies[bossKey] = { type: dungeonData.bossType, originalPos: { ...bossPos } }; bossPlaced = true; availableCoords = availableCoords.filter(c => c.x !== bossPos.x || c.y !== bossPos.y); }
        if (!bossPlaced && availableCoords.length > 0) { let randIndex = getRandomInt(0, availableCoords.length - 1); let pos = availableCoords.splice(randIndex, 1)[0]; const posKey = `${pos.x},${pos.y}`; if (!enemies[posKey] && !items[posKey] && map[pos.y][pos.x] === TILE.FLOOR) { enemies[posKey] = { type: dungeonData.bossType, originalPos: { ...pos } }; } }
    }

    let itemCount = 0; tries = 0;
    while(itemCount < maxItems && tries < maxItems * 10 && availableCoords.length > 0) {
        let randIndex = getRandomInt(0, availableCoords.length - 1); let pos = availableCoords.splice(randIndex, 1)[0];
        const posKey = `${pos.x},${pos.y}`;
        if (!enemies[posKey] && !items[posKey] && map[pos.y][pos.x] === TILE.FLOOR) {
            if (Math.random() < 0.7) { items[posKey] = { type: 'gold', value: getRandomInt(5 * floor, 15 * floor) }; }
            else { const potionTypes = ['p_heal_s', 'p_mana_s']; const potionId = potionTypes[getRandomInt(0, potionTypes.length - 1)]; items[posKey] = { type: 'potion', itemId: potionId }; }
            itemCount++;
        } tries++;
    }
    return { map, enemies, items, startPos };
}


// --- Accessory Generator ---
const AccessoryGenerator = {
    createAccessory: function(rarityKey) {
        const rarity = RARITIES[rarityKey];
        if (!rarity) { console.error("Rareté invalide:", rarityKey); rarityKey = 'COMMON'; rarity = RARITIES.COMMON; }

        const accessory = {
            id: Date.now() + '-' + Math.random().toString(36).substring(2, 9),
            type: Math.random() < 0.6 ? ACCESSORY_TYPE.RING : ACCESSORY_TYPE.AMULET,
            rarity: rarityKey,
            name: '',
            stats: {}
        };

        let availableStats = [...POSSIBLE_ACCESSORY_STATS];
        const numStats = Math.min(availableStats.length, rarity.maxStats);

        for (let i = 0; i < numStats; i++) {
            if (availableStats.length === 0) break;
            const statIndex = getRandomInt(0, availableStats.length - 1);
            const statName = availableStats.splice(statIndex, 1)[0];
            let value = 0; let baseValue = 1;
            switch (statName) {
                case 'maxHp':       baseValue = getRandomInt(5, 10); break;
                case 'maxMp':       baseValue = getRandomInt(3, 7); break;
                case 'attack':      baseValue = getRandomInt(1, 2); break;
                case 'defense':     baseValue = getRandomInt(1, 2); break;
                case 'critChance':  baseValue = getRandomInt(1, 3); break;
                case 'dodgeChance': baseValue = getRandomInt(1, 3); break;
            }
            value = Math.max(1, Math.round(baseValue * rarity.statMultiplier * (0.8 + Math.random() * 0.4)));
            accessory.stats[statName] = value;
        }
        accessory.name = `${accessory.type} ${this.generateNameSuffix(accessory.stats)}`;
        return accessory;
    },
    generateNameSuffix: function(stats) {
        let bestStat = ''; let bestValue = -1;
        for (const stat in stats) {
            let currentWeight = 1;
             switch (stat) { case 'maxHp': currentWeight = 0.2; break; case 'maxMp': currentWeight = 0.3; break; case 'attack': currentWeight = 1.5; break; case 'defense': currentWeight = 1.2; break; }
            let weightedValue = stats[stat] * currentWeight;
            if (weightedValue > bestValue) { bestValue = weightedValue; bestStat = stat; }
        }
        switch (bestStat) {
            case 'maxHp': return "de Vitalité"; case 'maxMp': return "d'Esprit"; case 'attack': return "de Force";
            case 'defense': return "de Garde"; case 'critChance': return "de Précision"; case 'dodgeChance': return "d'Agilité";
            default: return "Mystérieux";
        }
    }
};

// --- GameManager Object ---
const GameManager = {
    initialize: function() {
        if (!this.loadGame()) {
            player = {
                level: 1, xp: 0, hp: PLAYER_BASE_STATS.hp, mp: PLAYER_BASE_STATS.mp, gold: 20, pos: { x: -1, y: -1 },
                equipment: { weapon: null, armor: null, ring1: null, ring2: null, amulet: null },
                inventory: { 'p_heal_s': 1 }, accessoriesInventory: [], skills: [],
                levelBonus: { maxHp: 0, maxMp: 0, attack: 0, defense: 0 }
            };
            this.enterHub();
        } else {
            if (messageLog.length === 0) logMessage("Partie chargée.");
             // Ensure player structure is complete after loading potentially older save
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
        }
        document.addEventListener('keydown', this.handleInput.bind(this));
        renderAll();
    },

    handleInput: function(event) {
        if (gameState === GAME_STATE.GAME_OVER) return;
        if (event.key === 'Escape') {
            if (gameState === GAME_STATE.SHOP) this.exitShop();
            else if (gameState === GAME_STATE.INVENTORY) this.closeInventory();
            else if (gameState === GAME_STATE.SKILLS) this.closeSkills();
            else if (gameState === GAME_STATE.COMBAT) { CombatManager.hideSkillSelection(); CombatManager.hideItemSelection(); }
            return;
        }
        if (gameState === GAME_STATE.EXPLORING || gameState === GAME_STATE.HUB) {
            let dx = 0, dy = 0;
            switch (event.key) {
                case 'ArrowUp': case 'w': dy = -1; break;
                case 'ArrowDown': case 's': dy = 1; break;
                case 'ArrowLeft': case 'a': dx = -1; break;
                case 'ArrowRight': case 'd': dx = 1; break;
                default: return;
            }
            event.preventDefault();
            this.movePlayer(dx, dy);
        }
    },

    movePlayer: function(dx, dy) {
        if (!currentDungeon.map || currentDungeon.map.length === 0) return;
        const newX = player.pos.x + dx; const newY = player.pos.y + dy;
        if (newY < 0 || newY >= currentDungeon.map.length || newX < 0 || newX >= currentDungeon.map[0].length) { logMessage("Impossible."); return; }
        const targetTileChar = currentDungeon.map[newY][newX];
        const targetPosKey = `${newX},${newY}`;
        if (targetTileChar === TILE.WALL) { logMessage("Mur."); return; }
        if (currentDungeon.enemies[targetPosKey]) { CombatManager.startCombat(currentDungeon.enemies[targetPosKey].type, targetPosKey); return; }
        if (targetTileChar === TILE.EXIT) { this.changeFloor(currentDungeon.floor + 1); return; }
        if (currentDungeon.id === 'hub') {
            if (targetTileChar === TILE.HUB_INN) { this.useInn(); return; }
            if (targetTileChar === TILE.HUB_DUNGEON_1) { this.enterDungeon('dungeon1'); return; }
            if (targetTileChar === TILE.HUB_DUNGEON_2) { this.enterDungeon('dungeon2'); return; }
        }

        // --- Move Player ---
        player.pos.x = newX; player.pos.y = newY;
        const currentPosKey = `${newX},${newY}`;

        // --- Check items/chests on new tile ---
        if (currentDungeon.items[currentPosKey]) {
            const item = currentDungeon.items[currentPosKey];
            if (item.type === 'chest') { this.openChest(currentPosKey); }
             else if (item.type === 'gold') {
                player.gold += item.value; logMessage(`Trouvé ${item.value} ${TILE.GOLD}.`);
                delete currentDungeon.items[currentPosKey];
            } else if (item.type === 'potion') {
                InventoryManager.addInventoryItem(item.itemId, 1); logMessage(`Ramassé: ${Items[item.itemId]?.icon || '?'} ${Items[item.itemId]?.name || 'potion'}.`);
                delete currentDungeon.items[currentPosKey];
            }
        }
        renderAll();
    },

     openChest: function(posKey) {
        logMessage(`Vous ouvrez le ${TILE.CHEST} coffre...`);
        delete currentDungeon.items[posKey]; // Remove chest from map

        let randomRoll = Math.random(); let cumulativeChance = 0; let chosenRarity = 'COMMON';
        for (const rarityKey in RARITIES) {
            cumulativeChance += RARITIES[rarityKey].chance;
            if (randomRoll < cumulativeChance) { chosenRarity = rarityKey; break; }
        }
        const accessory = AccessoryGenerator.createAccessory(chosenRarity);
        player.accessoriesInventory.push(accessory);
        const rarityInfo = RARITIES[chosenRarity];
        logMessage(`Trouvé: <span style="color:${rarityInfo.color}; font-weight:bold;">[${rarityInfo.name}] ${accessory.name}</span> !`);
        this.saveGame();
        // renderAll() called by movePlayer after this returns
    },

    changeFloor: function(newFloor) {
        const dungeonData = Dungeons[currentDungeon.id];
        if (!dungeonData || dungeonData.fixed) { this.enterHub(); return; }
        if (newFloor > dungeonData.floors) { logMessage(`${dungeonData.name} terminé ! Retour au village.`); this.enterHub(); }
        else {
            logMessage(`${newFloor > currentDungeon.floor ? 'Descente' : 'Montée'} vers l'étage ${newFloor}...`);
            currentDungeon.floor = newFloor; const generated = dungeonData.mapGenerator(newFloor);
            currentDungeon.map = generated.map; currentDungeon.enemies = generated.enemies; currentDungeon.items = generated.items;
            player.pos = { ...generated.startPos }; gameState = GAME_STATE.EXPLORING; this.saveGame();
        }
        renderAll();
    },

    enterDungeon: function(dungeonId) {
        const dungeonData = Dungeons[dungeonId]; if (!dungeonData || dungeonData.fixed) return;
        logMessage(`Entrée dans ${dungeonData.name}...`); currentDungeon.id = dungeonId; currentDungeon.floor = 1;
        const generated = dungeonData.mapGenerator(1); currentDungeon.map = generated.map; currentDungeon.enemies = generated.enemies; currentDungeon.items = generated.items;
        player.pos = { ...generated.startPos }; gameState = GAME_STATE.EXPLORING; this.saveGame(); renderAll();
    },

    enterHub: function() {
        currentDungeon.id = 'hub'; currentDungeon.floor = 0; const hubData = Dungeons['hub'];
        currentDungeon.map = hubData.map.map(row => row.split('')); currentDungeon.enemies = {}; currentDungeon.items = {};
        let foundStart = false;
        for(let y = 0; y < currentDungeon.map.length && !foundStart; y++) { for (let x = 0; x < currentDungeon.map[y].length && !foundStart; x++) { if (currentDungeon.map[y][x] === TILE.FLOOR || currentDungeon.map[y][x] === TILE.HUB_INN) { player.pos = { x: x, y: y }; foundStart = true; } } }
        if(!foundStart) player.pos = {x: 1, y: 1};
        gameState = GAME_STATE.HUB; logMessage(`Bienvenue au Village ! ${TILE.HUB_INN}: Auberge, ${TILE.HUB_DUNGEON_1}/${TILE.HUB_DUNGEON_2}: Donjons.`); renderAll();
    },

    enterShop: function() { if (gameState === GAME_STATE.HUB) { logMessage("Ouverture boutique..."); gameState = GAME_STATE.SHOP; renderAll(); } else { logMessage("Boutique accessible au Village."); } },
    exitShop: function() { if(gameState === GAME_STATE.SHOP) { logMessage("Fermeture boutique."); gameState = GAME_STATE.HUB; renderAll(); } },
    useInn: function() { const cost = 10 + (player.level * 2); if (player.gold >= cost) { player.gold -= cost; const stats = calculatePlayerStats(); player.hp = stats.maxHp; player.mp = stats.maxMp; logMessage(`Repos ${TILE.HUB_INN} (-${cost} ${TILE.GOLD}). PV/PM Max !`); this.saveGame(); renderAll(); } else { logMessage(`Pas assez d'or (${player.gold}/${cost} ${TILE.GOLD}).`); } },
    gainXP: function(amount) { if (amount <= 0) return; player.xp += amount; logMessage(`+${amount} XP.`); this.checkLevelUp(); renderStats(); },
    checkLevelUp: function() { const xpNeeded = LEVEL_XP_REQUIREMENT[player.level]; if (xpNeeded && player.xp >= xpNeeded && player.level < LEVEL_XP_REQUIREMENT.length -1 ) { player.level++; player.xp = player.xp; /* Keep overflow XP */ logMessage(`⭐ Niveau ${player.level} ! ⭐`); const hpGain=getRandomInt(3,6); const mpGain=getRandomInt(1,3); const attackGain=getRandomInt(1,2); const defenseGain=getRandomInt(0,1); player.levelBonus.maxHp += hpGain; player.levelBonus.maxMp += mpGain; player.levelBonus.attack += attackGain; player.levelBonus.defense += defenseGain; const stats=calculatePlayerStats(); player.hp = Math.min(player.hp + Math.ceil(stats.maxHp*0.25), stats.maxHp); player.mp = Math.min(player.mp + Math.ceil(stats.maxMp*0.25), stats.maxMp); logMessage(`Stats + | PV/PM restaurés.`); this.checkLevelUp(); this.saveGame(); renderAll(); } },
    toggleInventory: function() { if (gameState === GAME_STATE.INVENTORY) { this.closeInventory(); } else if (gameState === GAME_STATE.EXPLORING || gameState === GAME_STATE.HUB) { gameState = GAME_STATE.INVENTORY; renderAll(); } else { logMessage("Inventaire inaccessible."); } },
    closeInventory: function() { if (currentDungeon.id === 'hub') gameState = GAME_STATE.HUB; else gameState = GAME_STATE.EXPLORING; renderAll(); },
    toggleSkills: function() { if (gameState === GAME_STATE.SKILLS) { this.closeSkills(); } else if (gameState === GAME_STATE.EXPLORING || gameState === GAME_STATE.HUB) { gameState = GAME_STATE.SKILLS; renderAll(); } else { logMessage("Compétences inaccessibles."); } },
    closeSkills: function() { if (currentDungeon.id === 'hub') gameState = GAME_STATE.HUB; else gameState = GAME_STATE.EXPLORING; renderAll(); },
    gameOver: function() { logMessage("GAME OVER"); gameState = GAME_STATE.GAME_OVER; renderAll(); },
    hideGameOver: function() { gameOverScreen.classList.add('hidden'); },
    triggerDamageFlash: function() { playerStatsPanel.classList.add('flash-damage'); setTimeout(() => { playerStatsPanel.classList.remove('flash-damage'); }, 400); },

    saveGame: function() {
        try {
            const saveData = { player: player, currentDungeonId: currentDungeon.id, currentDungeonFloor: currentDungeon.floor, messageLog: messageLog.slice(0, 10) };
            localStorage.setItem('miniDungeonCrawlerSaveData_v3', JSON.stringify(saveData)); // Incremented version for structure change
            console.log("Partie sauvegardée.");
        } catch (e) { console.error("Save Error:", e); logMessage("Erreur sauvegarde."); }
    },

    loadGame: function() {
        try {
            const savedData = localStorage.getItem('miniDungeonCrawlerSaveData_v3'); // Load version 3
            if (savedData) {
                const loadedData = JSON.parse(savedData);
                if (!loadedData.player || !loadedData.currentDungeonId || typeof loadedData.currentDungeonFloor === 'undefined') { throw new Error("Données sauvegarde invalides."); }

                player = loadedData.player;
                currentDungeon.id = loadedData.currentDungeonId;
                currentDungeon.floor = loadedData.currentDungeonFloor;
                messageLog = loadedData.messageLog || [];

                 // Post-load structure verification (copied from initialize checks)
                 if (!player.levelBonus) player.levelBonus = { maxHp: 0, maxMp: 0, attack: 0, defense: 0 };
                 if (!player.skills) player.skills = [];
                 if (!player.inventory) player.inventory = {};
                 if (!player.accessoriesInventory) player.accessoriesInventory = [];
                 if (!player.equipment) player.equipment = { weapon: null, armor: null, ring1: null, ring2: null, amulet: null };
                 if (typeof player.equipment.ring1 === 'undefined') player.equipment.ring1 = null;
                 if (typeof player.equipment.ring2 === 'undefined') player.equipment.ring2 = null;
                 if (typeof player.equipment.amulet === 'undefined') player.equipment.amulet = null;


                const dungeonData = Dungeons[currentDungeon.id];
                if (!dungeonData) { console.error("Save Error: Unknown dungeon", currentDungeon.id); this.enterHub(); return true; }

                if (dungeonData.fixed) { // Hub
                    currentDungeon.map = Dungeons['hub'].map.map(row => row.split(''));
                    currentDungeon.enemies = {}; currentDungeon.items = {}; gameState = GAME_STATE.HUB;
                } else { // Dungeon floor
                    const generated = dungeonData.mapGenerator(currentDungeon.floor);
                    currentDungeon.map = generated.map; currentDungeon.enemies = generated.enemies; currentDungeon.items = generated.items;
                    // Validate loaded player position
                    if (!player.pos || player.pos.y >= currentDungeon.map.length || player.pos.x >= currentDungeon.map[0].length || currentDungeon.map[player.pos.y][player.pos.x] === TILE.WALL) {
                         console.warn("Loaded player position invalid, resetting to start."); player.pos = { ...generated.startPos };
                    }
                    gameState = GAME_STATE.EXPLORING;
                }

                const stats = calculatePlayerStats();
                player.hp = Math.min(player.hp, stats.maxHp); player.mp = Math.min(player.mp, stats.maxMp);
                combatState.active = false; this.hideGameOver();
                // renderAll() called in initialize after loadGame returns
                return true;
            } else { console.log("Aucune sauvegarde trouvée."); return false; }
        } catch (e) { console.error("Load Error:", e); logMessage("Erreur chargement. Réinitialisation."); localStorage.removeItem('miniDungeonCrawlerSaveData_v3'); return false; }
    },
    returnToHub: function() { if (gameState === GAME_STATE.EXPLORING) { logMessage("Retour au village..."); this.enterHub(); } else if (gameState === GAME_STATE.HUB) { logMessage("Déjà au village."); } else { logMessage("Impossible maintenant."); } },
    updateButtonStates: function() { if (returnHubBtn) { returnHubBtn.disabled = !(gameState === GAME_STATE.EXPLORING); } if (shopBtn) { shopBtn.disabled = !(gameState === GAME_STATE.HUB); } }
};


// --- CombatManager Object ---
const CombatManager = {
    startCombat: function(enemyType, positionKey) {
        const enemyTemplate = Enemies[enemyType]; if (!enemyTemplate) return;
        combatState = { active: true, enemy: { ...enemyTemplate }, enemyType: enemyType, enemyPosKey: positionKey, enemyCurrentHp: enemyTemplate.hp, playerTurn: true, playerTempDefense: 0 };
        gameState = GAME_STATE.COMBAT; logMessage(`Un ${enemyTemplate.name} (${enemyTemplate.tile}) apparaît !`); renderAll();
    },
    endCombat: function(victory) {
        const { name: enemyName, tile: enemyTile } = combatState.enemy;
        const { enemyPosKey, enemyType } = combatState;
        combatState = { active: false, enemy: null, enemyType: null, enemyPosKey: null, enemyCurrentHp: 0, playerTurn: true, playerTempDefense: 0 }; // Reset state

        if (victory) {
            logMessage(`Victoire sur ${enemyName} (${enemyTile}) !`);
            if (currentDungeon.enemies[enemyPosKey]) delete currentDungeon.enemies[enemyPosKey];
            const rewards = Enemies[enemyType];
            if (rewards) {
                if (rewards.gold > 0) { player.gold += rewards.gold; logMessage(`+${rewards.gold} ${TILE.GOLD}.`); }
                if (rewards.xp > 0) { GameManager.gainXP(rewards.xp); }

                // Chest Drop Logic
                if (rewards.canDropChest && Math.random() < CHEST_DROP_CHANCE) {
                    const dropPosKey = enemyPosKey; // Drop where the enemy died
                    if (currentDungeon.map[player.pos.y][player.pos.x] === TILE.FLOOR && !currentDungeon.items[dropPosKey] && !currentDungeon.enemies[dropPosKey]) {
                        currentDungeon.items[dropPosKey] = { type: 'chest' };
                        logMessage(`Le ${enemyName} laisse un ${TILE.CHEST} coffre !`);
                    } else { logMessage(`Le ${enemyName} a laissé un coffre, mais l'endroit était obstrué.`); }
                }
            }
            if(currentDungeon.id === 'hub') gameState = GAME_STATE.HUB; else gameState = GAME_STATE.EXPLORING;
            GameManager.saveGame();
        } else { logMessage(`Vous quittez le combat.`); }
        renderAll();
    },
    playerAction: function(actionType, selection = null) {
        if (!combatState.active || !combatState.playerTurn) return;
        const playerStats = calculatePlayerStats(); const enemy = combatState.enemy;
        let turnEnded = false; combatState.playerTempDefense = 0; // Reset defense unless defending again
        switch(actionType) {
            case 'attack':
                const playerDamage = Math.max(1, playerStats.attack - enemy.defense + getRandomInt(-1, 1));
                combatState.enemyCurrentHp -= playerDamage; logMessage(`⚔️ Attaque -> ${enemy.name} (-${playerDamage} PV).`);
                turnEnded = true; break;
            case 'skill':
                const skill = Skills[selection]; if (!skill || skill.type !== 'active') { logMessage("Compétence invalide."); return; }
                if (player.mp < skill.mpCost) { logMessage(`PM insuffisants (${player.mp}/${skill.mpCost}).`); this.showSkillSelection(); return; }
                player.mp -= skill.mpCost; logMessage(`✨ Utilise ${skill.name} (${skill.icon}) ! (-${skill.mpCost} PM)`); let skillMsg = "";
                switch(skill.effect) {
                    case 'damage': const skillDmg = Math.max(1, Math.floor((playerStats.attack * skill.multiplier)) - enemy.defense + getRandomInt(-1, 1)); combatState.enemyCurrentHp -= skillDmg; skillMsg = `Inflige ${skillDmg} dégâts.`; break;
                    case 'magic_damage': const magicDmg = Math.max(1, skill.baseDamage + getRandomInt(-2, 2)); combatState.enemyCurrentHp -= magicDmg; skillMsg = `Inflige ${magicDmg} dégâts magiques.`; break;
                    case 'heal': const healed = Math.min(skill.value, playerStats.maxHp - player.hp); player.hp += healed; skillMsg = `Récupère ${healed} PV.`; break;
                    case 'defense_boost': combatState.playerTempDefense = skill.value; skillMsg = `Défense +${skill.value} (1 tour).`; break;
                    default: skillMsg = "Effet non implémenté.";
                } logMessage(skillMsg); turnEnded = true; break;
            case 'item':
                const item = Items[selection]; if (!item || item.type !== 'potion' || !player.inventory[selection] || player.inventory[selection] <= 0) { logMessage("Objet invalide."); this.showItemSelection(); return; }
                player.inventory[selection]--; logMessage(`🎒 Utilise ${item.name} (${item.icon}).`); let itemMsg = "";
                if (item.effect === 'heal') { const healed = Math.min(item.value, playerStats.maxHp - player.hp); player.hp += healed; itemMsg = `Récupère ${healed} PV.`; }
                else if (item.effect === 'mana') { const restored = Math.min(item.value, playerStats.maxMp - player.mp); player.mp += restored; itemMsg = `Récupère ${restored} PM.`; }
                if (player.inventory[selection] <= 0) delete player.inventory[selection]; // Clean up empty stack
                logMessage(itemMsg); turnEnded = true; break;
            case 'defend': combatState.playerTempDefense = Math.ceil(playerStats.defense * 0.5) + 1; logMessage(`🛡️ Défense (Déf+${combatState.playerTempDefense} temporaire).`); turnEnded = true; break;
            case 'flee': if (enemy.tile === TILE.ENEMY_BOSS) { logMessage(`Impossible de fuir ${enemy.name} !`); turnEnded = true; } else if (Math.random() < 0.6) { logMessage("🏃 Fuite réussie !"); this.endCombat(false); return; } else { logMessage("🏃 Fuite échouée !"); turnEnded = true; } break;
            default: logMessage("Action inconnue."); return;
        }
        this.hideSkillSelection(); this.hideItemSelection();
        if (turnEnded) {
            if (combatState.enemyCurrentHp <= 0) { combatState.enemyCurrentHp = 0; renderAll(); setTimeout(() => this.endCombat(true), 500); }
            else { combatState.playerTurn = false; renderAll(); setTimeout(() => this.enemyTurn(), 800); }
        } else { renderAll(); }
    },
    enemyTurn: function() {
        if (!combatState.active || combatState.playerTurn || combatState.enemyCurrentHp <= 0) return;
        const enemy = combatState.enemy; const playerStats = calculatePlayerStats();
        const effectivePlayerDefense = playerStats.defense + combatState.playerTempDefense; let enemyActionMessage = ""; let usedSkill = false;
        if (enemy.skills && enemy.skills.includes('s_power_strike') && Math.random() < 0.3) { const skill = Skills['s_power_strike']; const enemyDmg = Math.max(1, Math.floor((enemy.attack * skill.multiplier)) - effectivePlayerDefense + getRandomInt(-1, 2)); player.hp -= enemyDmg; enemyActionMessage = `${enemy.name} ${skill.icon} -> Vous (-${enemyDmg} PV) !`; usedSkill = true; }
        if (!usedSkill) { const enemyDmg = Math.max(1, enemy.attack - effectivePlayerDefense + getRandomInt(-1, 1)); player.hp -= enemyDmg; enemyActionMessage = `${enemy.name} attaque -> Vous (-${enemyDmg} PV).`; }
        logMessage(enemyActionMessage); if(player.hp < playerStats.maxHp * 0.3) GameManager.triggerDamageFlash();
        if (player.hp <= 0) { player.hp = 0; renderStats(); setTimeout(() => GameManager.gameOver(), 500); }
        else { combatState.playerTurn = true; renderAll(); }
    },
    showSkillSelection: function() { const sdiv = document.getElementById('combat-skill-selection'); const idiv = document.getElementById('combat-item-selection'); if (!sdiv || !idiv) return; idiv.classList.add('hidden'); sdiv.classList.remove('hidden'); let html = `<h4>Compétence (PM:${player.mp}/${calculatePlayerStats().maxMp}💧)</h4>`; let usable = 0; const actives = player.skills.filter(id => Skills[id] && Skills[id].type === 'active'); if(actives.length === 0) html += '<p><i>Aucune compétence active.</i></p>'; else { actives.forEach(id => { const s = Skills[id]; const canUse = player.mp >= s.mpCost; html += `<button class="skill-button modal-button" ${!canUse ? 'disabled' : ''} onclick="CombatManager.selectSkill('${id}')">${s.icon||'?'} ${s.name} (${s.mpCost}💧)</button>`; if(canUse) usable++; }); if(usable === 0) html += '<p><i>PM insuffisants.</i></p>'; } html += '<button class="skill-button modal-button" onclick="CombatManager.hideSkillSelection()">Annuler</button>'; sdiv.innerHTML = html; },
    hideSkillSelection: function() { const div = document.getElementById('combat-skill-selection'); if (div) div.classList.add('hidden'); },
    selectSkill: function(skillId) { this.hideSkillSelection(); this.playerAction('skill', skillId); },
    showItemSelection: function() { const idiv = document.getElementById('combat-item-selection'); const sdiv = document.getElementById('combat-skill-selection'); if (!idiv || !sdiv) return; sdiv.classList.add('hidden'); idiv.classList.remove('hidden'); let html = '<h4>Objet</h4>'; let usable = 0; for(const itemId in player.inventory) { if (player.inventory[itemId] > 0 && Items[itemId] && Items[itemId].type === 'potion') { html += `<button class="item-button modal-button" onclick="CombatManager.selectItem('${itemId}')">${Items[itemId].icon||'?'} ${Items[itemId].name} (x${player.inventory[itemId]})</button>`; usable++; } } if (usable === 0) html += '<p><i>Aucune potion.</i></p>'; html += '<button class="item-button modal-button" onclick="CombatManager.hideItemSelection()">Annuler</button>'; idiv.innerHTML = html; },
    hideItemSelection: function() { const div = document.getElementById('combat-item-selection'); if (div) div.classList.add('hidden'); },
    selectItem: function(itemId) { this.hideItemSelection(); this.playerAction('item', itemId); }
};

// --- ShopManager Object ---
const ShopManager = {
    buyItem: function(itemId) { const item = Items[itemId]; if (!item) return; if (player.gold >= item.cost) { player.gold -= item.cost; InventoryManager.addInventoryItem(itemId, 1); logMessage(`Achat: ${item.icon} ${item.name} (-${item.cost} ${TILE.GOLD}).`); renderShop(); renderStats(); GameManager.saveGame(); } else { logMessage(`Or insuffisant (${player.gold}/${item.cost}).`); } },
    sellItem: function(itemId) { const item = Items[itemId]; if (!item || !player.inventory[itemId] || player.inventory[itemId] <= 0 || (item.type !== 'weapon' && item.type !== 'armor')) { logMessage("Invendable."); return; } if(player.equipment.weapon === itemId || player.equipment.armor === itemId) { logMessage(`Déséquipez ${item.name} avant vente.`); return; } const sellPrice = Math.floor(item.cost * 0.5); player.inventory[itemId]--; player.gold += sellPrice; logMessage(`Vente: ${item.icon} ${item.name} (+${sellPrice} ${TILE.GOLD}).`); if (player.inventory[itemId] <= 0) delete player.inventory[itemId]; renderShop(); renderStats(); GameManager.saveGame(); },
    learnSkill: function(skillId) { const skill = Skills[skillId]; if (!skill || player.skills.includes(skillId)) return; if (player.gold >= skill.cost) { player.gold -= skill.cost; player.skills.push(skillId); logMessage(`Appris: ${skill.icon} ${skill.name} (-${skill.cost} ${TILE.GOLD}).`); if (skill.type === 'passive') { logMessage(`Effet passif ${skill.name} actif !`); const oldStats = calculatePlayerStats(); const newStats = calculatePlayerStats(); player.hp = Math.min(player.hp + Math.max(0, newStats.maxHp - oldStats.maxHp), newStats.maxHp); player.mp = Math.min(player.mp + Math.max(0, newStats.maxMp - oldStats.maxMp), newStats.maxMp); } renderShop(); renderAll(); GameManager.saveGame(); } else { logMessage(`Or insuffisant (${player.gold}/${skill.cost}).`); } }
};

// --- InventoryManager Object ---
const InventoryManager = {
    addInventoryItem: function(itemId, quantity) { if (!Items[itemId] || quantity <= 0) return; if (!player.inventory[itemId]) player.inventory[itemId] = 0; player.inventory[itemId] += quantity; },
    equipItem: function(itemId) { const item = Items[itemId]; if (!item || !player.inventory[itemId] || player.inventory[itemId] <= 0 || (item.type !== 'weapon' && item.type !== 'armor')) { logMessage("Impossible d'équiper."); return; } let type = item.type; let currentEquipped = player.equipment[type]; if (currentEquipped) { this.addInventoryItem(currentEquipped, 1); logMessage(`Déséquipé: ${Items[currentEquipped].icon} ${Items[currentEquipped].name}.`); } player.equipment[type] = itemId; player.inventory[itemId]--; if (player.inventory[itemId] <= 0) delete player.inventory[itemId]; logMessage(`Équipé: ${item.icon} ${item.name}.`); renderAll(); GameManager.saveGame(); },
    unequipItem: function(type) { let currentEquipped = player.equipment[type]; if(currentEquipped) { const item = Items[currentEquipped]; this.addInventoryItem(currentEquipped, 1); player.equipment[type] = null; logMessage(`Déséquipé: ${item.icon} ${item.name}.`); renderAll(); GameManager.saveGame(); } else logMessage("Rien à déséquiper."); },
    usePotion: function(itemId) { if (gameState === GAME_STATE.SHOP || gameState === GAME_STATE.SKILLS || gameState === GAME_STATE.COMBAT) { logMessage("Ne peut pas utiliser maintenant."); return; } const item = Items[itemId]; if (!item || item.type !== 'potion' || !player.inventory[itemId] || player.inventory[itemId] <= 0) { logMessage("Impossible d'utiliser."); return; } player.inventory[itemId]--; const playerStats = calculatePlayerStats(); logMessage(`Utilisé: ${item.icon} ${item.name}.`); let msg = ""; if (item.effect === 'heal') { const healed = Math.min(item.value, playerStats.maxHp - player.hp); if (healed > 0) { player.hp += healed; msg = `+${healed} PV.`; } else msg = "PV déjà max."; } else if (item.effect === 'mana') { const restored = Math.min(item.value, playerStats.maxMp - player.mp); if (restored > 0) { player.mp += restored; msg = `+${restored} PM.`; } else msg = "PM déjà max."; } logMessage(msg); if (player.inventory[itemId] <= 0) delete player.inventory[itemId]; renderAll(); GameManager.saveGame(); },
    equipAccessory: function(accessoryId) { const accIndex = player.accessoriesInventory.findIndex(acc => acc && acc.id === accessoryId); if (accIndex === -1) { logMessage("Accessoire introuvable."); return; } const accessory = player.accessoriesInventory[accIndex]; let targetSlot = null; if (accessory.type === ACCESSORY_TYPE.RING) { if (!player.equipment.ring1) targetSlot = 'ring1'; else if (!player.equipment.ring2) targetSlot = 'ring2'; else { logMessage("Emplacements d'anneau pleins."); return; } } else if (accessory.type === ACCESSORY_TYPE.AMULET) { if (!player.equipment.amulet) targetSlot = 'amulet'; else { logMessage("Emplacement d'amulette plein."); return; } } else { logMessage("Type inconnu."); return; } const currentlyEquipped = player.equipment[targetSlot]; if(currentlyEquipped) { player.accessoriesInventory.push(currentlyEquipped); logMessage(`Déséquipement auto: ${formatAccessoryName(currentlyEquipped)}.`); } player.accessoriesInventory.splice(accIndex, 1); player.equipment[targetSlot] = accessory; const rarityInfo = RARITIES[accessory.rarity]; logMessage(`Équipé: <span style="color:${rarityInfo.color};">[${rarityInfo.name}] ${accessory.name}</span>.`); renderAll(); GameManager.saveGame(); },
    unequipAccessory: function(slot) { const accessory = player.equipment[slot]; if (!accessory) { logMessage(`Emplacement ${slot} vide.`); return; } player.accessoriesInventory.push(accessory); player.equipment[slot] = null; const rarityInfo = RARITIES[accessory.rarity]; logMessage(`Déséquipé: <span style="color:${rarityInfo.color};">[${rarityInfo.name}] ${accessory.name}</span>.`); renderAll(); GameManager.saveGame(); }
};

// --- Initialize Game ---
GameManager.initialize();
