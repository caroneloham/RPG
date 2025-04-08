// main.js
/**
 * Script principal du jeu d'exploration de donjon.
 * Gère l'état global du jeu, la boucle de jeu (simplifiée),
 * l'interaction entre les modules et les contrôles du joueur.
 */

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

let currentFloor = 1;
let dungeonData = null; // Contiendra { grid, rooms, playerStartPos, stairsDownPos }
let gameActive = true; // Indique si le jeu est en cours (non Game Over)

// --- Constantes et Configuration ---
const MAP_WIDTH = 50; // Largeur de la grille du donjon
const MAP_HEIGHT = 30; // Hauteur de la grille du donjon
const ENEMY_ENCOUNTER_CHANCE = 0.15; // 15% de chance de rencontre par pas sur sol

// --- Références aux Éléments du DOM ---
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

// --- Fonctions Utilitaires ---

/**
 * Ajoute un message au log (utilise la fonction de CombatManager).
 * @param {string} message
 */
function log(message) {
    // Assure que CombatManager et sa fonction sont disponibles
    if (typeof CombatManager !== 'undefined' && CombatManager.logMessage) {
        CombatManager.logMessage(message);
    } else {
        console.log("LOG:", message); // Fallback console
    }
}

/**
 * Met à jour l'affichage des statistiques du joueur (utilise CombatManager).
 */
function updateUI() {
    if (!gameActive) return;
     // Met à jour les stats du joueur
     if (typeof CombatManager !== 'undefined' && CombatManager.updatePlayerStatsDisplay) {
        CombatManager.updatePlayerStatsDisplay();
     }
    // Met à jour l'étage actuel
    dungeonFloorDisplay.textContent = currentFloor;
    // Affiche le donjon
    displayDungeon();
    // Gère la visibilité du bouton "Descendre"
     checkStairs();
}


/**
 * Affiche la grille du donjon dans le DOM, en plaçant le joueur.
 */
function displayDungeon() {
    if (!dungeonData || !dungeonData.grid) {
        mapDisplay.textContent = "Erreur : Données du donjon non disponibles.";
        return;
    }

    let output = "";
    for (let y = 0; y < dungeonData.grid.length; y++) {
        let row = "";
        for (let x = 0; x < dungeonData.grid[y].length; x++) {
            if (x === player.x && y === player.y) {
                row += '@'; // Symbole du joueur
            } else {
                // Afficher les ennemis potentiels ? Pour l'instant, non.
                row += dungeonData.grid[y][x];
            }
        }
        output += row + '\n'; // Ajoute la ligne et un retour chariot
    }
    mapDisplay.textContent = output;
}

// --- Logique de Jeu ---

/**
 * Génère un nouvel étage de donjon.
 */
function generateNewFloor() {
    log(`Génération de l'étage ${currentFloor}...`);
    // Utilise le module DungeonGenerator
    dungeonData = DungeonGenerator.generate(MAP_WIDTH, MAP_HEIGHT, currentFloor);

    if (!dungeonData) {
        log("Erreur critique lors de la génération du donjon !");
        gameActive = false;
        // Gérer l'erreur plus proprement ?
        return;
    }

    // Placer le joueur au point de départ
    player.x = dungeonData.playerStartPos.x;
    player.y = dungeonData.playerStartPos.y;

    log(`Vous êtes arrivé à l'étage ${currentFloor}. Trouvez l'escalier '>' pour descendre.`);
    updateUI(); // Met à jour l'affichage complet
}

/**
 * Gère le déplacement du joueur.
 * @param {number} dx - Changement en X (-1, 0, 1).
 * @param {number} dy - Changement en Y (-1, 0, 1).
 */
