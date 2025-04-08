// combat.js
/**
 * Module pour la gestion des combats standards contre les ennemis.
 * Gère le déroulement du combat tour par tour, les calculs de dégâts,
 * la gestion des HP, l'XP et la montée de niveau du joueur.
 */

// Ce module dépend de l'objet 'player' qui doit être défini globalement
// (par exemple, dans main.js : window.player = playerObject)
// Il dépend aussi des éléments du DOM définis dans index.html.

// --- PAS DE DÉCLARATION DE 'player' ICI ---
// --- PAS DE DÉCLARATIONS DE CONSTANTES DOM ICI ---

const CombatManager = (() => {

    // --- DÉCLARATIONS DES CONSTANTES DOM À L'INTÉRIEUR DE L'IIFE ---
    const combatDisplayElement = document.getElementById('combat-display');
    const enemyNameDisplay = document.getElementById('enemy-name');
    const enemyHpDisplay = document.getElementById('enemy-hp');
    const enemyMaxHpDisplay = document.getElementById('enemy-max-hp');
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
    // --- FIN DES DÉCLARATIONS DOM ---

    let currentEnemy = null; // L'ennemi actuellement combattu
    let isCombatActive = false; // Indicateur si un combat est en cours
    let onCombatEndCallback = null; // Callback à appeler à la fin du combat

    /**
     * Ajoute un message au log du jeu.
     * @param {string} message - Le message à afficher.
     */
    function logMessage(message) {
        if (typeof player === 'undefined') {
            console.error("Objet 'player' global non trouvé par CombatManager.logMessage");
        }
        if (!gameLogList) {
            console.error("Élément 'log-list' non trouvé.");
            return;
        }
        const li = document.createElement('li');
        li.textContent = message;
        gameLogList.appendChild(li);
        gameLogList.scrollTop = gameLogList.scrollHeight;
    }

     /**
     * Met à jour l'affichage des statistiques du joueur dans l'interface.
     */
    function updatePlayerStatsDisplay() {
        if (typeof player === 'undefined' || player === null) {
            console.warn("Tentative de mise à jour de l'UI sans objet 'player' global défini.");
            return;
        }
        if (!playerLevelDisplay || !playerHpDisplay || !playerMaxHpDisplay || !playerAttackDisplay ||
            !playerDefenseDisplay || !playerXpDisplay || !playerXpNextDisplay || !playerGoldDisplay) {
            console.error("Un ou plusieurs éléments DOM pour les stats joueur sont manquants.");
            return;
        }
        playerLevelDisplay.textContent = player.level;
        playerHpDisplay.textContent = player.hp;
        playerMaxHpDisplay.textContent = player.maxHp;
        playerAttackDisplay.textContent = player.attack;
        playerDefenseDisplay.textContent = player.defense;
        playerXpDisplay.textContent = player.xp;
        playerXpNextDisplay.textContent = player.xpToNextLevel;
        playerGoldDisplay.textContent = player.gold;
    }
    // Appel initial (peut échouer si 'player' n'est pas prêt, mais c'est ok)
    updatePlayerStatsDisplay();

    /**
     * Met à jour l'affichage des informations de l'ennemi pendant le combat.
     */
    function updateEnemyDisplay() {
        if (!currentEnemy || !isCombatActive) return;
        if (!enemyNameDisplay || !enemyHpDisplay || !enemyMaxHpDisplay) {
             console.error("Un ou plusieurs éléments DOM pour les stats ennemi sont manquants.");
             return;
        }
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
        const baseDamage = attackerAttack - defenderDefense;
        const variation = Math.random() * 0.2 + 0.9; // entre 0.9 et 1.1 ( +/- 10%)
        const finalDamage = Math.round(baseDamage * variation);
        return Math.max( (attackerAttack > 0 ? 1 : 0) , finalDamage);
    }

     /**
     * Gère la montée de niveau du joueur.
     */
    function levelUp() {
         if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur : Impossible de monter de niveau sans joueur défini.");
             return;
         }
        player.level++;
        player.xp -= player.xpToNextLevel;
        player.maxHp += 10;
        player.attack += 2;
        player.defense += 1;
        player.hp = player.maxHp;
        player.xpToNextLevel = Math.round(player.xpToNextLevel * 1.5);
        logMessage(`Niveau supérieur ! Vous êtes maintenant niveau ${player.level}. Stats améliorées, HP restaurés !`);
        updatePlayerStatsDisplay();
        if (player.xp >= player.xpToNextLevel) {
            levelUp();
        }
    }

    /**
     * Gère le gain d'XP et la potentielle montée de niveau.
     * Exposée pour être utilisée par bossCombat.js également.
     * @param {number} xpGained - La quantité d'XP gagnée.
     */
    function gainExperience(xpGained) {
         if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur : Impossible de gagner de l'XP sans joueur défini.");
             return;
         }
         if (xpGained <= 0) return;
        player.xp += xpGained;
        logMessage(`Vous gagnez ${xpGained} points d'expérience.`);
        if (player.xp >= player.xpToNextLevel) {
            levelUp();
        } else {
             updatePlayerStatsDisplay();
        }
    }

    /**
     * Gère l'action d'attaque du joueur.
     * Exposée pour être appelée par le listener centralisé dans main.js.
     */
    function playerAttack() {
        if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur : Attaque impossible sans joueur défini.");
             return;
        }
        if (!isCombatActive || !currentEnemy || player.hp <= 0) return;

        const damageDealt = calculateDamage(player.attack, currentEnemy.defense);
        currentEnemy.hp = Math.max(0, currentEnemy.hp - damageDealt);
        logMessage(`Vous attaquez ${currentEnemy.name} et infligez ${damageDealt} points de dégâts.`);
        updateEnemyDisplay();

        if (currentEnemy.hp <= 0) {
            logMessage(`Vous avez vaincu ${currentEnemy.name} !`);
            endCombat(true);
            return;
        }

        setTimeout(() => {
            enemyAttack();
        }, 500);
    }

    /**
     * Gère l'action d'attaque de l'ennemi.
     * Exposée pour être appelée par main.js (après utilisation d'objet).
     */
    function enemyAttack() {
         if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur : L'ennemi ne peut attaquer car le joueur est indéfini.");
             return;
         }
        if (!isCombatActive || !currentEnemy || currentEnemy.hp <= 0 || player.hp <= 0) return;

        const damageTaken = calculateDamage(currentEnemy.attack, player.defense);
        player.hp = Math.max(0, player.hp - damageTaken);
        logMessage(`${currentEnemy.name} vous attaque et inflige ${damageTaken} points de dégâts.`);
        updatePlayerStatsDisplay();

        if (player.hp <= 0) {
            logMessage(`Vous avez été vaincu par ${currentEnemy.name}...`);
            endCombat(false);
        }
    }

    /**
     * Initialise et démarre un combat contre un ennemi spécifique.
     * @param {object} enemyData - L'objet ennemi généré par EnemyManager.
     * @param {function} onEndCallback - Fonction à appeler lorsque le combat se termine.
     */
    function startCombat(enemyData, onEndCallback) {
         if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur critique : Impossible de démarrer un combat sans joueur défini.");
              if (onEndCallback) onEndCallback(false);
             return;
         }
        if (!enemyData) {
            console.error("Impossible de démarrer le combat : données ennemies manquantes.");
             if (onEndCallback) onEndCallback(true);
            return;
        }
        // Vérification d'un combat déjà en cours (standard ou boss)
        if (isCombatActive || (typeof BossCombatManager !== 'undefined' && BossCombatManager.isBossCombatActive())) {
             console.warn("Tentative de démarrer un combat alors qu'un autre est déjà en cours.");
             return;
         }

        currentEnemy = { ...enemyData };
        isCombatActive = true;
        onCombatEndCallback = onEndCallback;

        if (!combatDisplayElement) {
             console.error("Élément 'combat-display' non trouvé.");
        } else {
            combatDisplayElement.classList.remove('hidden');
            const combatTitle = combatDisplayElement.querySelector('h2');
            if(combatTitle) combatTitle.textContent = "Combat !";
        }

        updateEnemyDisplay();
        updatePlayerStatsDisplay();
        logMessage(`Un ${currentEnemy.name} apparaît !`);

        const attackBtnRef = document.getElementById('attack-button');
        if (attackBtnRef) attackBtnRef.disabled = false;
        const combatInvBtn = document.getElementById('combat-inventory-button');
        if(combatInvBtn) combatInvBtn.classList.remove('hidden');
    }

    /**
     * Termine le combat actuel.
     * @param {boolean} playerWon - True si le joueur a gagné, false sinon.
     */
    function endCombat(playerWon) {
        if (!isCombatActive) return;

        if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur : Fin de combat sans joueur défini pour attribuer le butin.");
        }

        const attackBtnRef = document.getElementById('attack-button');
        if (attackBtnRef) attackBtnRef.disabled = true;
        const combatInvBtn = document.getElementById('combat-inventory-button');
        if(combatInvBtn) combatInvBtn.classList.add('hidden');
        const combatInvList = document.getElementById('combat-inventory-list');
        if(combatInvList) combatInvList.classList.add('hidden');

        if (playerWon) {
            if (currentEnemy && player) {
                gainExperience(currentEnemy.xpValue);
                player.gold += currentEnemy.goldValue;
                logMessage(`Vous recevez ${currentEnemy.goldValue} pièces d'or.`);
                updatePlayerStatsDisplay();
            }
        } else {
            logMessage("Game Over !");
        }

        setTimeout(() => {
            if (combatDisplayElement) combatDisplayElement.classList.add('hidden');
        }, 1500);

        const callback = onCombatEndCallback;
        isCombatActive = false;
        currentEnemy = null;
        onCombatEndCallback = null;

        if (callback) {
            callback(playerWon);
        }
    }

    /**
     * Met à jour les HP du joueur (utilisé par InventoryManager).
     * @param {number} newHp - La nouvelle valeur de HP.
     */
    function setPlayerHp(newHp) {
         if(typeof player !== 'undefined' && player !== null) {
             player.hp = Math.max(0, Math.min(player.maxHp, newHp));
             updatePlayerStatsDisplay();
         } else {
              console.warn("setPlayerHp: Joueur non défini.");
         }
     }

    /**
      * Met à jour plusieurs statistiques du joueur (utilisé par ShopManager pour les upgrades).
      * @param {object} newStats - Un objet contenant les stats à mettre à jour.
      */
     function setPlayerStats(newStats) {
         if (typeof player !== 'undefined' && player !== null) {
             Object.assign(player, newStats);
             if (newStats.maxHp !== undefined && player.hp > player.maxHp) {
                 player.hp = player.maxHp;
             }
             updatePlayerStatsDisplay();
         } else {
              console.warn("setPlayerStats: Joueur non défini.");
         }
     }

    // --- Interface Publique du Module ---
    return {
        startCombat: startCombat,
        isCombatActive: () => isCombatActive,
        playerAttack: playerAttack,
        enemyAttack: enemyAttack,
        gainExperience: gainExperience,
        logMessage: logMessage,
        updatePlayerStatsDisplay: updatePlayerStatsDisplay,
        setPlayerHp: setPlayerHp,
        setPlayerStats: setPlayerStats,
        getPlayerStats: () => {
             if (typeof player !== 'undefined' && player !== null) {
                 return { ...player };
             }
             return null;
        },
        // Exposer calculateDamage si bossCombat veut l'utiliser directement
        // calculateDamage: calculateDamage
    };

})(); // Fin de l'IIFE