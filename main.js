// main.js
/**
 * Script principal du jeu d'exploration de donjon.
 * Gère l'état global du jeu, la boucle de jeu (simplifiée),
 * l'interaction entre les modules et les contrôles du joueur.
 */
console.log("main.js: Script parsing started."); // LOG 1

// --- État Global du Jeu ---
let player = {
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    xp: 0,
    xpToNextLevel: 100,
    gold: 0,
    x: 0, // Position X actuelle
    y: 0  // Position Y actuelle
};
console.log("main.js: Global player object declared.", player); // LOG 2

let currentFloor = 1;
let dungeonData = null;
let gameActive = true;

// --- Constantes et Configuration ---
const MAP_WIDTH = 50;
const MAP_HEIGHT = 30;
const ENEMY_ENCOUNTER_CHANCE = 0.15;

// --- Références aux Éléments du DOM ---
// (Déclarées ici pour être accessibles globalement dans ce script)
const mapDisplay = document.getElementById('map-display');
const dungeonFloorDisplay = document.getElementById('dungeon-floor');
const attackButton = document.getElementById('attack-button');
const moveUpButton = document.getElementById('move-up-button');
const moveDownButton = document.getElementById('move-down-button');
const moveLeftButton = document.getElementById('move-left-button');
const moveRightButton = document.getElementById('move-right-button');
const descendStairsButton = document.getElementById('descend-stairs-button');
const combatDisplay = document.getElementById('combat-display');
const combatInventoryButton = document.getElementById('combat-inventory-button');
const combatInventoryList = document.getElementById('combat-inventory-list');
console.log("main.js: DOM element references obtained."); // LOG 3


// --- Fonctions Utilitaires ---
function log(message) {
    if (typeof CombatManager !== 'undefined' && CombatManager.logMessage) {
        CombatManager.logMessage(message);
    } else {
        console.log("GameLog:", message); // Fallback log
    }
}

function updateUI() {
    console.log("main.js: updateUI() called."); // LOG 7 (si appelé)
    if (!gameActive) return;
    if (typeof CombatManager !== 'undefined' && CombatManager.updatePlayerStatsDisplay) {
        CombatManager.updatePlayerStatsDisplay();
    } else {
         console.warn("updateUI: CombatManager.updatePlayerStatsDisplay not available!");
    }
    if(dungeonFloorDisplay) {
        dungeonFloorDisplay.textContent = currentFloor;
    } else {
         console.warn("updateUI: dungeonFloorDisplay element not found!");
    }
    displayDungeon();
    checkStairs();
     console.log("main.js: updateUI() finished."); // LOG 9 (si displayDungeon termine)
}

function displayDungeon() {
    console.log("main.js: displayDungeon() called."); // LOG 8 (si appelé)
    if (!mapDisplay) {
         console.error("displayDungeon: CRITICAL - mapDisplay element not found!");
         return;
    }
    if (!dungeonData || !dungeonData.grid) {
        mapDisplay.textContent = "Erreur : Données du donjon non disponibles.";
        console.error("displayDungeon: Missing dungeon data!");
        return;
    }

    let output = "";
    for (let y = 0; y < dungeonData.grid.length; y++) {
        let row = "";
        if (!dungeonData.grid[y]) {
             console.error(`displayDungeon: Missing grid row at y=${y}`);
             row = "!!! ERROR !!!"; // Indique une erreur dans la ligne
        } else {
             for (let x = 0; x < dungeonData.grid[y].length; x++) {
                 if (x === player.x && y === player.y) {
                     row += '@';
                 } else {
                     row += dungeonData.grid[y][x] !== undefined ? dungeonData.grid[y][x] : '?'; // Ajout sécurité undefined
                 }
             }
        }
        output += row + '\n';
    }
    mapDisplay.textContent = output;
    console.log("main.js: Map displayed in #map-display."); // LOG 8b
}

