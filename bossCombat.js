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

// Récupération des éléments du DOM (partagés)
const bossCombatDisplayElement = document.getElementById('combat-display'); // Réutilise le même conteneur
const bossCombatTitle = bossCombatDisplayElement ? bossCombatDisplayElement.querySelector('h2') : null; // Titre spécifique au combat
const bossEnemyNameDisplay = document.getElementById('enemy-name');
const bossEnemyHpDisplay = document.getElementById('enemy-hp');
const bossEnemyMaxHpDisplay = document.getElementById('enemy-max-hp');
// Note: Le listener pour attackButton est géré dans main.js

const BossCombatManager = (() => {

    let currentBoss = null; // Le boss actuellement combattu
    let isBossCombatActive = false; // Indicateur si un combat de boss est en cours
    let onBossCombatEndCallback = null; // Callback à appeler à la fin du combat

    // --- Base de données des Boss ---
    // Structure: étage -> { config boss }
    const bossTemplates = {
        5: { name: "Gardien du Seuil", hpMultiplier: 5, attackMultiplier: 1.5, defenseMultiplier: 1.2, xpMultiplier: 5, goldMultiplier: 10, specialAbilityChance: 0.15, specialDesc: "Frappe Puissante" },
        10: { name: "Géant de Pierre", hpMultiplier: 8, attackMultiplier: 1.8, defenseMultiplier: 1.5, xpMultiplier: 8, goldMultiplier: 15, specialAbilityChance: 0.20, specialDesc: "Secousse Sismique" },
        15: { name: "Hydre des Profondeurs", hpMultiplier: 12, attackMultiplier: 2.0, defenseMultiplier: 1.8, xpMultiplier: 12, goldMultiplier: 20, specialAbilityChance: 0.25, specialDesc: "Souffle Corrosif" },
        // Ajouter d'autres boss...
        // Boss générique si étage non défini ?
        default: { name: "Ancien Gardien", hpMultiplier: 6, attackMultiplier: 1.6, defenseMultiplier: 1.3, xpMultiplier: 6, goldMultiplier: 12, specialAbilityChance: 0.18, specialDesc: "Énergie Sombre" }
    };

    /**
     * Génère les statistiques d'un boss pour un étage donné.
     * @param {number} floorNumber - Le numéro de l'étage (devrait être un multiple de 5).
     * @returns {object|null} - L'objet boss avec ses statistiques, ou null en cas d'erreur majeure.
     */
    function generateBoss(floorNumber) {
        // Sélectionne le template du boss, ou le template par défaut
        const template = bossTemplates[floorNumber] || bossTemplates.default;
        if (!template) {
            console.error(`Aucun template de boss trouvé pour l'étage ${floorNumber}, même pas par défaut.`);
            // Tenter de loguer via CombatManager si disponible
             if (typeof CombatManager !== 'undefined' && CombatManager.logMessage) {
                 CombatManager.logMessage(`Erreur: Impossible de générer le boss pour l'étage ${floorNumber}.`);
             }
            return null;
        }

        // Essayer d'obtenir des stats de base via EnemyManager, sinon utiliser des valeurs par défaut
        let baseStats;
        if (typeof EnemyManager !== 'undefined' && typeof EnemyManager.getBaseStatsForFloor === 'function') {
            baseStats = EnemyManager.getBaseStatsForFloor(floorNumber);
        } else {
            // Fallback si EnemyManager ou la fonction n'est pas disponible
            console.warn("EnemyManager.getBaseStatsForFloor non trouvé. Utilisation de stats de base par défaut pour le boss.");
            const baseLevelFactor = Math.max(1, floorNumber / 2); // Facteur simple basé sur l'étage
            baseStats = {
                hp: 30 * baseLevelFactor,
                attack: 5 * baseLevelFactor,
                defense: 2 * baseLevelFactor,
                xpValue: 20 * baseLevelFactor,
                goldValue: 15 * baseLevelFactor
            };
        }

        // Calculer les stats finales du boss
        const finalBossStats = {
            name: template.name,
            hp: Math.round(baseStats.hp * template.hpMultiplier),
            maxHp: Math.round(baseStats.hp * template.hpMultiplier),
            attack: Math.round(baseStats.attack * template.attackMultiplier),
            defense: Math.round(baseStats.defense * template.defenseMultiplier),
            xpValue: Math.round(baseStats.xpValue * template.xpMultiplier),
            goldValue: Math.round(baseStats.goldValue * template.goldMultiplier),
            specialAbilityChance: template.specialAbilityChance,
            specialAbilityDescription: template.specialDesc, // Description pour le log
            isBoss: true // Marqueur
        };

        // Assurer des valeurs minimales pour éviter les stats nulles ou négatives
        finalBossStats.hp = Math.max(10, finalBossStats.hp);
        finalBossStats.maxHp = Math.max(10, finalBossStats.maxHp);
        finalBossStats.attack = Math.max(1, finalBossStats.attack);
        finalBossStats.defense = Math.max(0, finalBossStats.defense); // La défense peut être 0
        finalBossStats.xpValue = Math.max(0, finalBossStats.xpValue);
        finalBossStats.goldValue = Math.max(0, finalBossStats.goldValue);

        return finalBossStats;
    }

    /**
     * Met à jour l'affichage des informations du boss.
     */
    function updateBossDisplay() {
        if (!currentBoss || !isBossCombatActive) return;
         // Vérification des éléments DOM
         if (!bossEnemyNameDisplay || !bossEnemyHpDisplay || !bossEnemyMaxHpDisplay) {
             console.error("Un ou plusieurs éléments DOM pour les stats ennemi sont manquants (Boss).");
             return;
         }
        bossEnemyNameDisplay.textContent = `${currentBoss.name} (BOSS)`;
        bossEnemyHpDisplay.textContent = currentBoss.hp;
        bossEnemyMaxHpDisplay.textContent = currentBoss.maxHp;
    }

    /**
     * Calcule les dégâts infligés (peut utiliser la fonction de CombatManager si exposée,
     * sinon on la réimplémente ou on la copie). Utilisons celle de CombatManager si possible.
     * @param {number} attackerAttack - Statistique d'attaque de l'attaquant.
     * @param {number} defenderDefense - Statistique de défense du défenseur.
     * @returns {number} - Les dégâts infligés.
     */
    function calculateDamage(attackerAttack, defenderDefense) {
        // Tenter d'utiliser la fonction centralisée de CombatManager
        if (typeof CombatManager !== 'undefined' && typeof CombatManager.calculateDamage === 'function') {
            // Note: calculateDamage n'a pas été exposé dans la version précédente de combat.js.
            // Il faudrait l'exposer ou recopier la logique ici. Recopions pour l'instant.
             const baseDamage = attackerAttack - defenderDefense;
             const variation = Math.random() * 0.2 + 0.9; // entre 0.9 et 1.1 ( +/- 10%)
             const finalDamage = Math.round(baseDamage * variation);
             return Math.max( (attackerAttack > 0 ? 1 : 0) , finalDamage);
        } else {
            // Fallback si CombatManager ou sa fonction de calcul n'est pas là
            console.warn("CombatManager.calculateDamage non trouvé, utilisation d'un calcul local.");
            return Math.max(1, attackerAttack - defenderDefense); // Calcul simple
        }
    }

    /**
     * Gère l'action d'attaque du joueur contre le boss.
     * Exposée pour être appelée par le listener centralisé dans main.js.
     */
    function playerAttackBoss() {
        // Vérification joueur global
        if (typeof player === 'undefined' || player === null) {
             CombatManager.logMessage("Erreur : Attaque de boss impossible sans joueur défini.");
             return;
        }
        if (!isBossCombatActive || !currentBoss || player.hp <= 0) return;

        // Désactiver bouton attaque temporairement? (géré dans main.js potentiellement)

        // 1. Calculer dégâts joueur -> boss
        const damageDealt = calculateDamage(player.attack, currentBoss.defense);
        currentBoss.hp = Math.max(0, currentBoss.hp - damageDealt);
        CombatManager.logMessage(`Vous attaquez le boss ${currentBoss.name} et infligez ${damageDealt} points de dégâts.`);
        updateBossDisplay();

        // 2. Vérifier si boss vaincu
        if (currentBoss.hp <= 0) {
            CombatManager.logMessage(`Vous avez vaincu le puissant ${currentBoss.name} !`);
            endBossCombat(true); // Joueur gagne
            return; // Combat terminé
        }

        // 3. Riposte du boss (après délai)
        setTimeout(() => {
            bossAttack();
            // Réactiver bouton attaque? (géré dans main.js potentiellement)
        }, 600); // Délai légèrement plus long pour les boss?
    }

    /**
     * Gère l'action d'attaque du boss (peut inclure des compétences spéciales).
     * Exposée pour être appelée par main.js (après usage d'objet en combat).
     */
    function bossAttack() {
         // Vérification joueur global
         if (typeof player === 'undefined' || player === null) {
             CombatManager.logMessage("Erreur : Le boss ne peut attaquer car le joueur est indéfini.");
             return;
         }
        if (!isBossCombatActive || !currentBoss || currentBoss.hp <= 0 || player.hp <= 0) return;

        // Décider si capacité spéciale
        if (Math.random() < currentBoss.specialAbilityChance) {
            executeBossSpecialAbility();
        } else {
            // Attaque normale
            const damageTaken = calculateDamage(currentBoss.attack, player.defense);
            player.hp = Math.max(0, player.hp - damageTaken);
            CombatManager.logMessage(`Le boss ${currentBoss.name} vous attaque et inflige ${damageTaken} points de dégâts.`);
            CombatManager.updatePlayerStatsDisplay(); // Met à jour affichage joueur via CombatManager
        }

        // Vérifier si joueur vaincu après l'attaque du boss
        if (player.hp <= 0) {
            CombatManager.logMessage(`Vous avez été écrasé par ${currentBoss.name}...`);
            endBossCombat(false); // Joueur perd
        }
    }

    /**
     * Exécute une capacité spéciale du boss.
     */
    function executeBossSpecialAbility() {
        // Vérification joueur global
        if (typeof player === 'undefined' || player === null) return;
        if (!currentBoss) return;

        const abilityName = currentBoss.specialAbilityDescription || "Capacité Spéciale";
        CombatManager.logMessage(`Le boss ${currentBoss.name} utilise ${abilityName} !`);

        // Logique d'effet simple : attaque plus puissante
        const damageMultiplier = 1.5 + Math.random() * 0.5; // Entre 1.5x et 2.0x dégâts
        const specialDamage = calculateDamage(currentBoss.attack * damageMultiplier, player.defense);
        player.hp = Math.max(0, player.hp - specialDamage);

        CombatManager.logMessage(`L'attaque vous inflige ${specialDamage} points de dégâts critiques !`);
        CombatManager.updatePlayerStatsDisplay();

        // Ajouter d'autres types de capacités si besoin (debuff, self-buff, etc.)
    }

    /**
     * Initialise et démarre un combat contre un boss spécifique.
     * @param {number} floorNumber - Le numéro de l'étage du boss.
     * @param {function} onEndCallback - Fonction à appeler lorsque le combat se termine.
     * @returns {boolean} - True si le combat a pu démarrer, false sinon.
     */
    function startBossCombat(floorNumber, onEndCallback) {
         // Vérification joueur global
         if (typeof player === 'undefined' || player === null) {
             CombatManager.logMessage("Erreur critique : Impossible de démarrer un combat de boss sans joueur défini.");
             if (onEndCallback) onEndCallback(false); // Échec
             return false;
         }
         // Vérifier si CombatManager est disponible pour les dépendances
         if (typeof CombatManager === 'undefined' || !CombatManager.logMessage || !CombatManager.updatePlayerStatsDisplay || !CombatManager.gainExperience) {
              console.error("Dépendance manquante : CombatManager n'est pas entièrement initialisé.");
              alert("Erreur critique : Impossible de lancer le combat de boss (dépendance manquante).");
              if (onEndCallback) onEndCallback(false);
              return false;
         }
         // Vérifier si un autre combat est déjà en cours
         if (CombatManager.isCombatActive() || isBossCombatActive) {
             CombatManager.logMessage("Impossible de démarrer le combat : un autre combat est déjà en cours.");
             // Ne pas appeler le callback ici car le combat précédent continue.
             return false; // Indique que le combat n'a pas démarré
         }

        const boss = generateBoss(floorNumber);
        if (!boss) {
            CombatManager.logMessage(`Erreur lors de la génération du boss pour l'étage ${floorNumber}. Le passage est libre.`);
            // Considérer comme "gagné" car pas de combat, on peut continuer.
            if (onEndCallback) onEndCallback(true);
            return false; // Le combat lui-même n'a pas démarré
        }

        currentBoss = boss;
        isBossCombatActive = true;
        onBossCombatEndCallback = onEndCallback;

        // Afficher l'interface de combat et adapter le titre
         if (!bossCombatDisplayElement || !bossCombatTitle) {
             console.error("Éléments DOM pour l'affichage du combat de boss manquants !");
             // Continuer sans UI? Ou annuler? Annulons pour être sûr.
             CombatManager.logMessage("Erreur d'interface: impossible d'afficher le combat de boss.");
             isBossCombatActive = false; // Annuler l'état
             currentBoss = null;
             if (onEndCallback) onEndCallback(false); // Échec
             return false;
         }
        bossCombatDisplayElement.classList.remove('hidden');
        bossCombatTitle.textContent = "COMBAT DE BOSS !!!"; // Titre dramatique
        updateBossDisplay();
        CombatManager.updatePlayerStatsDisplay(); // Afficher stats joueur à jour

        CombatManager.logMessage(`Attention ! Le boss de l'étage, ${currentBoss.name}, bloque le passage !`);

        // Activer les boutons d'action via main.js
        const attackBtnRef = document.getElementById('attack-button');
        if (attackBtnRef) attackBtnRef.disabled = false;
        const combatInvBtn = document.getElementById('combat-inventory-button');
         if(combatInvBtn) combatInvBtn.classList.remove('hidden');


        return true; // Combat démarré avec succès
    }

    /**
     * Termine le combat de boss actuel.
     * @param {boolean} playerWon - True si le joueur a gagné, false sinon.
     */
    function endBossCombat(playerWon) {
        if (!isBossCombatActive) return;

        // Vérification joueur global pour le butin
        if (typeof player === 'undefined' || player === null) {
             CombatManager.logMessage("Erreur : Fin de combat de boss sans joueur défini pour le butin.");
        }

        // Désactiver les boutons d'action
        const attackBtnRef = document.getElementById('attack-button');
        if (attackBtnRef) attackBtnRef.disabled = true;
        const combatInvBtn = document.getElementById('combat-inventory-button');
        if(combatInvBtn) combatInvBtn.classList.add('hidden');
        const combatInvList = document.getElementById('combat-inventory-list');
        if(combatInvList) combatInvList.classList.add('hidden');

        if (playerWon) {
            if (currentBoss && player && CombatManager.gainExperience) {
                // Gain d'XP et Or (via CombatManager)
                CombatManager.gainExperience(currentBoss.xpValue);
                player.gold += currentBoss.goldValue;
                CombatManager.logMessage(`Vous avez triomphé et recevez ${currentBoss.goldValue} pièces d'or !`);
                // Gérer loot spécial? (Ex: via InventoryManager)
                // if (typeof InventoryManager !== 'undefined' && InventoryManager.addItem) {
                //     InventoryManager.addItem({id: `boss_loot_${currentFloor}`, name: `Trophée de ${currentBoss.name}`, quantity: 1, effect: { action: 'passive', description: 'Preuve de victoire.'}});
                // }
                 CombatManager.updatePlayerStatsDisplay(); // Mettre à jour affichage
            }
        } else {
            // Gérer la défaite du joueur contre un boss
            CombatManager.logMessage("Game Over ! Le boss était trop puissant.");
            // La logique de Game Over est gérée dans main.js via le callback
        }

        // Cacher l'interface de combat après un délai et remettre le titre normal
        setTimeout(() => {
            if (bossCombatDisplayElement) bossCombatDisplayElement.classList.add('hidden');
            if (bossCombatTitle) bossCombatTitle.textContent = "Combat !"; // Remettre titre par défaut
        }, 2000); // Attend 2s

        // Réinitialiser l'état AVANT d'appeler le callback
        const callback = onBossCombatEndCallback;
        isBossCombatActive = false;
        currentBoss = null;
        onBossCombatEndCallback = null;

        // Appeler le callback
        if (callback) {
            callback(playerWon);
        }
    }

    // --- Gestion des événements ---
    // Pas de listeners directs ici, gérés par main.js


    // --- Interface Publique du Module ---
    return {
        startBossCombat: startBossCombat,
        isBossCombatActive: () => isBossCombatActive,
        // Fonctions appelées par main.js:
        playerAttackBoss: playerAttackBoss, // Pour le listener centralisé
        bossAttack: bossAttack,           // Pour la riposte après usage d'objet
        // Potentiellement utile pour des vérifications externes:
        generateBoss: generateBoss
    };

})(); // Fin de l'IIFE