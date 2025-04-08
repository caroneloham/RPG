// combat.js
/**
 * Module pour la gestion des combats standards contre les ennemis.
 * Gère le déroulement du combat tour par tour, les calculs de dégâts,
 * la gestion des HP, l'XP et la montée de niveau du joueur.
 */

// Ce module dépend de l'objet 'player' qui doit être défini globalement
// (par exemple, dans main.js : window.player = playerObject)
// Il dépend aussi des éléments du DOM définis dans index.html.

// Récupération des éléments du DOM pour l'affichage du combat et du log
const combatDisplayElement = document.getElementById('combat-display'); // Renommé pour clarté vs la variable globale potentielle
const enemyNameDisplay = document.getElementById('enemy-name');
const enemyHpDisplay = document.getElementById('enemy-hp');
const enemyMaxHpDisplay = document.getElementById('enemy-max-hp');
// Note: Le listener pour attackButton est maintenant dans main.js
// const attackButton = document.getElementById('attack-button');
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
        // Vérifie si l'objet player global est accessible
        if (typeof player === 'undefined') {
            console.error("Objet 'player' global non trouvé par CombatManager.logMessage");
            // return; // On pourrait arrêter ici, mais le log est utile même sans joueur
        }
        if (!gameLogList) {
            console.error("Élément 'log-list' non trouvé.");
            return;
        }
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
        // Vérifie si l'objet player global est accessible
        if (typeof player === 'undefined' || player === null) {
            console.warn("Tentative de mise à jour de l'UI sans objet 'player' global défini.");
            // Mettre des valeurs par défaut ou vider ? Pour l'instant, on sort.
             // Vider les champs serait peut-être mieux :
             /*
             playerLevelDisplay.textContent = '-';
             playerHpDisplay.textContent = '-';
             playerMaxHpDisplay.textContent = '-';
             // ... etc ...
             */
            return;
        }
        // Vérifie si les éléments du DOM existent
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
     // Appel initial pour essayer d'afficher les stats au chargement
     // Note: 'player' pourrait ne pas être encore défini ici, d'où les vérifications.
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
        // Ajouter une petite variation aléatoire pour rendre moins prévisible
        const variation = Math.random() * 0.2 + 0.9; // entre 0.9 et 1.1 ( +/- 10%)
        const finalDamage = Math.round(baseDamage * variation);

        // Assurer un minimum de 1 dégât si l'attaque > 0, sinon 0.
        return Math.max( (attackerAttack > 0 ? 1 : 0) , finalDamage);
    }

     /**
     * Gère la montée de niveau du joueur.
     */
    function levelUp() {
         // Vérifie si l'objet player global est accessible
         if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur : Impossible de monter de niveau sans joueur défini.");
             return;
         }

        player.level++;
        player.xp -= player.xpToNextLevel; // Garde l'excédent d'XP

        // Augmentation des statistiques (exemple simple)
        player.maxHp += 10;
        player.attack += 2;
        player.defense += 1;
        player.hp = player.maxHp; // Restaure complètement les HP à la montée de niveau

        // Calcul de l'XP nécessaire pour le prochain niveau (exemple : augmente de 50%)
        player.xpToNextLevel = Math.round(player.xpToNextLevel * 1.5);

        logMessage(`Niveau supérieur ! Vous êtes maintenant niveau ${player.level}. Stats améliorées, HP restaurés !`);
        updatePlayerStatsDisplay(); // Mettre à jour l'affichage

        // Vérifier si on peut encore monter de niveau avec l'XP restante
        if (player.xp >= player.xpToNextLevel) {
            levelUp(); // Appel récursif si plusieurs niveaux d'un coup
        }
    }


    /**
     * Gère le gain d'XP et la potentielle montée de niveau.
     * Exposée pour être utilisée par bossCombat.js également.
     * @param {number} xpGained - La quantité d'XP gagnée.
     */
    function gainExperience(xpGained) {
         // Vérifie si l'objet player global est accessible
         if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur : Impossible de gagner de l'XP sans joueur défini.");
             return;
         }
         if (xpGained <= 0) return;

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
     * Exposée pour être appelée par le listener centralisé dans main.js.
     */
    function playerAttack() {
        // Vérifie si l'objet player global est accessible
        if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur : Attaque impossible sans joueur défini.");
             return;
        }
        if (!isCombatActive || !currentEnemy || player.hp <= 0) return; // Conditions de combat standard

        // Désactiver temporairement le bouton pour éviter double-clic ? (Optionnel)
        // attackButton.disabled = true; // Nécessiterait la référence au bouton

        // 1. Calculer les dégâts infligés par le joueur
        const damageDealt = calculateDamage(player.attack, currentEnemy.defense);
        currentEnemy.hp = Math.max(0, currentEnemy.hp - damageDealt);
        logMessage(`Vous attaquez ${currentEnemy.name} et infligez ${damageDealt} points de dégâts.`);
        updateEnemyDisplay();

        // 2. Vérifier si l'ennemi est vaincu
        if (currentEnemy.hp <= 0) {
            logMessage(`Vous avez vaincu ${currentEnemy.name} !`);
            endCombat(true); // Le joueur a gagné
            // Réactiver le bouton ici si désactivé avant
            // if (attackButton) attackButton.disabled = false;
            return; // Le combat est terminé, l'ennemi n'attaque pas
        }

        // 3. Si l'ennemi survit, il attaque à son tour (après un court délai pour lisibilité?)
        setTimeout(() => {
            enemyAttack();
            // Réactiver le bouton après l'attaque ennemie si désactivé
            // if (attackButton) attackButton.disabled = false;
        }, 500); // Délai de 500ms avant la riposte
    }

    /**
     * Gère l'action d'attaque de l'ennemi.
     * Exposée pour être appelée par main.js (après utilisation d'objet).
     */
    function enemyAttack() {
         // Vérifie si l'objet player global est accessible
         if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur : L'ennemi ne peut attaquer car le joueur est indéfini.");
             return;
         }
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
         // Vérifie si l'objet player global est accessible
         if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur critique : Impossible de démarrer un combat sans joueur défini.");
             // Peut-être appeler le callback avec 'false' pour indiquer l'échec ?
              if (onEndCallback) onEndCallback(false);
             return;
         }
        if (!enemyData) {
            console.error("Impossible de démarrer le combat : données ennemies manquantes.");
             if (onEndCallback) onEndCallback(true); // Considérer comme gagné car pas d'ennemi?
            return;
        }
        if (isCombatActive || (typeof BossCombatManager !== 'undefined' && BossCombatManager.isBossCombatActive())) {
             console.warn("Tentative de démarrer un combat alors qu'un autre est déjà en cours.");
             // Ne pas démarrer un nouveau combat
             return;
        }


        currentEnemy = { ...enemyData }; // Crée une copie pour ne pas modifier l'original
        isCombatActive = true;
        onCombatEndCallback = onEndCallback; // Stocker le callback

        // Afficher l'interface de combat
        if (!combatDisplayElement) {
             console.error("Élément 'combat-display' non trouvé.");
             // Le combat ne peut pas être affiché, mais la logique pourrait continuer?
        } else {
            combatDisplayElement.classList.remove('hidden');
            const combatTitle = combatDisplayElement.querySelector('h2');
            if(combatTitle) combatTitle.textContent = "Combat !"; // Assurer le titre standard
        }

        updateEnemyDisplay();
        updatePlayerStatsDisplay(); // Assure que les stats du joueur sont à jour au début

        logMessage(`Un ${currentEnemy.name} apparaît !`);

        // Activer les boutons d'action (le listener est dans main.js)
        const attackBtnRef = document.getElementById('attack-button'); // Re-récupérer la référence si besoin
        if (attackBtnRef) attackBtnRef.disabled = false;
        // Gérer bouton inventaire combat (dans main.js ou ici?)
         const combatInvBtn = document.getElementById('combat-inventory-button');
         if(combatInvBtn) combatInvBtn.classList.remove('hidden');

    }

    /**
     * Termine le combat actuel.
     * @param {boolean} playerWon - True si le joueur a gagné, false sinon.
     */
    function endCombat(playerWon) {
        if (!isCombatActive) return;

        // Vérifie si l'objet player global est accessible (utile pour le butin)
        if (typeof player === 'undefined' || player === null) {
             logMessage("Erreur : Fin de combat sans joueur défini pour attribuer le butin.");
             // Le reste de la fonction peut continuer pour cacher l'UI, etc.
        }

        const attackBtnRef = document.getElementById('attack-button');
        if (attackBtnRef) attackBtnRef.disabled = true; // Désactiver action principale
        const combatInvBtn = document.getElementById('combat-inventory-button');
        if(combatInvBtn) combatInvBtn.classList.add('hidden');
        const combatInvList = document.getElementById('combat-inventory-list');
        if(combatInvList) combatInvList.classList.add('hidden'); // Cacher inventaire combat


        if (playerWon) {
            if (currentEnemy && player) {
                // Gain d'XP et d'or
                gainExperience(currentEnemy.xpValue);
                player.gold += currentEnemy.goldValue;
                logMessage(`Vous recevez ${currentEnemy.goldValue} pièces d'or.`);
                updatePlayerStatsDisplay(); // Mettre à jour l'or et potentiellement l'XP/niveau
            }
        } else {
            // Gérer la défaite du joueur (Game Over, retour au début, etc.)
            logMessage("Game Over !");
            // La logique de Game Over est maintenant gérée dans main.js via le callback
        }

        // Cacher l'interface de combat après un court délai
        setTimeout(() => {
            if (combatDisplayElement) combatDisplayElement.classList.add('hidden');
        }, 1500); // Attend 1.5s avant de cacher

        // Très important: Réinitialiser l'état AVANT d'appeler le callback
        const callback = onCombatEndCallback; // Copie locale
        isCombatActive = false;
        currentEnemy = null;
        onCombatEndCallback = null;

        // Appeler le callback de fin de combat s'il existe
        if (callback) {
            callback(playerWon); // Informe main.js du résultat
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
      * @param {object} newStats - Un objet contenant les stats à mettre à jour (ex: { attack: 12, defense: 6 }).
      */
     function setPlayerStats(newStats) {
         if (typeof player !== 'undefined' && player !== null) {
             Object.assign(player, newStats); // Fusionne les nouvelles stats
             // Si maxHp est modifié, s'assurer que hp n'est pas supérieur
             if (newStats.maxHp !== undefined && player.hp > player.maxHp) {
                 player.hp = player.maxHp;
             }
             updatePlayerStatsDisplay();
         } else {
              console.warn("setPlayerStats: Joueur non défini.");
         }
     }


    // --- Gestionnaire d'événements ---
    // Le listener pour le bouton d'attaque a été déplacé dans main.js


    // --- Interface Publique du Module ---
    return {
        startCombat: startCombat,
        isCombatActive: () => isCombatActive,
        // Fonctions utilisées par main.js et/ou bossCombat.js:
        playerAttack: playerAttack,         // Pour le listener centralisé
        enemyAttack: enemyAttack,           // Pour la riposte après usage d'objet
        gainExperience: gainExperience,     // Pour les gains d'XP (combat standard et boss)
        logMessage: logMessage,             // Pour logger depuis d'autres modules
        updatePlayerStatsDisplay: updatePlayerStatsDisplay, // Pour rafraîchir l'UI depuis ailleurs
        // Fonctions utilisées par inventory.js ou shop.js:
        setPlayerHp: setPlayerHp,           // Pour appliquer effets (potion)
        setPlayerStats: setPlayerStats,     // Pour appliquer effets (upgrade boutique)
        // Potentiellement retourner les stats joueur (copie) si nécessaire ailleurs
        getPlayerStats: () => {
             if (typeof player !== 'undefined' && player !== null) {
                 return { ...player }; // Retourne une copie des stats actuelles
             }
             return null; // Retourne null si player n'est pas défini
        }
    };

})(); // Fin de l'IIFE