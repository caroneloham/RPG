// combat.js
/**
 * Module pour la gestion des combats standards contre les ennemis.
 * Gère le déroulement du combat tour par tour, les calculs de dégâts,
 * la gestion des HP, l'XP et la montée de niveau du joueur.
 */

// Assumons l'existence d'un objet global ou d'un module pour le joueur
// Pour cet exemple, nous allons le définir ici, mais il devrait idéalement
// être dans son propre module ou dans un état global du jeu.
let player = {
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    xp: 0,
    xpToNextLevel: 100,
    gold: 0,
    // Potentiellement d'autres stats ou inventaire
    // inventory: InventoryManager.getInventory() // Exemple d'intégration future
};

// Récupération des éléments du DOM pour l'affichage du combat et du log
const combatDisplay = document.getElementById('combat-display');
const enemyNameDisplay = document.getElementById('enemy-name');
const enemyHpDisplay = document.getElementById('enemy-hp');
const enemyMaxHpDisplay = document.getElementById('enemy-max-hp');
const attackButton = document.getElementById('attack-button');
const gameLogList = document.getElementById('log-list');

// Récupération des éléments du DOM pour les stats du joueur (pour mise à jour)
const playerLevelDisplay = document.getElementById('player-level');
const playerHpDisplay = document.getElementById('player-hp');
const playerMaxHpDisplay = document.getElementById('player-max-hp');
const playerAttackDisplay = document.getElementById('player-attack');
const playerDefenseDisplay = document.getElementById('player-defense');
const playerXpDisplay = document.getElementById('player-xp');
const playerXpNextDisplay = document.getElementById('player-xp-next');
const playerGoldDisplay = document.getElementById('player-gold');


