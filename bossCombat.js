// bossCombat.js
/**
 * Module pour la gestion des combats contre les Boss.
 * Déclenché tous les 5 étages, avec des ennemis plus puissants et des récompenses accrues.
 */

// Dépendances :
// - Objet 'player' global (défini dans main.js)
// - CombatManager (pour logMessage, updatePlayerStatsDisplay, gainExperience, isCombatActive)
// - EnemyManager (pour getBaseStatsForFloor - avec fallback)
// - Éléments DOM de l'interface de combat (partagés avec combat.js)

// --- PAS DE DÉCLARATIONS DE CONSTANTES DOM ICI ---

const BossCombatManager = (() => {

    // --- DÉCLARATIONS DES CONSTANTES DOM À L'INTÉRIEUR DE L'IIFE ---
    const bossCombatDisplayElement = document.getElementById('combat-display');
    // S'assurer que l'élément parent existe avant de chercher le titre
    const bossCombatTitle = bossCombatDisplayElement ? bossCombatDisplayElement.querySelector('h2') : null;
    const bossEnemyNameDisplay = document.getElementById('enemy-name');
    const bossEnemyHpDisplay = document.getElementById('enemy-hp');
    const bossEnemyMaxHpDisplay = document.getElementById('enemy-max-hp');
    // --- FIN DES DÉCLARATIONS DOM ---

    let currentBoss = null; // Le boss actuellement combattu
    let isBossCombatActive = false; // Indicateur si un combat de boss est en cours
    let onBossCombatEndCallback = null; // Callback à appeler à la fin du combat

    // Base de données des Boss (inchangée)
    const bossTemplates = {
         5: { name: "Gardien du Seuil", hpMultiplier: 5, attackMultiplier: 1.5, defenseMultiplier: 1.2, xpMultiplier: 5, goldMultiplier: 10, specialAbilityChance: 0.15, specialDesc: "Frappe Puissante" },
         10: { name: "Géant de Pierre", hpMultiplier: 8, attackMultiplier: 1.8, defenseMultiplier: 1.5, xpMultiplier: 8, goldMultiplier: 15, specialAbilityChance: 0.20, specialDesc: "Secousse Sismique" },
         15: { name: "Hydre des Profondeurs", hpMultiplier: 12, attackMultiplier: 2.0, defenseMultiplier: 1.8, xpMultiplier: 12, goldMultiplier: 20, specialAbilityChance: 0.25, specialDesc: "Souffle Corrosif" },
         default: { name: "Ancien Gardien", hpMultiplier: 6, attackMultiplier: 1.6, defenseMultiplier: 1.3, xpMultiplier: 6, goldMultiplier: 12, specialAbilityChance: 0.18, specialDesc: "Énergie Sombre" }
     };

    /**
     * Génère les statistiques d'un boss pour un étage donné.
     * @param {number} floorNumber - Le numéro de l'étage.
     * @returns {object|null} - L'objet boss ou null.
     */
    function generateBoss(floorNumber) {
        const template = bossTemplates[floorNumber] || bossTemplates.default;
        if (!template) {
            console.error(`Aucun template de boss trouvé pour l'étage ${floorNumber}.`);
             if (typeof CombatManager !== 'undefined' && CombatManager.logMessage) {
                 CombatManager.logMessage(`Erreur: Impossible de générer le boss pour l'étage ${floorNumber}.`);
             }
            return null;
        }

        let baseStats;
        if (typeof EnemyManager !== 'undefined' && typeof EnemyManager.getBaseStatsForFloor === 'function') {
            baseStats = EnemyManager.getBaseStatsForFloor(floorNumber);
        } else {
            console.warn("EnemyManager.getBaseStatsForFloor non trouvé. Utilisation de stats de base par défaut pour le boss.");
            const baseLevelFactor = Math.max(1, floorNumber / 2);
            baseStats = { hp: 30 * baseLevelFactor, attack: 5 * baseLevelFactor, defense: 2 * baseLevelFactor, xpValue: 20 * baseLevelFactor, goldValue: 15 * baseLevelFactor };
        }

        const finalBossStats = {
            name: template.name,
            hp: Math.round(baseStats.hp * template.hpMultiplier),
            maxHp: Math.round(baseStats.hp * template.hpMultiplier),
            attack: Math.round(baseStats.attack * template.attackMultiplier),
            defense: Math.round(baseStats.defense * template.defenseMultiplier),
            xpValue: Math.round(baseStats.xpValue * template.xpMultiplier),
            goldValue: Math.round(baseStats.goldValue * template.goldMultiplier),
            specialAbilityChance: template.specialAbilityChance,
            specialAbilityDescription: template.specialDesc,
            isBoss: true
        };

        finalBossStats.hp = Math.max(10, finalBossStats.hp);
        finalBossStats.maxHp = Math.max(10, finalBossStats.maxHp);
        finalBossStats.attack = Math.max(1, finalBossStats.attack);
        finalBossStats.defense = Math.max(0, finalBossStats.defense);
        finalBossStats.xpValue = Math.max(0, finalBossStats.xpValue);
        finalBossStats.goldValue = Math.max(0, finalBossStats.goldValue);
        return finalBossStats;
    }

    /**
     * Met à jour l'affichage des informations du boss.
     */
    function updateBossDisplay() {
        if (!currentBoss || !isBossCombatActive) return;
         if (!bossEnemyNameDisplay || !bossEnemyHpDisplay || !bossEnemyMaxHpDisplay) {
             console.error("Un ou plusieurs éléments DOM pour les stats ennemi sont manquants (Boss).");
             return;
         }
        bossEnemyNameDisplay.textContent = `${currentBoss.name} (BOSS)`;
        bossEnemyHpDisplay.textContent = currentBoss.hp;
        bossEnemyMaxHpDisplay.textContent = currentBoss.maxHp;
    }

    /**
     * Calcule les dégâts infligés.
     * @param {number} attackerAttack
     * @param {number} defenderDefense
     * @returns {number}
     */
    function calculateDamage(attackerAttack, defenderDefense) {
         // Copie de la logique car CombatManager.calculateDamage n'est pas exposé par défaut
         const baseDamage = attackerAttack - defenderDefense;
         const variation = Math.random() * 0.2 + 0.9; // +/- 10%
         const finalDamage = Math.round(baseDamage * variation);
         return Math.max( (attackerAttack > 0 ? 1 : 0) , finalDamage);
    }

    /**
     * Gère l'action d'attaque du joueur contre le boss.
     * Exposée pour être appelée par le listener centralisé dans main.js.
     */
    function playerAttackBoss() {
        if (typeof player === 'undefined' || player === null) {
             CombatManager.logMessage("Erreur : Attaque de boss impossible sans joueur défini.");
             return;
        }
        if (!isBossCombatActive || !currentBoss || player.hp <= 0) return;

        const damageDealt = calculateDamage(player.attack, currentBoss.defense);
        currentBoss.hp = Math.max(0, currentBoss.hp - damageDealt);
        CombatManager.logMessage(`Vous attaquez le boss ${currentBoss.name} et infligez ${damageDealt} points de dégâts.`);
        updateBossDisplay();

        if (currentBoss.hp <= 0) {
            CombatManager.logMessage(`Vous avez vaincu le puissant ${currentBoss.name} !`);
            endBossCombat(true);
            return;
        }

        setTimeout(() => {
            bossAttack();
        }, 600);
    }

    /**
     * Gère l'action d'attaque du boss (peut inclure des compétences spéciales).
     * Exposée pour être appelée par main.js (après usage d'objet en combat).
     */
    function bossAttack() {
         if (typeof player === 'undefined' || player === null) {
             CombatManager.logMessage("Erreur : Le boss ne peut attaquer car le joueur est indéfini.");
             return;
         }
        if (!isBossCombatActive || !currentBoss || currentBoss.hp <= 0 || player.hp <= 0) return;

        if (Math.random() < currentBoss.specialAbilityChance) {
            executeBossSpecialAbility();
        } else {
            const damageTaken = calculateDamage(currentBoss.attack, player.defense);
            player.hp = Math.max(0, player.hp - damageTaken);
            CombatManager.logMessage(`Le boss ${currentBoss.name} vous attaque et inflige ${damageTaken} points de dégâts.`);
            CombatManager.updatePlayerStatsDisplay();
        }

        if (player.hp <= 0) {
            CombatManager.logMessage(`Vous avez été écrasé par ${currentBoss.name}...`);
            endBossCombat(false);
        }
    }

    /**
     * Exécute une capacité spéciale du boss.
     */
    function executeBossSpecialAbility() {
        if (typeof player === 'undefined' || player === null || !currentBoss) return;

        const abilityName = currentBoss.specialAbilityDescription || "Capacité Spéciale";
        CombatManager.logMessage(`Le boss ${currentBoss.name} utilise ${abilityName} !`);

        const damageMultiplier = 1.5 + Math.random() * 0.5;
        const specialDamage = calculateDamage(currentBoss.attack * damageMultiplier, player.defense);
        player.hp = Math.max(0, player.hp - specialDamage);

        CombatManager.logMessage(`L'attaque vous inflige ${specialDamage} points de dégâts critiques !`);
        CombatManager.updatePlayerStatsDisplay();
    }

    /**
     * Initialise et démarre un combat contre un boss spécifique.
     * @param {number} floorNumber - Le numéro de l'étage du boss.
     * @param {function} onEndCallback - Fonction à appeler lorsque le combat se termine.
     * @returns {boolean} - True si le combat a pu démarrer, false sinon.
     */
    function startBossCombat(floorNumber, onEndCallback) {
         if (typeof player === 'undefined' || player === null) {
             CombatManager.logMessage("Erreur critique : Impossible de démarrer un combat de boss sans joueur défini.");
             if (onEndCallback) onEndCallback(false);
             return false;
         }
         if (typeof CombatManager === 'undefined' || !CombatManager.logMessage || !CombatManager.updatePlayerStatsDisplay || !CombatManager.gainExperience) {
              console.error("Dépendance manquante : CombatManager n'est pas entièrement initialisé.");
              alert("Erreur critique : Impossible de lancer le combat de boss (dépendance manquante).");
              if (onEndCallback) onEndCallback(false);
              return false;
         }
         if (CombatManager.isCombatActive() || isBossCombatActive) {
             CombatManager.logMessage("Impossible de démarrer le combat : un autre combat est déjà en cours.");
             return false;
         }

        const boss = generateBoss(floorNumber);
        if (!boss) {
            CombatManager.logMessage(`Erreur lors de la génération du boss pour l'étage ${floorNumber}. Le passage est libre.`);
            if (onEndCallback) onEndCallback(true);
            return false;
        }

        currentBoss = boss;
        isBossCombatActive = true;
        onBossCombatEndCallback = onEndCallback;

         if (!bossCombatDisplayElement || !bossCombatTitle) {
             console.error("Éléments DOM pour l'affichage du combat de boss manquants !");
             CombatManager.logMessage("Erreur d'interface: impossible d'afficher le combat de boss.");
             isBossCombatActive = false;
             currentBoss = null;
             if (onEndCallback) onEndCallback(false);
             return false;
         }
        bossCombatDisplayElement.classList.remove('hidden');
        bossCombatTitle.textContent = "COMBAT DE BOSS !!!";
        updateBossDisplay();
        CombatManager.updatePlayerStatsDisplay();
        CombatManager.logMessage(`Attention ! Le boss de l'étage, ${currentBoss.name}, bloque le passage !`);

        const attackBtnRef = document.getElementById('attack-button');
        if (attackBtnRef) attackBtnRef.disabled = false;
        const combatInvBtn = document.getElementById('combat-inventory-button');
        if(combatInvBtn) combatInvBtn.classList.remove('hidden');

        return true;
    }

    /**
     * Termine le combat de boss actuel.
     * @param {boolean} playerWon - True si le joueur a gagné, false sinon.
     */
    function endBossCombat(playerWon) {
        if (!isBossCombatActive) return;

        if (typeof player === 'undefined' || player === null) {
             CombatManager.logMessage("Erreur : Fin de combat de boss sans joueur défini pour le butin.");
        }

        const attackBtnRef = document.getElementById('attack-button');
        if (attackBtnRef) attackBtnRef.disabled = true;
        const combatInvBtn = document.getElementById('combat-inventory-button');
        if(combatInvBtn) combatInvBtn.classList.add('hidden');
        const combatInvList = document.getElementById('combat-inventory-list');
        if(combatInvList) combatInvList.classList.add('hidden');

        if (playerWon) {
            if (currentBoss && player && CombatManager.gainExperience) {
                CombatManager.gainExperience(currentBoss.xpValue);
                player.gold += currentBoss.goldValue;
                CombatManager.logMessage(`Vous avez triomphé et recevez ${currentBoss.goldValue} pièces d'or !`);
                 CombatManager.updatePlayerStatsDisplay();
            }
        } else {
            CombatManager.logMessage("Game Over ! Le boss était trop puissant.");
        }

        setTimeout(() => {
            if (bossCombatDisplayElement) bossCombatDisplayElement.classList.add('hidden');
            if (bossCombatTitle) bossCombatTitle.textContent = "Combat !";
        }, 2000);

        const callback = onBossCombatEndCallback;
        isBossCombatActive = false;
        currentBoss = null;
        onBossCombatEndCallback = null;

        if (callback) {
            callback(playerWon);
        }
    }

    // --- Interface Publique du Module ---
    return {
        startBossCombat: startBossCombat,
        isBossCombatActive: () => isBossCombatActive,
        playerAttackBoss: playerAttackBoss,
        bossAttack: bossAttack,
        generateBoss: generateBoss // Peut être utile pour débogage ou prévisualisation
    };

})(); // Fin de l'IIFE