// inventory.js
/**
 * Module pour la gestion de l'inventaire du joueur.
 * Permet d'ajouter, supprimer, utiliser et afficher les objets possédés.
 */

// Accès à l'objet joueur (supposé global ou importé)
// let player = ...

// Accès aux fonctions d'autres modules (supposés disponibles)
// CombatManager.logMessage(...)
// CombatManager.updatePlayerStatsDisplay()
// CombatManager.setPlayerHp() // Fonction pour modifier directement les HP du joueur

const InventoryManager = (() => {

    // Récupération des éléments du DOM
    const inventoryDisplay = document.getElementById('inventory-display');
    const inventoryItemList = document.getElementById('inventory-items');
    const closeInventoryButton = document.getElementById('close-inventory-button');
    const openInventoryButton = document.getElementById('open-inventory-button'); // Bouton principal pour ouvrir

    let isInventoryOpen = false;

    // --- Structure de données de l'inventaire ---
    // Tableau d'objets. Chaque objet a au moins: id, name, quantity, effect
    let playerInventory = [];
    /* Exemple d'entrée :
    {
        id: 'potion_heal_1',
        name: "Potion de Soins Mineure",
        quantity: 3,
        effect: { action: 'heal', amount: 25 }
    }
    */

    /**
     * Ajoute un objet à l'inventaire. Gère l'empilement.
     * @param {object} itemToAdd - L'objet à ajouter. Doit avoir {id, name, effect}. Quantity est optionnelle (défaut 1).
     */
    function addItem(itemToAdd) {
        if (!itemToAdd || !itemToAdd.id || !itemToAdd.name) {
            console.error("Tentative d'ajout d'un objet invalide:", itemToAdd);
            return;
        }

        const quantityToAdd = itemToAdd.quantity || 1; // Quantité par défaut est 1

        // Chercher si un objet avec le même ID existe déjà
        const existingItem = playerInventory.find(item => item.id === itemToAdd.id);

        if (existingItem) {
            // Si l'objet existe, augmenter la quantité
            existingItem.quantity += quantityToAdd;
        } else {
            // Sinon, ajouter le nouvel objet au tableau
            // Assure que l'objet ajouté a une propriété quantity
            playerInventory.push({
                ...itemToAdd, // Copie les propriétés de itemToAdd (id, name, effect)
                quantity: quantityToAdd // Définit la quantité
            });
        }

        // Optionnel : Journaliser l'ajout (peut être fait par le module appelant, ex: ShopManager)
        // CombatManager.logMessage(`${itemToAdd.name} ajouté à l'inventaire.`);

        // Si l'inventaire est ouvert, le rafraîchir
        if (isInventoryOpen) {
            displayInventory();
        }
    }

    /**
     * Supprime une certaine quantité d'un objet de l'inventaire.
     * @param {string} itemId - L'ID de l'objet à supprimer.
     * @param {number} [quantityToRemove=1] - La quantité à supprimer (par défaut 1).
     * @returns {boolean} - True si la suppression a réussi, false sinon.
     */
    function removeItem(itemId, quantityToRemove = 1) {
        const itemIndex = playerInventory.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            const item = playerInventory[itemIndex];
            if (item.quantity >= quantityToRemove) {
                item.quantity -= quantityToRemove;
                // Si la quantité tombe à 0 ou moins, supprimer complètement l'objet
                if (item.quantity <= 0) {
                    playerInventory.splice(itemIndex, 1); // Supprime l'élément du tableau
                }
                // Si l'inventaire est ouvert, le rafraîchir
                 if (isInventoryOpen) {
                    displayInventory();
                 }
                return true; // Suppression réussie
            } else {
                // Pas assez d'objets pour supprimer la quantité demandée
                console.warn(`Pas assez de ${item.name} pour en supprimer ${quantityToRemove}.`);
                return false;
            }
        } else {
            // Objet non trouvé
            console.warn(`Tentative de suppression d'un objet non possédé: ${itemId}`);
            return false;
        }
    }

    /**
     * Utilise un objet de l'inventaire en appliquant son effet.
     * @param {string} itemId - L'ID de l'objet à utiliser.
     */
    function useItem(itemId) {
        const itemIndex = playerInventory.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            const item = playerInventory[itemIndex];

            // Appliquer l'effet de l'objet
            if (applyItemEffect(item)) {
                // Si l'effet a été appliqué avec succès, consommer l'objet
                 CombatManager.logMessage(`Vous avez utilisé ${item.name}.`);
                removeItem(itemId, 1); // Supprime une unité de l'objet
                // Note: removeItem gère déjà la mise à jour de l'affichage si nécessaire
            } else {
                 // L'effet n'a pas pu être appliqué (ex: HP déjà max)
                 // Pas besoin de consommer l'objet dans ce cas.
            }
        } else {
            CombatManager.logMessage(`Vous n'avez pas de ${itemId} à utiliser.`); // Devrait pas arriver si l'UI est correcte
        }
    }

    /**
     * Applique l'effet d'un objet sur le joueur.
     * @param {object} item - L'objet dont l'effet doit être appliqué.
     * @returns {boolean} - True si l'effet a été appliqué, false sinon (ex: HP max).
     */
    function applyItemEffect(item) {
        if (!item.effect || !player) return false;

        const effect = item.effect;
        let effectApplied = false;

        switch (effect.action) {
            case 'heal':
                if (player.hp < player.maxHp) {
                    const healAmount = effect.amount;
                    const healedHp = Math.min(player.maxHp, player.hp + healAmount); // Ne pas dépasser maxHp
                    const actualHeal = healedHp - player.hp; // Combien de HP ont réellement été restaurés
                    // Utiliser la fonction dédiée de CombatManager s'il y en a une, sinon modifier directement
                    if(typeof CombatManager !== 'undefined' && CombatManager.setPlayerHp) {
                         CombatManager.setPlayerHp(healedHp);
                    } else {
                         player.hp = healedHp; // Modification directe (moins propre)
                         CombatManager.updatePlayerStatsDisplay(); // Mise à jour manuelle si pas de setPlayerHp
                    }
                    CombatManager.logMessage(`Vous récupérez ${actualHeal} points de vie.`);
                    effectApplied = true;
                } else {
                    CombatManager.logMessage("Vos points de vie sont déjà au maximum.");
                    effectApplied = false; // L'effet n'a pas été "utile"
                }
                break;
            // Ajouter d'autres types d'effets ici (ex: buff temporaire, cure poison, etc.)
            // case 'buff':
            //    // Logique pour appliquer un buff (peut nécessiter une gestion des effets actifs)
            //    CombatManager.logMessage(`Vous vous sentez plus fort ! (${item.name})`);
            //    effectApplied = true;
            //    break;
            default:
                console.warn(`Effet inconnu ou non géré: ${effect.action}`);
                CombatManager.logMessage(`L'objet ${item.name} ne semble rien faire...`);
                effectApplied = false; // Considéré comme non appliqué si l'action est inconnue
        }

        return effectApplied;
    }


    /**
     * Affiche les objets de l'inventaire dans le DOM.
     */
    function displayInventory() {
        inventoryItemList.innerHTML = ''; // Vider la liste actuelle

        if (playerInventory.length === 0) {
            inventoryItemList.innerHTML = '<li>Votre inventaire est vide.</li>';
            return;
        }

        playerInventory.forEach(item => {
            const li = document.createElement('li');

            // Informations sur l'objet
            const itemInfo = document.createElement('span');
            itemInfo.textContent = `${item.name} (x${item.quantity}) - ${item.effect?.description || 'Effet non défini'}`;
            // Ajout de ?. pour sécurité si effect est manquant

            // Bouton d'utilisation
            const useButton = document.createElement('button');
            useButton.textContent = 'Utiliser';
            useButton.dataset.itemId = item.id; // Stocke l'ID pour le listener
            useButton.classList.add('use-button'); // Classe pour le listener délégué

            // On pourrait désactiver le bouton si l'objet n'est pas utilisable (ex: clé)
            // ou si certaines conditions ne sont pas remplies (ex: utiliser potion si HP max?)
            if (!item.effect || item.effect.action === 'passive') { // Exemple: objet passif ou clé
                // useButton.disabled = true;
                 // useButton.textContent = 'Non utilisable';
            }
             // Désactiver utilisation de potion de soin si HP max
             if (item.effect?.action === 'heal' && player.hp >= player.maxHp) {
                 useButton.disabled = true;
             }


            li.appendChild(itemInfo);
            li.appendChild(useButton);
            inventoryItemList.appendChild(li);
        });
    }

    /**
     * Ouvre l'interface de l'inventaire.
     */
    function openInventory() {
        // On pourrait vouloir empêcher l'ouverture pendant certaines actions (combat?)
         if (CombatManager.isCombatActive() || BossCombatManager.isBossCombatActive()) {
             CombatManager.logMessage("Vous ne pouvez pas ouvrir l'inventaire pendant un combat !");
             // Note: L'utilisation d'objets EN COMBAT devrait être gérée différemment (ex: bouton dans l'UI de combat)
             return;
         }

        displayInventory(); // Mettre à jour le contenu
        inventoryDisplay.style.display = 'block'; // Afficher
        isInventoryOpen = true;
        // CombatManager.logMessage("Inventaire ouvert.");
    }

    /**
     * Ferme l'interface de l'inventaire.
     */
    function closeInventory() {
        inventoryDisplay.style.display = 'none'; // Cacher
        isInventoryOpen = false;
        // CombatManager.logMessage("Inventaire fermé.");
    }

    // --- Gestionnaires d'événements ---

    // Listener pour le bouton de fermeture
    closeInventoryButton.addEventListener('click', closeInventory);

     // Listener pour le bouton d'ouverture principal
     if (openInventoryButton) {
         openInventoryButton.addEventListener('click', () => {
             if (isInventoryOpen) {
                 closeInventory(); // Si déjà ouvert, le bouton sert à fermer
             } else {
                 openInventory(); // Sinon, il ouvre
             }
         });
     }

    // Listener délégué pour les boutons "Utiliser"
    inventoryItemList.addEventListener('click', (event) => {
        if (event.target.classList.contains('use-button')) {
            const itemId = event.target.dataset.itemId;
            if (itemId) {
                useItem(itemId);
            }
        }
    });

    // --- Interface Publique du Module ---
    return {
        addItem: addItem,
        removeItem: removeItem, // Peut être utile pour d'autres systèmes (ex: quêtes)
        useItem: useItem, // Utile si on veut déclencher l'utilisation depuis ailleurs
        getInventory: () => [...playerInventory], // Retourne une copie pour éviter modification externe directe
        displayInventory: displayInventory, // Pour rafraîchir si besoin depuis l'extérieur
        openInventory: openInventory,
        closeInventory: closeInventory,
        isInventoryOpen: () => isInventoryOpen,
    };

})(); // Fin de l'IIFE

// Exemple d'utilisation :
// InventoryManager.addItem({ id: 'potion_heal_1', name: "Potion de Soins Mineure", effect: { action: 'heal', amount: 25 } });
// InventoryManager.addItem({ id: 'potion_heal_1', name: "Potion de Soins Mineure", effect: { action: 'heal', amount: 25 } }); // Ajoute une deuxième
// InventoryManager.addItem({ id: 'key_1', name: "Clé rouillée", effect: { action: 'passive', description: 'Ouvre une porte.' } });
// InventoryManager.openInventory();
// Dans inventory.js, modifier l'interface publique :
 return {
    addItem: addItem,
    removeItem: removeItem,
    useItem: useItem, // Déjà exposé
    applyItemEffect: applyItemEffect, // <-- Exposer pour utilisation en combat
    getInventory: () => [...playerInventory],
    displayInventory: displayInventory,
    openInventory: openInventory,
    closeInventory: closeInventory,
    isInventoryOpen: () => isInventoryOpen,
};