const CombatManager = (() => {

    let currentEnemy = null; // L'ennemi actuellement combattu
    let isCombatActive = false; // Indicateur si un combat est en cours
    let onCombatEndCallback = null; // Callback à appeler à la fin du combat

    /**
     * Ajoute un message au log du jeu.
     * @param {string} message - Le message à afficher.
     */
    function logMessage(message) {
        const li = document.createElement('li');
        li.textContent = message;
        gameLogList.appendChild(li);
        // Faire défiler le log vers le bas
        gameLogList.scrollTop = gameLogList.scrollHeight;
    }

     /**
     * Met à jour l'affichage des statistiques du joueur dans l'interface.
     */
    function updatePlayerStatsDisplay() {
        if (!player) return; // Sécurité
        playerLevelDisplay.textContent = player.level;
        playerHpDisplay.textContent = player.hp;
        playerMaxHpDisplay.textContent = player.maxHp;
        playerAttackDisplay.textContent = player.attack;
        playerDefenseDisplay.textContent = player.defense;
        playerXpDisplay.textContent = player.xp;
        playerXpNextDisplay.textContent = player.xpToNextLevel;
        playerGoldDisplay.textContent = player.gold;
        // Mettre à jour l'étage aussi si nécessaire (géré ailleurs potentiellement)
        // dungeonFloorDisplay.textContent = currentFloor;
    }
     // Appel initial pour afficher les stats au chargement
     updatePlayerStatsDisplay();

    /**
     * Met à jour l'affichage des informations de l'ennemi pendant le combat.
     */
    function updateEnemyDisplay() {
        if (!currentEnemy || !isCombatActive) return;
        enemyNameDisplay.textContent = currentEnemy.name;
        enemyHpDisplay.textContent = currentEnemy.hp;
        enemyMaxHpDisplay.textContent = currentEnemy.maxHp;
    }

    /**
     * Calcule les dégâts infligés lors d'une attaque.
     * Formule simple : Attaque - Défense (avec un minimum de 1 dégât).
     * @param {number} attackerAttack - Statistique d'attaque de l'attaquant.
     * @param {number} defenderDefense - Statistique de défense du défenseur.
     * @returns {number} - Les dégâts infligés.
     */
    function calculateDamage(attackerAttack, defenderDefense) {
        const damage = Math.max(1, attackerAttack - defenderDefense);
        // On pourrait ajouter une variation aléatoire ici (ex: +/- 10%)
        const variation = Math.random() * 0.2 - 0.1; // entre -10% et +10%
        return Math.round(damage * (1 + variation));
    }

     /**
     * Gère la montée de niveau du joueur.
     */
    function levelUp() {
        player.level++;
        player.xp -= player.xpToNextLevel; // Garde l'excédent d'XP

        // Augmentation des statistiques (exemple simple)
        player.maxHp += 10;
        player.attack += 2;
        player.defense += 1;
        player.hp = player.maxHp; // Restaure complètement les HP à la montée de niveau

        // Calcul de l'XP nécessaire pour le prochain niveau (exemple : augmente de 50%)
        player.xpToNextLevel = Math.round(player.xpToNextLevel * 1.5);

        logMessage(`Niveau supérieur ! Vous êtes maintenant niveau ${player.level}.`);
        updatePlayerStatsDisplay(); // Mettre à jour l'affichage

        // Vérifier si on peut encore monter de niveau avec l'XP restante
        if (player.xp >= player.xpToNextLevel) {
            levelUp(); // Appel récursif si plusieurs niveaux d'un coup
        }
    }


    /**
     * Gère le gain d'XP et la potentielle montée de niveau.
     * @param {number} xpGained - La quantité d'XP gagnée.
     */
    function gainExperience(xpGained) {
        if (!player || xpGained <= 0) return;

        player.xp += xpGained;
        logMessage(`Vous gagnez ${xpGained} points d'expérience.`);

        // Vérifier la montée de niveau
        if (player.xp >= player.xpToNextLevel) {
            levelUp();
        } else {
             updatePlayerStatsDisplay(); // Met juste à jour l'XP si pas de level up
        }
    }


    /**
     * Gère l'action d'attaque du joueur.
     */
    function playerAttack() {
        if (!isCombatActive || !currentEnemy || player.hp <= 0) return;

        // 1. Calculer les dégâts infligés par le joueur
        const damageDealt = calculateDamage(player.attack, currentEnemy.defense);
        currentEnemy.hp = Math.max(0, currentEnemy.hp - damageDealt);
        logMessage(`Vous attaquez ${currentEnemy.name} et infligez ${damageDealt} points de dégâts.`);
        updateEnemyDisplay();

        // 2. Vérifier si l'ennemi est vaincu
        if (currentEnemy.hp <= 0) {
            logMessage(`Vous avez vaincu ${currentEnemy.name} !`);
            endCombat(true); // Le joueur a gagné
            return; // Le combat est terminé, l'ennemi n'attaque pas
        }

        // 3. Si l'ennemi survit, il attaque à son tour
        enemyAttack();
    }

    /**
     * Gère l'action d'attaque de l'ennemi.
     */
    function enemyAttack() {
        if (!isCombatActive || !currentEnemy || currentEnemy.hp <= 0 || player.hp <= 0) return;

        // 1. Calculer les dégâts infligés par l'ennemi
        const damageTaken = calculateDamage(currentEnemy.attack, player.defense);
        player.hp = Math.max(0, player.hp - damageTaken);
        logMessage(`${currentEnemy.name} vous attaque et inflige ${damageTaken} points de dégâts.`);
        updatePlayerStatsDisplay(); // Mettre à jour l'affichage des HP du joueur

        // 2. Vérifier si le joueur est vaincu
        if (player.hp <= 0) {
            logMessage(`Vous avez été vaincu par ${currentEnemy.name}...`);
            endCombat(false); // Le joueur a perdu
        }
        // Sinon, le tour du joueur recommence (implicitement, attend la prochaine action)
    }

    /**
     * Initialise et démarre un combat contre un ennemi spécifique.
     * @param {object} enemyData - L'objet ennemi généré par EnemyManager.
     * @param {function} onEndCallback - Fonction à appeler lorsque le combat se termine.
     */
    function startCombat(enemyData, onEndCallback) {
        if (!enemyData || isCombatActive) {
            console.error("Impossible de démarrer le combat : données ennemies manquantes ou combat déjà en cours.");
            return;
        }

        currentEnemy = { ...enemyData }; // Crée une copie pour ne pas modifier l'original
        isCombatActive = true;
        onCombatEndCallback = onEndCallback; // Stocker le callback

        // Afficher l'interface de combat
        combatDisplay.style.display = 'block'; // Ou utiliser .remove('hidden')
        updateEnemyDisplay();
        updatePlayerStatsDisplay(); // Assure que les stats du joueur sont à jour au début

        logMessage(`Un ${currentEnemy.name} apparaît !`);

        // Activer les boutons d'action du joueur (pour l'instant juste Attaquer)
        attackButton.disabled = false;
        // Ajouter des listeners ici si ce n'est pas déjà fait globalement
    }

    /**
     * Termine le combat actuel.
     * @param {boolean} playerWon - True si le joueur a gagné, false sinon.
     */
    function endCombat(playerWon) {
        if (!isCombatActive) return;

        isCombatActive = false;
        attackButton.disabled = true; // Désactiver les actions

        if (playerWon) {
            // Gain d'XP et d'or
            gainExperience(currentEnemy.xpValue);
            player.gold += currentEnemy.goldValue;
            logMessage(`Vous recevez ${currentEnemy.goldValue} pièces d'or.`);
            updatePlayerStatsDisplay(); // Mettre à jour l'or et potentiellement l'XP/niveau
        } else {
            // Gérer la défaite du joueur (Game Over, retour au début, etc.)
            logMessage("Game Over !");
            // Pour l'instant, on pourrait juste bloquer le jeu ou recharger.
             alert("Vous avez été vaincu ! Rechargez la page pour réessayer."); // Solution temporaire
             // Idéalement, implémenter une vraie logique de Game Over.
        }

        // Cacher l'interface de combat après un court délai (optionnel)
        setTimeout(() => {
            combatDisplay.style.display = 'none';
        }, 1500); // Attend 1.5s avant de cacher

        // Appeler le callback de fin de combat s'il existe
        if (onCombatEndCallback) {
            onCombatEndCallback(playerWon);
            onCombatEndCallback = null; // Réinitialiser pour le prochain combat
        }

        currentEnemy = null; // Nettoyer l'ennemi actuel
    }

    // --- Gestionnaire d'événements ---
    // Ajouter un listener unique au bouton d'attaque
    attackButton.addEventListener('click', () => {
        if (isCombatActive) {
            playerAttack();
        }
    });

    // --- Interface Publique du Module ---
    return {
        startCombat: startCombat,
        isCombatActive: () => isCombatActive, // Permet de savoir si un combat est en cours
        getPlayerStats: () => ({ ...player }), // Retourne une copie des stats actuelles du joueur
         // Exposer la fonction de mise à jour pour l'extérieur si nécessaire
         updatePlayerStatsDisplay: updatePlayerStatsDisplay,
         logMessage: logMessage, // Permettre à d'autres modules de logger
         // Permettre de modifier le joueur de l'extérieur (par ex: équipement, potions)
         setPlayerHp: (newHp) => {
             if(player) player.hp = Math.max(0, Math.min(player.maxHp, newHp));
             updatePlayerStatsDisplay();
         },
         setPlayerStats: (newStats) => {
             if (player) {
                 Object.assign(player, newStats); // Fusionne les nouvelles stats
                 updatePlayerStatsDisplay();
             }
         }
    };

})(); // Fin de l'IIFE

// Exemple d'utilisation (pourrait être dans un fichier main.js ou déclenché par un déplacement)
/*
function encounterEnemy() {
    const floor = 1; // Ou récupérer l'étage actuel
    const enemy = EnemyManager.generateRandomEnemy(floor);
    if (enemy) {
        CombatManager.startCombat(enemy, (playerWon) => {
            console.log("Combat terminé. Le joueur a gagné :", playerWon);
            if (playerWon) {
                // Continuer l'exploration
            } else {
                // Gérer le game over
            }
        });
    }
}

// Simuler une rencontre
// setTimeout(encounterEnemy, 2000); // Démarre un combat après 2 secondes
*/