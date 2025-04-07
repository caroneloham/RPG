// --- PARTIE DU CODE CONCERNANT LA BOUTIQUE ---

// --- Constantes pertinentes pour la boutique ---
const GAME_STATE = { /* ... autres états ..., */ SHOP: 'shop' /*, ... */ };
// NOTE: Les objets Items et Skills sont nécessaires car la boutique les utilise,
//       mais ils sont définis dans la partie principale du code.
// const Items = { ... }; // (Défini ailleurs)
// const Skills = { ... }; // (Défini ailleurs)

// --- DOM Elements (liés à la boutique) ---
const shopContent = document.getElementById('shop-content');
const shopModal = document.getElementById('shop-modal');
const modalBackdrop = document.getElementById('modal-backdrop'); // Aussi utilisé par d'autres modales potentiellement
const shopGoldDisplay = document.getElementById('shop-gold-display');
const shopBtn = document.getElementById('shop-btn'); // Bouton pour ouvrir la boutique depuis le HUB

// --- Variables d'état (références utilisées par la boutique) ---
// let player; // (Défini et géré ailleurs, contient player.gold, player.inventory, player.skills)
// let gameState; // (Défini et géré ailleurs)

// --- Fonctions de Rendu (spécifique à la boutique) ---

/**
 * Génère le contenu HTML de la fenêtre de la boutique.
 * Dépend de: player, Items, Skills, getSkillDescription, ShopManager, RARITIES (pour couleur potentielle future)
 */