function movePlayer(dx, dy) {
    if (!gameActive || CombatManager.isCombatActive() || BossCombatManager.isBossCombatActive() || ShopManager.isShopOpen() || InventoryManager.isInventoryOpen()) {
        log("Action impossible pour le moment.");
        return; // Ne pas bouger si une autre action est en cours
    }

    const nextX = player.x + dx;
    const nextY = player.y + dy;

    // Vérifier les limites de la carte
    if (nextX < 0 || nextX >= MAP_WIDTH || nextY < 0 || nextY >= MAP_HEIGHT) {
        log("Vous ne pouvez pas aller par là (limite de la carte).");
        return;
    }

    // Vérifier la case cible dans la grille
    const targetTile = dungeonData.grid[nextY][nextX];

    // Vérifier si la case est franchissable (sol, porte, escaliers)
    const walkableTiles = [DungeonGenerator.TILE_TYPES.FLOOR, DungeonGenerator.TILE_TYPES.DOOR, DungeonGenerator.TILE_TYPES.STAIRS_DOWN, DungeonGenerator.TILE_TYPES.STAIRS_UP];
    if (walkableTiles.includes(targetTile)) {
        // Déplacer le joueur
        player.x = nextX;
        player.y = nextY;
        log(`Déplacement vers (${player.x}, ${player.y}).`);

        // Mettre à jour l'affichage
        displayDungeon(); // Rafraîchit juste la carte pour le mouvement
        checkStairs(); // Vérifie si on est sur un escalier

        // Déclencher une rencontre ?
        if (targetTile === DungeonGenerator.TILE_TYPES.FLOOR) {
            if (Math.random() < ENEMY_ENCOUNTER_CHANCE) {
                triggerRandomEncounter();
            }
        }

    } else if (targetTile === DungeonGenerator.TILE_TYPES.WALL) {
        log("Vous vous cognez contre un mur.");
    } else {
        log("Vous ne pouvez pas aller par là."); // Case vide ou autre non gérée
    }
}

/**
* Déclenche une rencontre aléatoire avec un ennemi standard.
*/
function triggerRandomEncounter() {
    log("Vous rencontrez une créature !");
    // Utilise le module EnemyManager pour obtenir un ennemi
    const enemy = EnemyManager.generateRandomEnemy(currentFloor);
    if (enemy) {
        // Utilise CombatManager pour démarrer le combat
        CombatManager.startCombat(enemy, (playerWon) => {
            // Callback après le combat
            if (!playerWon) {
                gameOver(); // Gérer le game over si le joueur perd
            } else {
                log("Vous avez remporté la victoire !");
                // Le butin est déjà géré dans CombatManager
                 updateUI(); // Mettre à jour l'UI (or, xp, etc.)
            }
        });
        // Afficher l'UI de combat (déjà fait dans startCombat)
        combatDisplay.classList.remove('hidden');
    } else {
        log("La créature s'est enfuie avant que vous ne puissiez réagir.");
    }
}

/**
 * Vérifie si le joueur est sur un escalier descendant et affiche/cache le bouton.
 */
function checkStairs() {
    if (dungeonData && player.x === dungeonData.stairsDownPos.x && player.y === dungeonData.stairsDownPos.y) {
        descendStairsButton.classList.remove('hidden');
        log("Vous avez trouvé l'escalier descendant !");
    } else {
        descendStairsButton.classList.add('hidden');
    }
}

/**
 * Logique pour descendre à l'étage suivant.
 */
function descendFloor() {
     if (!gameActive || CombatManager.isCombatActive() || BossCombatManager.isBossCombatActive()) {
         log("Vous ne pouvez pas descendre maintenant.");
         return;
     }
     if (!dungeonData || player.x !== dungeonData.stairsDownPos.x || player.y !== dungeonData.stairsDownPos.y) {
         log("Vous n'êtes pas sur l'escalier descendant.");
         return;
     }

    currentFloor++;
    log(`Vous descendez à l'étage ${currentFloor}...`);

    // Vérifier si c'est un étage de boss
    if (currentFloor % 5 === 0) {
        log("Une présence menaçante se fait sentir...");
        triggerBossEncounter();
    } else {
        // Générer l'étage normal suivant
        generateNewFloor();
    }
}

/**
 * Déclenche la rencontre avec le boss de l'étage.
 */
function triggerBossEncounter() {
     // Utilise BossCombatManager
     const bossStarted = BossCombatManager.startBossCombat(currentFloor, (playerWon) => {
         if (!playerWon) {
             gameOver();
         } else {
             log(`Le boss de l'étage ${currentFloor} est vaincu ! Le chemin est libre.`);
             // Après avoir vaincu le boss, générer l'étage suivant "normalement"
             // Ou peut-être l'étage suivant est une "salle de récompense" ?
             // Pour l'instant, on génère juste l'étage d'après comme si on descendait.
             generateNewFloor();
         }
     });
     if (bossStarted) {
         combatDisplay.classList.remove('hidden'); // Afficher l'UI de combat (titre mis à jour par BossCombatManager)
     } else {
         log("Le combat de boss n'a pas pu démarrer (un autre combat en cours?). Tentative de génération normale.");
         generateNewFloor(); // Fallback: génère l'étage normalement
     }
}

/**
 * Gère l'affichage de l'inventaire pendant un combat.
 */
