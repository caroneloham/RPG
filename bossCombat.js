// bossCombat.js
/**
 * Module pour la gestion des combats contre les Boss.
 * Déclenché tous les 5 étages, avec des ennemis plus puissants et des récompenses accrues.
 * La logique est similaire à combat.js mais adaptée pour les boss.
 */

// Réutiliser l'objet player défini globalement ou dans combat.js
// Assurez-vous que 'player' est accessible ici.
// let player = ... (on suppose qu'il est déjà défini et accessible)

// Récupération des éléments du DOM (les mêmes que pour combat.js, car on réutilise l'affichage)
const bossCombatDisplay = document.getElementById('combat-display'); // On réutilise le même conteneur
const bossCombatTitle = bossCombatDisplay.querySelector('h2'); // Pour changer le titre
const bossEnemyNameDisplay = document.getElementById('enemy-name');
const bossEnemyHpDisplay = document.getElementById('enemy-hp');
const bossEnemyMaxHpDisplay = document.getElementById('enemy-max-hp');
const bossAttackButton = document.getElementById('attack-button'); // On réutilise le même bouton
// Récupération du log du jeu (supposant qu'il est géré par CombatManager ou un module global)
// Pour l'instant, on suppose l'existence de CombatManager.logMessage
// et CombatManager.updatePlayerStatsDisplay pour la simplicité.
// Idéalement, un module de logging/UI dédié serait mieux.