function renderShop() {
    shopGoldDisplay.textContent = player.gold; // Met à jour l'or du joueur dans la modale
    let shopHTML = '';
    const itemCategories = { 'Armes': [], 'Armures': [], 'Consommables': [], 'Compétences': [], 'Vendre': [] };

    // Popule les catégories d'achat
    for (const id in Items) {
        const item = Items[id];
        if (item.type === 'weapon') itemCategories['Armes'].push(id);
        else if (item.type === 'armor') itemCategories['Armures'].push(id);
        else if (item.type === 'potion') itemCategories['Consommables'].push(id);
    }
    for (const id in Skills) {
        // Affiche seulement les compétences que le joueur n'a pas encore
        if (!player.skills.includes(id)) {
            itemCategories['Compétences'].push(id);
        }
    }

    // Popule la catégorie de vente (seulement armes/armures non équipées de l'inventaire)
    for(const itemId in player.inventory) {
        if(player.inventory[itemId] > 0 && Items[itemId] && (Items[itemId].type === 'weapon' || Items[itemId].type === 'armor')) {
            // Vérifie si l'item n'est pas actuellement équipé
            if(player.equipment.weapon !== itemId && player.equipment.armor !== itemId) {
                itemCategories['Vendre'].push(itemId);
            }
        }
    }

    // Génère le HTML pour chaque catégorie
    for (const categoryName in itemCategories) {
        if (itemCategories[categoryName].length > 0 || categoryName === 'Vendre') { // Affiche la section Vendre même si vide
            shopHTML += `<div class="shop-category"><h3>${categoryName}</h3>`;
            if (categoryName === 'Vendre') {
                shopHTML += '<p style="font-size: 0.9em; color: var(--text-medium);">Vendez votre équipement non utilisé (50% prix).</p>';
                if (itemCategories['Vendre'].length === 0) {
                    shopHTML += "<p><i>Rien à vendre pour le moment.</i></p>";
                }
            }

            // Génère le HTML pour chaque item dans la catégorie
            itemCategories[categoryName].forEach(id => {
                let item, cost, effectText, icon, actionButton;
                const isSelling = categoryName === 'Vendre';

                if (isSelling) {
                    item = Items[id];
                    cost = Math.floor(item.cost * 0.5); // Prix de vente = 50% du coût
                    effectText = `Quantité: ${player.inventory[id]}`;
                    icon = item.icon || '❓';
                    // Bouton pour vendre un exemplaire
                    actionButton = `<button class="shop-button modal-button" onclick="ShopManager.sellItem('${id}')">Vendre 1 (💰 ${cost})</button>`;
                } else if (categoryName === 'Compétences') {
                    item = Skills[id];
                    cost = item.cost;
                    // Utilise getSkillDescription (défini ailleurs) pour la description
                    effectText = getSkillDescription(item) + (item.type === 'active' ? ` (Coût: ${item.mpCost}💧)` : ' (Passif)');
                    icon = item.icon || '❓';
                    const canAfford = player.gold >= cost;
                    // Bouton pour apprendre la compétence, désactivé si pas assez d'or
                    actionButton = `<button class="shop-button modal-button" data-item-id="${id}" onclick="ShopManager.learnSkill('${id}')" ${!canAfford ? 'disabled' : ''}>Apprendre</button>`;
                } else { // Catégories d'items (Armes, Armures, Consommables)
                    item = Items[id];
                    cost = item.cost;
                    // Génère la description de l'effet
                    if (item.type === 'weapon') effectText = `Att +${item.attack || 0}${item.mpBonus ? ', PM Max +'+item.mpBonus : ''}`;
                    else if (item.type === 'armor') effectText = `Déf +${item.defense || 0}`;
                    else if (item.type === 'potion') effectText = item.effect === 'heal' ? `Soigne ${item.value} PV` : `Rend ${item.value} PM`;
                    else effectText = '';
                    icon = item.icon || '❓';
                    const canAfford = player.gold >= cost;
                    // Bouton pour acheter l'item, désactivé si pas assez d'or
                    actionButton = `<button class="shop-button modal-button" data-item-id="${id}" onclick="ShopManager.buyItem('${id}')" ${!canAfford ? 'disabled' : ''}>Acheter</button>`;
                }

                // Structure HTML pour un item dans la boutique
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
            shopHTML += `</div>`; // Fin de .shop-category
        }
    }
    shopContent.innerHTML = shopHTML; // Met à jour le contenu de la modale boutique
}


// --- Fonctions du GameManager liées à la boutique ---
// NOTE: Ces fonctions pourraient être dans ShopManager, mais elles gèrent l'état global du jeu (gameState)
//       donc elles sont laissées dans GameManager dans le code original.

const GameManager_ShopFunctions = {
    /**
     * Passe le jeu à l'état SHOP si le joueur est dans le HUB.
     * Dépend de: gameState, GAME_STATE, logMessage, renderAll
     */
    enterShop: function() {
        // Ne peut entrer dans la boutique que depuis le HUB
        if (gameState === GAME_STATE.HUB) {
            logMessage("Ouverture de la boutique...");
            gameState = GAME_STATE.SHOP; // Change l'état global du jeu
            renderAll(); // Redessine l'interface (qui affichera la modale via showView)
        } else {
            logMessage("La boutique n'est accessible qu'au Village.");
        }
    },

    /**
     * Quitte l'état SHOP et retourne au HUB.
     * Dépend de: gameState, GAME_STATE, logMessage, renderAll
     */
    exitShop: function() {
        if(gameState === GAME_STATE.SHOP) {
            logMessage("Fermeture de la boutique.");
            gameState = GAME_STATE.HUB; // Retourne à l'état HUB
            renderAll(); // Redessine l'interface (qui cachera la modale via showView)
        }
    },
};


// --- ShopManager Object (Logique métier de la boutique) ---

/**
 * Gère les actions d'achat, de vente et d'apprentissage dans la boutique.
 * Dépend de: player, Items, Skills, InventoryManager, logMessage, renderShop, renderStats, GameManager.saveGame, calculatePlayerStats
 */
const ShopManager = {
    /**
     * Gère l'achat d'un item.
     * @param {string} itemId - L'ID de l'item à acheter.
     */
    buyItem: function(itemId) {
        const item = Items[itemId];
        if (!item) {
            console.error("Tentative d'achat d'un item inconnu:", itemId);
            return;
        }
        if (player.gold >= item.cost) {
            player.gold -= item.cost;
            InventoryManager.addInventoryItem(itemId, 1); // Ajoute à l'inventaire (via InventoryManager)
            logMessage(`Achat: ${item.icon || '?'} ${item.name} (-${item.cost} ${TILE.GOLD}).`);
            renderShop(); // Met à jour l'affichage de la boutique (pour griser le bouton si besoin)
            renderStats(); // Met à jour l'affichage de l'or du joueur
            GameManager.saveGame(); // Sauvegarde la partie
        } else {
            logMessage(`Or insuffisant (${player.gold}/${item.cost}).`);
        }
    },

    /**
     * Gère la vente d'un item (arme ou armure non équipé).
     * @param {string} itemId - L'ID de l'item à vendre.
     */
    sellItem: function(itemId) {
        const item = Items[itemId];
        // Vérifications : item existe, joueur en possède, c'est une arme/armure
        if (!item || !player.inventory[itemId] || player.inventory[itemId] <= 0 || (item.type !== 'weapon' && item.type !== 'armor')) {
            logMessage("Impossible de vendre cet objet.");
            return;
        }
        // Vérification : l'item n'est pas équipé
        if(player.equipment.weapon === itemId || player.equipment.armor === itemId) {
            logMessage(`Veuillez déséquiper ${item.name} avant de le vendre.`);
            return;
        }

        const sellPrice = Math.floor(item.cost * 0.5); // Calcul du prix de vente
        player.inventory[itemId]--; // Retire 1 de l'inventaire
        player.gold += sellPrice; // Ajoute l'or
        logMessage(`Vente: ${item.icon || '?'} ${item.name} (+${sellPrice} ${TILE.GOLD}).`);

        // Si la quantité tombe à 0, retire l'entrée de l'inventaire
        if (player.inventory[itemId] <= 0) {
            delete player.inventory[itemId];
        }

        renderShop(); // Met à jour l'affichage de la boutique (l'item disparaît de la vente si quantité = 0)
        renderStats(); // Met à jour l'affichage de l'or
        GameManager.saveGame(); // Sauvegarde
    },

    /**
     * Gère l'apprentissage d'une compétence.
     * @param {string} skillId - L'ID de la compétence à apprendre.
     */
    learnSkill: function(skillId) {
        const skill = Skills[skillId];
        // Vérifications : compétence existe, le joueur ne l'a pas déjà
        if (!skill || player.skills.includes(skillId)) {
            console.error("Tentative d'apprendre une compétence invalide ou déjà connue:", skillId);
            return;
        }
        if (player.gold >= skill.cost) {
            player.gold -= skill.cost;
            player.skills.push(skillId); // Ajoute la compétence à la liste du joueur
            logMessage(`Appris: ${skill.icon || '?'} ${skill.name} (-${skill.cost} ${TILE.GOLD}).`);

            // Si la compétence est passive, applique immédiatement ses effets (ex: recalculer stats max)
            if (skill.type === 'passive' && skill.effect === 'stat_boost') {
                logMessage(`Effet passif ${skill.name} actif !`);
                // Recalcule les stats pour potentiellement ajuster PV/PM actuels si les max changent
                const oldStats = calculatePlayerStats(); // Probablement défini ailleurs
                // (L'ajout de la compétence affecte calculatePlayerStats)
                const newStats = calculatePlayerStats();
                // Restaure une partie des PV/PM si les max ont augmenté (évite la mort par gain de PV max)
                 player.hp = Math.min(player.hp + Math.max(0, newStats.maxHp - oldStats.maxHp), newStats.maxHp);
                 player.mp = Math.min(player.mp + Math.max(0, newStats.maxMp - oldStats.maxMp), newStats.maxMp);
            }

            renderShop(); // Met à jour la boutique (la compétence disparaît de la liste)
            renderAll(); // Redessine tout (stats, potentiellement inventaire/compétences si visibles)
            GameManager.saveGame(); // Sauvegarde
        } else {
            logMessage(`Or insuffisant (${player.gold}/${skill.cost}).`);
        }
    }
};

// --- Code d'initialisation ou appels (Exemples de comment c'est utilisé ailleurs) ---
/*
// Dans GameManager.initialize ou via un bouton HTML:
// shopBtn.addEventListener('click', GameManager_ShopFunctions.enterShop); // Hypothetical button binding

// Dans renderAll (fonction de rendu principale):
switch (gameState) {
    // ... autres cas ...
    case GAME_STATE.SHOP:
        showView(null); // Cache la vue principale (map, combat, etc.)
        renderShop(); // Appelle le rendu spécifique de la boutique
        break;
    // ...
}

// Dans showView (gestion de l'affichage):
if (gameState === GAME_STATE.SHOP) {
    shopModal.style.display = 'flex'; // Affiche la modale boutique
    modalBackdrop.style.display = 'block'; // Affiche le fond
} else {
    shopModal.style.display = 'none'; // Cache la modale boutique
    modalBackdrop.style.display = 'none'; // Cache le fond (si aucune autre modale n'est active)
}

// Dans GameManager.handleInput (gestion clavier):
if (event.key === 'Escape') {
    if (gameState === GAME_STATE.SHOP) GameManager_ShopFunctions.exitShop(); // Ferme la boutique avec Echap
    // ... autres cas ...
}

// N'oubliez pas que les fonctions comme getSkillDescription, logMessage, renderAll, renderStats,
// calculatePlayerStats, et l'objet InventoryManager doivent être définis dans le reste de votre code.
*/