function showCombatInventory() {
    combatInventoryList.innerHTML = ''; // Vider
    combatInventoryList.classList.remove('hidden');
    combatInventoryButton.textContent = "Annuler"; // Change le bouton

    const usableItems = InventoryManager.getInventory().filter(item =>
        item.effect && ['heal'].includes(item.effect.action) // Pour l'instant, que les potions de soin
    );

    if (usableItems.length === 0) {
        combatInventoryList.innerHTML = '<li>Aucun objet utilisable en combat.</li>';
        return;
    }

    usableItems.forEach(item => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.textContent = `${item.name} (x${item.quantity})`;
        btn.dataset.itemId = item.id;
        btn.onclick = () => useItemInCombat(item.id); // Utiliser une fonction dédiée
        li.appendChild(btn);
        combatInventoryList.appendChild(li);
    });
}

/**
 * Cache l'inventaire en combat.
 */
function hideCombatInventory() {
    combatInventoryList.classList.add('hidden');
    combatInventoryButton.textContent = "Utiliser Objet";
}

/**
 * Utilise un objet pendant le combat.
 * @param {string} itemId
 */
function useItemInCombat(itemId) {
     if (!CombatManager.isCombatActive() && !BossCombatManager.isBossCombatActive()) return;

     const inventory = InventoryManager.getInventory();
     const item = inventory.find(i => i.id === itemId);

     if (item && item.quantity > 0) {
         log(`Tentative d'utilisation de ${item.name}...`);
         // Appliquer l'effet via InventoryManager
         if (InventoryManager.applyItemEffect(item)) {
              InventoryManager.removeItem(itemId, 1); // Consommer l'objet
              hideCombatInventory(); // Fermer la liste d'objets
              // L'ennemi attaque après l'utilisation de l'objet (tour du joueur utilisé)
              if (CombatManager.isCombatActive()) {
                  CombatManager.enemyAttack(); // Fonction doit être exposée dans combat.js
              } else if (BossCombatManager.isBossCombatActive()) {
                  BossCombatManager.bossAttack(); // Fonction doit être exposée dans bossCombat.js
              }
         } else {
             // Effet non appliqué (ex: HP max), ne pas consommer, ne pas passer le tour ?
             log("Impossible d'utiliser cet objet maintenant.");
             hideCombatInventory();
         }
     }
}


/**
 * Gère la fin de partie.
 */
function gameOver() {
    log("===== GAME OVER =====");
    gameActive = false;
    // Désactiver les boutons de contrôle
    moveUpButton.disabled = true;
    moveDownButton.disabled = true;
    moveLeftButton.disabled = true;
    moveRightButton.disabled = true;
    descendStairsButton.disabled = true;
    attackButton.disabled = true;
    // Afficher un message final
    alert("Vous avez été vaincu... Rechargez la page pour une nouvelle aventure !");
}


// --- Initialisation du Jeu ---
function initializeGame() {
    log("Initialisation du jeu...");
    // Assigne l'objet player global pour que les modules y accèdent
    // (Ce n'est pas idéal, l'injection de dépendances serait mieux, mais simple pour l'exemple)
    window.player = player; // Rendre player accessible globalement

    // Générer le premier étage
    generateNewFloor();

    // --- Ajout des Écouteurs d'Événements ---

    // Bouton Attaquer (centralisé)
    attackButton.addEventListener('click', () => {
        if (!gameActive) return;
        if (CombatManager.isCombatActive()) {
            CombatManager.playerAttack();
        } else if (BossCombatManager.isBossCombatActive()) {
            BossCombatManager.playerAttackBoss();
        }
    });

     // Boutons de déplacement
     moveUpButton.addEventListener('click', () => movePlayer(0, -1));
     moveDownButton.addEventListener('click', () => movePlayer(0, 1));
     moveLeftButton.addEventListener('click', () => movePlayer(-1, 0));
     moveRightButton.addEventListener('click', () => movePlayer(1, 0));

     // Bouton Descendre
     descendStairsButton.addEventListener('click', descendFloor);

    // Bouton Inventaire en combat
     combatInventoryButton.addEventListener('click', () => {
         if (combatInventoryList.classList.contains('hidden')) {
             showCombatInventory();
         } else {
             hideCombatInventory();
         }
     });

     // Les listeners pour ouvrir/fermer Boutique et Inventaire sont déjà dans leurs modules respectifs.

    log("Jeu prêt. Utilisez les boutons pour vous déplacer.");
}

// --- Lancement du Jeu ---
// Attendre que le DOM soit chargé et que les autres scripts aient potentiellement initialisé leurs modules.
document.addEventListener('DOMContentLoaded', initializeGame);