// --- Logique de Jeu ---
function generateNewFloor() {
    log(`Génération de l'étage ${currentFloor}...`);
    console.log("main.js: generateNewFloor() called. Checking modules..."); // LOG 6

    // Vérifier si les modules clés sont chargés
    if (typeof DungeonGenerator === 'undefined') {
         console.error("CRITICAL ERROR: DungeonGenerator module not found!");
         alert("Erreur critique : Le module DungeonGenerator n'a pas pu être chargé.");
         gameActive = false;
         return;
    }
     if (typeof CombatManager === 'undefined') {
         console.error("CRITICAL ERROR: CombatManager module not found!");
         // Moins critique pour juste afficher la map, mais le jeu sera cassé.
     }
    console.log("main.js: Calling DungeonGenerator.generate...");
    dungeonData = DungeonGenerator.generate(MAP_WIDTH, MAP_HEIGHT, currentFloor);
    console.log("main.js: DungeonGenerator.generate returned:", dungeonData);

    if (!dungeonData) {
        log("Erreur critique lors de la génération du donjon !");
        console.error("Dungeon generation failed! Halting initialization.");
        gameActive = false;
        // Afficher un message d'erreur dans la map elle-même
        if (mapDisplay) mapDisplay.textContent = "ERREUR DE GÉNÉRATION DU DONJON.\nVérifiez la console (F12).";
        return;
    }

    // Vérifier si les positions existent
    if (!dungeonData.playerStartPos || dungeonData.playerStartPos.x === undefined || dungeonData.playerStartPos.y === undefined ) {
        console.error("Dungeon data is missing valid playerStartPos!", dungeonData);
        log("Erreur critique: Position de départ invalide.");
        gameActive = false;
        if (mapDisplay) mapDisplay.textContent = "ERREUR : Position de départ invalide.";
        return;
    }

    player.x = dungeonData.playerStartPos.x;
    player.y = dungeonData.playerStartPos.y;
    console.log(`main.js: Player position set to (${player.x}, ${player.y})`);

    log(`Vous êtes arrivé à l'étage ${currentFloor}. Trouvez l'escalier '>' pour descendre.`);
    updateUI(); // Essayer de mettre à jour l'affichage complet
}

function movePlayer(dx, dy) {
    // ... (code inchangé) ...
}
function triggerRandomEncounter() {
    // ... (code inchangé) ...
}
function checkStairs() {
     if (!descendStairsButton) return; // Sécurité
    if (dungeonData && dungeonData.stairsDownPos && player.x === dungeonData.stairsDownPos.x && player.y === dungeonData.stairsDownPos.y) {
        descendStairsButton.classList.remove('hidden');
    } else {
        descendStairsButton.classList.add('hidden');
    }
}
function descendFloor() {
    // ... (code inchangé) ...
}
function triggerBossEncounter() {
    // ... (code inchangé) ...
}
function showCombatInventory() {
    // ... (code inchangé) ...
}
function hideCombatInventory() {
    // ... (code inchangé) ...
}
function useItemInCombat(itemId) {
     // ... (code inchangé) ...
}
function gameOver() {
    // ... (code inchangé) ...
}

// --- Initialisation du Jeu ---
function initializeGame() {
    console.log("main.js: initializeGame() called."); // LOG 5
    log("Initialisation du jeu...");

    // Assignation globale (alternative: injection de dépendances)
    // S'assurer que 'player' n'écrase pas une autre variable globale si utilisée ailleurs
    if (window.player) console.warn("Overwriting existing window.player!");
    window.player = player; // Rendre player accessible aux modules qui en dépendent

    // Générer le premier étage
    generateNewFloor();

    // --- Ajout des Écouteurs d'Événements ---
    // (Seulement si le jeu est toujours actif après la génération)
    if (gameActive) {
        console.log("main.js: Game is active, adding event listeners.");
        if(attackButton) {
            attackButton.addEventListener('click', () => {
                if (!gameActive) return;
                if (CombatManager.isCombatActive()) {
                    CombatManager.playerAttack();
                } else if (BossCombatManager.isBossCombatActive()) {
                    BossCombatManager.playerAttackBoss();
                }
            });
        } else console.error("Attack button not found!");

        if(moveUpButton) moveUpButton.addEventListener('click', () => movePlayer(0, -1)); else console.error("Move Up button not found!");
        if(moveDownButton) moveDownButton.addEventListener('click', () => movePlayer(0, 1)); else console.error("Move Down button not found!");
        if(moveLeftButton) moveLeftButton.addEventListener('click', () => movePlayer(-1, 0)); else console.error("Move Left button not found!");
        if(moveRightButton) moveRightButton.addEventListener('click', () => movePlayer(1, 0)); else console.error("Move Right button not found!");
        if(descendStairsButton) descendStairsButton.addEventListener('click', descendFloor); else console.error("Descend button not found!");

        if(combatInventoryButton) {
             combatInventoryButton.addEventListener('click', () => {
                 if (!combatInventoryList) return;
                 if (combatInventoryList.classList.contains('hidden')) {
                     showCombatInventory();
                 } else {
                     hideCombatInventory();
                 }
             });
        } else console.error("Combat inventory button not found!");

        log("Jeu prêt. Utilisez les boutons pour vous déplacer.");
    } else {
         console.error("main.js: Game initialization failed, event listeners not added.");
         log("Échec de l'initialisation du jeu. Vérifiez la console.");
    }
}

// --- Lancement du Jeu ---
// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', initializeGame);
console.log("main.js: DOMContentLoaded listener added."); // LOG 4