const BossCombatManager = (() => {

    let currentBoss = null; // Le boss actuellement combattu
    let isBossCombatActive = false; // Indicateur si un combat de boss est en cours
    let onBossCombatEndCallback = null; // Callback à appeler à la fin du combat

    // --- Base de données ou Générateur de Boss ---
    // Définit les caractéristiques des boss en fonction de l'étage.
    // Ceci est un exemple simple, pourrait être plus complexe.
    const bossData = {
        5: { name: "Gardien du Seuil", hpMultiplier: 5, attackMultiplier: 1.5, defenseMultiplier: 1.2, xpMultiplier: 5, goldMultiplier: 10, specialAbilityChance: 0.1 },
        10: { name: "Géant de Pierre", hpMultiplier: 8, attackMultiplier: 1.8, defenseMultiplier: 1.5, xpMultiplier: 8, goldMultiplier: 15, specialAbilityChance: 0.15 },
        15: { name: "Hydre des Profondeurs", hpMultiplier: 12, attackMultiplier: 2.0, defenseMultiplier: 1.8, xpMultiplier: 12, goldMultiplier: 20, specialAbilityChance: 0.2 },
        // Ajouter d'autres boss pour les étages supérieurs...
    };

    /**
     * Génère les statistiques d'un boss pour un étage donné.
     * @param {number} floorNumber - Le numéro de l'étage (doit être un multiple de 5).
     * @returns {object|null} - L'objet boss avec ses statistiques, ou null si ce n'est pas un étage de boss.
     */
    function generateBoss(floorNumber) {
        if (floorNumber % 5 !== 0 || !bossData[floorNumber]) {
            console.warn(`Pas de boss défini pour l'étage ${floorNumber}.`);
            // Pourrait générer un boss générique basé sur l'étage si besoin
            // Exemple : Boss générique
            const baseHp = 50;
            const baseAttack = 10;
            const baseDefense = 5;
            const baseXP = 100;
            const baseGold = 50;
            const scale = floorNumber / 5; // Facteur de difficulté basé sur l'étage
            return {
                name: `Boss de l'étage ${floorNumber}`,
                hp: Math.round(baseHp * scale * 3), // Plus de HP
                maxHp: Math.round(baseHp * scale * 3),
                attack: Math.round(baseAttack * scale * 1.5), // Plus d'attaque
                defense: Math.round(baseDefense * scale * 1.2), // Plus de défense
                xpValue: Math.round(baseXP * scale * 2), // Plus d'XP
                goldValue: Math.round(baseGold * scale * 3), // Plus d'Or
                specialAbilityChance: 0.1 * scale, // Chance d'attaque spéciale augmente
                isBoss: true
            };
           // return null; // Ou renvoyer un boss générique
        }

        const template = bossData[floorNumber];
        // Calcul des stats basé sur les stats de base d'un ennemi standard du niveau ?
        // Ou basé sur des valeurs fixes multipliées. Choisissons la 2e option pour l'instant.
        // Supposons des stats de base pour un "ennemi normal" à cet étage
        const baseStats = EnemyManager.getBaseStatsForFloor(floorNumber); // Suppose l'existence de cette fonction

        return {
            name: template.name,
            hp: Math.round(baseStats.hp * template.hpMultiplier),
            maxHp: Math.round(baseStats.hp * template.hpMultiplier),
            attack: Math.round(baseStats.attack * template.attackMultiplier),
            defense: Math.round(baseStats.defense * template.defenseMultiplier),
            xpValue: Math.round(baseStats.xpValue * template.xpMultiplier),
            goldValue: Math.round(baseStats.goldValue * template.goldMultiplier),
            specialAbilityChance: template.specialAbilityChance,
            isBoss: true // Marqueur pour identifier un boss
        };
    }

    /**
     * Met à jour l'affichage des informations du boss.
     */
    function updateBossDisplay() {
        if (!currentBoss || !isBossCombatActive) return;
        bossEnemyNameDisplay.textContent = `${currentBoss.name} (BOSS)`; // Ajoute (BOSS)
        bossEnemyHpDisplay.textContent = currentBoss.hp;
        bossEnemyMaxHpDisplay.textContent = currentBoss.maxHp;
    }

    /**
     * Calcule les dégâts infligés (peut être identique à combat.js).
     * @param {number} attackerAttack - Statistique d'attaque de l'attaquant.
     * @param {number} defenderDefense - Statistique de défense du défenseur.
     * @returns {number} - Les dégâts infligés.
     */
    function calculateDamage(attackerAttack, defenderDefense) {
        // On peut réutiliser la même formule que pour les combats normaux
        // ou la rendre légèrement différente pour les boss.
        const damage = Math.max(1, attackerAttack - defenderDefense);
        const variation = Math.random() * 0.2 - 0.1; // +/- 10% variation
        return Math.round(damage * (1 + variation));
    }

    /**
     * Gère l'action d'attaque du joueur contre le boss.
     */
    function playerAttackBoss() {
        if (!isBossCombatActive || !currentBoss || player.hp <= 0) return;

        // 1. Calculer les dégâts infligés par le joueur
        const damageDealt = calculateDamage(player.attack, currentBoss.defense);
        currentBoss.hp = Math.max(0, currentBoss.hp - damageDealt);
        CombatManager.logMessage(`Vous attaquez le boss ${currentBoss.name} et infligez ${damageDealt} points de dégâts.`); // Utilisation du logger partagé
        updateBossDisplay();

        // 2. Vérifier si le boss est vaincu
        if (currentBoss.hp <= 0) {
            CombatManager.logMessage(`Vous avez vaincu le puissant ${currentBoss.name} !`);
            endBossCombat(true); // Le joueur a gagné
            return; // Combat terminé
        }

        // 3. Si le boss survit, il attaque
        bossAttack();
    }

    /**
     * Gère l'action d'attaque du boss (peut inclure des compétences spéciales).
     */
    function bossAttack() {
        if (!isBossCombatActive || !currentBoss || currentBoss.hp <= 0 || player.hp <= 0) return;

        // Décider si le boss utilise une attaque spéciale
        if (Math.random() < currentBoss.specialAbilityChance) {
            executeBossSpecialAbility(); // Implémenter cette fonction
        } else {
            // Attaque normale
            const damageTaken = calculateDamage(currentBoss.attack, player.defense);
            player.hp = Math.max(0, player.hp - damageTaken);
            CombatManager.logMessage(`Le boss ${currentBoss.name} vous attaque et inflige ${damageTaken} points de dégâts.`);
            CombatManager.updatePlayerStatsDisplay(); // Met à jour l'affichage joueur
        }


        // Vérifier si le joueur est vaincu
        if (player.hp <= 0) {
            CombatManager.logMessage(`Vous avez été écrasé par ${currentBoss.name}...`);
            endBossCombat(false); // Le joueur a perdu
        }
    }

    /**
     * Exécute une capacité spéciale du boss (à développer).
     */
    function executeBossSpecialAbility() {
        // Exemple simple : une attaque plus puissante
        const damageMultiplier = 1.5; // Attaque spéciale fait 50% de dégâts en plus
        const damageTaken = calculateDamage(currentBoss.attack * damageMultiplier, player.defense);
        player.hp = Math.max(0, player.hp - damageTaken);

        CombatManager.logMessage(`Attaque spéciale ! ${currentBoss.name} utilise [Nom Capacité] et vous inflige ${damageTaken} points de dégâts !`);
        CombatManager.updatePlayerStatsDisplay();

        // Autres idées de capacités spéciales :
        // - Réduction de la défense du joueur temporairement
        // - Vol de vie
        // - Invocation d'aides (non géré pour l'instant)
        // - Attaque de zone (si plusieurs personnages jouables)
        // - Auto-buff (augmentation attaque/défense)
    }

    /**
     * Initialise et démarre un combat contre un boss spécifique.
     * @param {number} floorNumber - Le numéro de l'étage du boss.
     * @param {function} onEndCallback - Fonction à appeler lorsque le combat se termine.
     * @returns {boolean} - True si le combat a pu démarrer, false sinon.
     */
    function startBossCombat(floorNumber, onEndCallback) {
        const boss = generateBoss(floorNumber);
        if (!boss) {
            console.error(`Impossible de générer le boss pour l'étage ${floorNumber}.`);
            // Appeler le callback avec une indication d'échec ou de non-combat?
            if (onEndCallback) onEndCallback(true); // Considérer comme "gagné" car pas de combat
            return false;
        }
         if (isBossCombatActive || CombatManager.isCombatActive()) {
             console.error("Impossible de démarrer le combat de boss : un autre combat est déjà en cours.");
             return false;
         }


        currentBoss = boss;
        isBossCombatActive = true;
        onBossCombatEndCallback = onEndCallback;

        // Afficher l'interface de combat et adapter le titre
        bossCombatDisplay.style.display = 'block'; // Assurez-vous qu'il est visible
        bossCombatTitle.textContent = "COMBAT DE BOSS !"; // Changer le titre
        updateBossDisplay();
        CombatManager.updatePlayerStatsDisplay(); // Afficher stats joueur à jour

        CombatManager.logMessage(`Attention ! Le boss de l'étage, ${currentBoss.name}, bloque le passage !`);

        // Activer le bouton d'attaque (on réutilise le même bouton)
        bossAttackButton.disabled = false;
        // Important : Il faudra s'assurer que le listener du bouton d'attaque dans combat.js
        // ne réagit pas pendant un combat de boss, et vice-versa.
        // Une solution est d'avoir une seule fonction qui gère le clic et redirige
        // vers playerAttack() ou playerAttackBoss() selon l'état (isCombatActive vs isBossCombatActive).
        // Pour l'instant, on suppose que le listener de combat.js est inactif ou gère ce cas.
        // (Voir Étape 7 pour une meilleure gestion des listeners)

        return true;
    }

    /**
     * Termine le combat de boss actuel.
     * @param {boolean} playerWon - True si le joueur a gagné, false sinon.
     */
    function endBossCombat(playerWon) {
        if (!isBossCombatActive) return;

        isBossCombatActive = false;
        bossAttackButton.disabled = true; // Désactiver action

        if (playerWon) {
            // Gain d'XP et d'or (plus important pour les boss)
            CombatManager.gainExperience(currentBoss.xpValue); // Utilise la fonction de combat.js
            player.gold += currentBoss.goldValue;
            CombatManager.logMessage(`Vous avez triomphé et recevez ${currentBoss.goldValue} pièces d'or !`);
            // Potentiellement, gain d'objets spéciaux (à gérer avec l'inventaire)
            // InventoryManager.addItem(obtenirLootSpecialBoss());
             CombatManager.updatePlayerStatsDisplay(); // Mettre à jour affichage

        } else {
            // Gérer la défaite du joueur contre un boss
            CombatManager.logMessage("Game Over ! Le boss était trop puissant.");
            alert("Vous avez été vaincu par le Boss ! Rechargez la page pour réessayer."); // Temporaire
            // Logique de Game Over
        }

        // Cacher l'interface de combat après un délai et remettre le titre normal
        setTimeout(() => {
            bossCombatDisplay.style.display = 'none';
            bossCombatTitle.textContent = "Combat !"; // Remettre le titre par défaut
        }, 2000); // Attend 2s

        // Appeler le callback de fin de combat s'il existe
        if (onBossCombatEndCallback) {
            onBossCombatEndCallback(playerWon);
            onBossCombatEndCallback = null;
        }

        currentBoss = null;
    }


    // --- Gestion des événements (problème potentiel avec combat.js) ---
    // Solution possible : Avoir un gestionnaire centralisé dans main.js ou
    // que le listener vérifie quel type de combat est actif.
    // Pour l'instant, on suppose que le listener de combat.js suffit et qu'il
    // appellera playerAttackBoss si isBossCombatActive est true.
    // CELA NECESSITERA UNE MODIFICATION DANS combat.js ou une gestion centralisée.

    // Modification suggérée pour le listener dans combat.js :
    /*
    attackButton.addEventListener('click', () => {
        if (CombatManager.isCombatActive()) {
            CombatManager.playerAttack(); // Appel interne à combat.js
        } else if (BossCombatManager.isBossCombatActive()) {
            BossCombatManager.playerAttackBoss(); // Appel à ce module
        }
    });
    */
    // Il faudrait donc exposer playerAttackBoss publiquement si on adopte cette approche.


    // --- Interface Publique du Module ---
    return {
        startBossCombat: startBossCombat,
        isBossCombatActive: () => isBossCombatActive,
        // Exposer la fonction d'attaque joueur pour le listener centralisé (si besoin)
        playerAttackBoss: playerAttackBoss,
         // Exposer la fonction de génération pour d'éventuels besoins externes
         generateBoss: generateBoss
    };

})(); // Fin de l'IIFE

// Exemple d'utilisation (typiquement appelé par la logique principale quand le joueur atteint l'étage N*5)
/*
const currentFloor = 5; // A récupérer dynamiquement
if (currentFloor % 5 === 0) {
    // Essayer de démarrer le combat de boss
    const bossStarted = BossCombatManager.startBossCombat(currentFloor, (playerWon) => {
        console.log("Combat de Boss terminé. Le joueur a gagné :", playerWon);
        if (playerWon) {
            // Permettre au joueur de descendre à l'étage suivant
        } else {
            // Gérer le game over
        }
    });
    if (!bossStarted) {
        // Gérer le cas où le combat n'a pas pu démarrer (ex: autre combat en cours)
    }
}
*/
// Dans bossCombat.js, modifier l'interface publique :
return {
    startBossCombat: startBossCombat,
    isBossCombatActive: () => isBossCombatActive,
    playerAttackBoss: playerAttackBoss, // <-- Exposer cette fonction
    generateBoss: generateBoss
    // Pas de listener à gérer ici
};
