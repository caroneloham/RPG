// shop.js
/**
 * Module pour la gestion de la boutique du jeu.
 * Permet au joueur d'acheter des objets et des améliorations avec de l'or.
 */

// Accès à l'objet joueur (supposé global ou importé)
// let player = ...

// Accès aux fonctions d'autres modules (supposés disponibles)
// CombatManager.logMessage(...)
// CombatManager.updatePlayerStatsDisplay(...)
// InventoryManager.addItem(...) // Sera défini à l'étape suivante

const ShopManager = (() => {

    // Récupération des éléments du DOM
    const shopDisplay = document.getElementById('shop-display');
    const shopItemList = document.getElementById('shop-items');
    const closeShopButton = document.getElementById('close-shop-button');
    const openShopButton = document.getElementById('open-shop-button'); // Bouton pour ouvrir la boutique

    let isShopOpen = false;

    // --- Données des objets de la boutique ---
    // Structure: id, name, description, cost, type ('item', 'upgrade'), effect (data ou fonction)
    const shopItemsData = [
        {
            id: 'potion_heal_1',
            name: "Potion de Soins Mineure",
            description: "Restaure 25 HP.",
            cost: 50,
            type: 'item',
            effect: { action: 'heal', amount: 25 } // Données pour InventoryManager
        },
        {
            id: 'potion_heal_2',
            name: "Potion de Soins Majeure",
            description: "Restaure 75 HP.",
            cost: 120,
            type: 'item',
            effect: { action: 'heal', amount: 75 }
        },
        {
            id: 'upgrade_attack_1',
            name: "Affûtage d'Arme",
            description: "Augmente l'Attaque de +2.",
            cost: 200,
            type: 'upgrade',
            effect: { stat: 'attack', amount: 2 } // Affecte directement le joueur
        },
        {
            id: 'upgrade_defense_1',
            name: "Renfort d'Armure",
            description: "Augmente la Défense de +1.",
            cost: 150,
            type: 'upgrade',
            effect: { stat: 'defense', amount: 1 }
        },
        {
            id: 'upgrade_maxhp_1',
            name: "Endurance Accrue",
            description: "Augmente les HP Max de +15.",
            cost: 180,
            type: 'upgrade',
            effect: { stat: 'maxHp', amount: 15 } // Augmente maxHP, pourrait aussi soigner un peu?
        },
        // Ajouter d'autres objets/améliorations ici...
        // Exemple : objet clé, équipement simple, etc.
    ];

    /**
     * Affiche les objets disponibles dans la boutique.
     */
    function displayShop() {
        if (!player) return; // S'assurer que le joueur existe

        shopItemList.innerHTML = ''; // Vider la liste actuelle

        shopItemsData.forEach(item => {
            const li = document.createElement('li');

            // Informations sur l'objet
            const itemInfo = document.createElement('span');
            itemInfo.textContent = `${item.name} (${item.description}) - Coût: ${item.cost} Or`;

            // Bouton d'achat
            const buyButton = document.createElement('button');
            buyButton.textContent = 'Acheter';
            buyButton.dataset.itemId = item.id; // Stocke l'ID de l'objet dans le bouton
            buyButton.classList.add('buy-button'); // Ajoute une classe pour le listener

            // Vérifier si le joueur peut se permettre l'objet
            if (player.gold < item.cost) {
                buyButton.disabled = true; // Désactiver si pas assez d'or
                buyButton.textContent = 'Fonds insuffisants';
            }

            li.appendChild(itemInfo);
            li.appendChild(buyButton);
            shopItemList.appendChild(li);
        });
    }

    /**
     * Gère la logique d'achat d'un objet.
     * @param {string} itemId - L'ID de l'objet à acheter.
     */
    function buyItem(itemId) {
        if (!player) return;

        const item = shopItemsData.find(i => i.id === itemId);
        if (!item) {
            console.error(`Objet inconnu : ${itemId}`);
            return;
        }

        // Vérifier à nouveau si le joueur a assez d'or (sécurité)
        if (player.gold >= item.cost) {
            // 1. Déduire l'or
            player.gold -= item.cost;
            CombatManager.logMessage(`Vous avez acheté ${item.name} pour ${item.cost} Or.`);

            // 2. Appliquer l'effet de l'objet
            if (item.type === 'item') {
                // Ajouter à l'inventaire (via InventoryManager)
                if (typeof InventoryManager !== 'undefined' && InventoryManager.addItem) {
                    // Passe le nom, et potentiellement l'effet pour l'utilisation future
                    InventoryManager.addItem({ id: item.id, name: item.name, effect: item.effect });
                     CombatManager.logMessage(`${item.name} ajouté à l'inventaire.`);
                } else {
                    console.warn("InventoryManager.addItem n'est pas disponible pour ajouter l'objet.");
                    // Solution temporaire : loguer l'achat
                    CombatManager.logMessage(`(Inventaire non implémenté) ${item.name} serait ajouté.`);
                }
            } else if (item.type === 'upgrade') {
                // Appliquer directement l'amélioration au joueur
                const stat = item.effect.stat;
                const amount = item.effect.amount;
                if (player.hasOwnProperty(stat)) {
                    player[stat] += amount;
                    CombatManager.logMessage(`Votre ${stat} a augmenté de +${amount} !`);
                     // Si maxHp augmente, on peut aussi soigner le joueur du montant augmenté
                     if (stat === 'maxHp') {
                         player.hp += amount; // Le joueur gagne aussi des HP actuels
                     }
                } else {
                    console.warn(`Statistique inconnue : ${stat} pour l'amélioration ${item.name}`);
                }
            }

            // 3. Mettre à jour l'affichage des stats du joueur (or, et stats si upgrade)
            CombatManager.updatePlayerStatsDisplay();

            // 4. Réactualiser l'affichage de la boutique (pour potentiellement désactiver des boutons)
            displayShop();

        } else {
            // Pas assez d'or
            CombatManager.logMessage(`Vous n'avez pas assez d'or pour acheter ${item.name}.`);
            // On pourrait aussi faire vibrer le bouton ou autre feedback
        }
    }

    /**
     * Ouvre l'interface de la boutique.
     */
    function openShop() {
        if (CombatManager.isCombatActive() || BossCombatManager.isBossCombatActive()) {
            CombatManager.logMessage("Vous ne pouvez pas accéder à la boutique pendant un combat.");
            return;
        }
         // On pourrait aussi vérifier si le joueur est sur une case "boutique" spécifique ?
         // Pour l'instant, on permet l'accès via bouton.

        displayShop(); // Remplir la boutique avec les objets
        shopDisplay.style.display = 'block'; // Afficher la section boutique
        isShopOpen = true;
        CombatManager.logMessage("Bienvenue à la boutique !");
        // Peut-être désactiver d'autres interactions (mouvement ?)
    }

    /**
     * Ferme l'interface de la boutique.
     */
    function closeShop() {
        shopDisplay.style.display = 'none'; // Cacher la section boutique
        isShopOpen = false;
        CombatManager.logMessage("Vous quittez la boutique.");
        // Réactiver d'autres interactions si nécessaire
    }

    // --- Gestionnaires d'événements ---

    // Listener pour le bouton de fermeture
    closeShopButton.addEventListener('click', closeShop);

    // Listener pour le bouton d'ouverture (si présent)
     if (openShopButton) {
         openShopButton.addEventListener('click', () => {
             if (isShopOpen) {
                 closeShop(); // Si déjà ouvert, le bouton sert à fermer
             } else {
                 openShop(); // Sinon, il ouvre
             }
         });
     }


    // Listener délégué pour les boutons d'achat (plus efficace que d'ajouter un listener par bouton)
    shopItemList.addEventListener('click', (event) => {
        // Vérifier si l'élément cliqué est bien un bouton d'achat
        if (event.target.classList.contains('buy-button')) {
            const itemId = event.target.dataset.itemId;
            if (itemId) {
                buyItem(itemId);
            }
        }
    });

    // --- Interface Publique du Module ---
    return {
        openShop: openShop,
        closeShop: closeShop,
        isShopOpen: () => isShopOpen,
        // Potentiellement exposer une fonction pour ajouter/modifier les items de la boutique dynamiquement
        // refreshShopDisplay: displayShop // Si l'or change en dehors d'un achat
    };

})(); // Fin de l'IIFE

// Exemple d'appel pour ouvrir la boutique (pourrait être lié à un bouton ou une case spéciale)
// ShopManager.openShop();