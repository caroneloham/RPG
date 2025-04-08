// inventory.js
/**
 * Module pour la gestion de l'inventaire du joueur.
 * Permet d'ajouter, supprimer, utiliser et afficher les objets possédés.
 */

// Dépendances :
// - Objet 'player' global (défini dans main.js)
// - CombatManager (pour logMessage, updatePlayerStatsDisplay, setPlayerHp)
// - Éléments DOM définis dans index.html

const InventoryManager = (() => {

    // Récupération des éléments du DOM
    const inventoryDisplay = document.getElementById('inventory-display');
    const inventoryItemList = document.getElementById('inventory-items');
    const closeInventoryButton = document.getElementById('close-inventory-button');
    const openInventoryButton = document.getElementById('open-inventory-button'); // Bouton principal pour ouvrir

    // Vérification initiale des éléments DOM critiques
    if (!inventoryDisplay || !inventoryItemList || !closeInventoryButton || !openInventoryButton) {
        console.error("Erreur critique: Un ou plusieurs éléments DOM de l'inventaire sont manquants ! Le module risque de ne pas fonctionner.");
        // On pourrait retourner un objet vide ou lancer une exception pour arrêter l'initialisation.
        // return {}; // Arrêter l'initialisation du module si les éléments de base manquent
    }

    let isInventoryOpen = false;

    // --- Structure de données de l'inventaire ---
    // Utilise une Map pour une recherche potentiellement plus rapide par ID,
    // bien qu'un Array soit suffisant pour de petits inventaires. Restons sur Array pour la simplicité.
    let playerInventory = [];
    /* Structure d'un objet dans l'inventaire :
       {
           id: 'string',       // Identifiant unique de l'objet
           name: 'string',     // Nom affiché
           quantity: number,   // Nombre d'objets possédés
           effect: {           // Description de l'effet
               action: 'string', // Type d'action (heal, buff, passive, etc.)
               amount?: number,  // Quantité (pour heal, etc.)
               stat?: string,    // Statistique affectée (pour buff)
               duration?: number,// Durée (pour buff)
               description?: string // Texte descriptif de l'effet (affiché)
           }
       }
    */

    /**
     * Ajoute un objet à l'inventaire. Gère l'empilement.
     * @param {object} itemToAdd - L'objet à ajouter. Doit avoir {id, name, effect}. Quantity est optionnelle (défaut 1).
     */
    function addItem(itemToAdd) {
        // Vérification de l'objet à ajouter
        if (!itemToAdd || typeof itemToAdd.id !== 'string' || typeof itemToAdd.name !== 'string' || typeof itemToAdd.effect !== 'object') {
            console.error("Tentative d'ajout d'un objet invalide à l'inventaire:", itemToAdd);
            return; // Ne pas ajouter l'objet invalide
        }
         // Vérifier si CombatManager est prêt pour logger (optionnel, mais bon usage)
         const canLog = typeof CombatManager !== 'undefined' && CombatManager.logMessage;

        const quantityToAdd = typeof itemToAdd.quantity === 'number' && itemToAdd.quantity > 0 ? itemToAdd.quantity : 1;

        const existingItemIndex = playerInventory.findIndex(item => item.id === itemToAdd.id);

        if (existingItemIndex > -1) {
            // Augmenter la quantité
            playerInventory[existingItemIndex].quantity += quantityToAdd;
             if (canLog) CombatManager.logMessage(`${quantityToAdd}x ${itemToAdd.name} ajouté(s) (Total: ${playerInventory[existingItemIndex].quantity}).`);
        } else {
            // Ajouter comme nouvel objet
            const newItem = {
                id: itemToAdd.id,
                name: itemToAdd.name,
                quantity: quantityToAdd,
                effect: { ...itemToAdd.effect } // Copie de l'objet effet
            };
            playerInventory.push(newItem);
             if (canLog) CombatManager.logMessage(`${quantityToAdd}x ${itemToAdd.name} ajouté(s) à l'inventaire.`);
        }

        // Rafraîchir l'affichage si l'inventaire est ouvert
        if (isInventoryOpen) {
            displayInventory();
        }
    }

    /**
     * Supprime une certaine quantité d'un objet de l'inventaire.
     * Principalement utilisé en interne par useItem ou pour des quêtes/événements.
     * @param {string} itemId - L'ID de l'objet à supprimer.
     * @param {number} [quantityToRemove=1] - La quantité à supprimer.
     * @returns {boolean} - True si la suppression (partielle ou totale) a réussi.
     */
    function removeItem(itemId, quantityToRemove = 1) {
         // Vérifier si CombatManager est prêt pour logger
         const canLog = typeof CombatManager !== 'undefined' && CombatManager.logMessage;

        const itemIndex = playerInventory.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            const item = playerInventory[itemIndex];
            if (item.quantity >= quantityToRemove) {
                item.quantity -= quantityToRemove;
                let removedCompletely = false;
                if (item.quantity <= 0) {
                    playerInventory.splice(itemIndex, 1); // Supprime complètement
                    removedCompletely = true;
                     if (canLog) CombatManager.logMessage(`${item.name} retiré de l'inventaire.`);
                } else {
                     if (canLog) CombatManager.logMessage(`${quantityToRemove}x ${item.name} retiré(s) (Restant: ${item.quantity}).`);
                }
                // Rafraîchir l'affichage si ouvert
                if (isInventoryOpen) {
                    displayInventory();
                }
                return true; // Suppression réussie
            } else {
                 if (canLog) CombatManager.logMessage(`Pas assez de ${item.name} pour en retirer ${quantityToRemove}.`);
                return false; // Quantité insuffisante
            }
        } else {
             if (canLog) CombatManager.logMessage(`Tentative de retrait d'un objet non possédé: ${itemId}`);
            return false; // Objet non trouvé
        }
    }

    /**
     * Tente d'utiliser un objet depuis l'inventaire (via l'UI de l'inventaire).
     * Appelle applyItemEffect puis removeItem si réussi.
     * @param {string} itemId - L'ID de l'objet à utiliser.
     */
    function useItem(itemId) {
        // Vérification joueur global
        if (typeof player === 'undefined' || player === null) {
             console.error("Erreur: Impossible d'utiliser un objet sans joueur défini.");
             // Logger via CombatManager si possible
              if (typeof CombatManager !== 'undefined' && CombatManager.logMessage) {
                 CombatManager.logMessage("Erreur système: Joueur non trouvé pour utiliser l'objet.");
              }
             return;
        }
         // Vérifier si CombatManager est prêt pour logger/mettre à jour l'UI
         const canLog = typeof CombatManager !== 'undefined' && CombatManager.logMessage;

        const itemIndex = playerInventory.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            const item = playerInventory[itemIndex];

             if (canLog) CombatManager.logMessage(`Vous essayez d'utiliser ${item.name}...`);

            // Appliquer l'effet (via la fonction dédiée)
            if (applyItemEffect(item)) {
                // L'effet a été appliqué avec succès, consommer l'objet
                removeItem(itemId, 1); // removeItem gère la mise à jour de l'affichage si nécessaire
                 // Pas besoin de logger à nouveau la réussite ici, applyItemEffect le fait déjà.
            } else {
                 // L'effet n'a pas été appliqué (ex: HP déjà max)
                 // applyItemEffect devrait déjà avoir loggé la raison de l'échec.
                 // Ne pas consommer l'objet.
            }
            // Mettre à jour l'affichage pour refléter un éventuel changement d'état du bouton 'utiliser'
            if (isInventoryOpen) {
                displayInventory();
            }
        } else {
             if (canLog) CombatManager.logMessage(`Vous n'avez pas de ${itemId} à utiliser.`);
        }
    }

    /**
     * Applique l'effet d'un objet sur le joueur.
     * Cette fonction est aussi utilisée par main.js pour l'utilisation en combat.
     * @param {object} item - L'objet dont l'effet doit être appliqué (doit avoir une propriété `effect`).
     * @returns {boolean} - True si l'effet a été appliqué et a eu un impact, false sinon.
     */
    function applyItemEffect(item) {
        // Vérifications cruciales
        if (typeof player === 'undefined' || player === null) {
             console.error("applyItemEffect: Joueur non défini.");
             return false;
        }
        if (!item || typeof item.effect !== 'object') {
             console.error("applyItemEffect: Objet ou effet invalide.", item);
             return false;
        }
         // S'assurer que les fonctions de CombatManager nécessaires sont là
         if (typeof CombatManager === 'undefined' || !CombatManager.logMessage || !CombatManager.setPlayerHp || !CombatManager.updatePlayerStatsDisplay) {
             console.error("applyItemEffect: Dépendances CombatManager manquantes.");
             return false;
         }

        const effect = item.effect;
        let effectApplied = false; // Devient true si l'action réussit ET change quelque chose

        switch (effect.action) {
            case 'heal':
                if (typeof effect.amount !== 'number' || effect.amount <= 0) {
                    CombatManager.logMessage(`L'effet de soin de ${item.name} est mal configuré.`);
                    break; // Ne fait rien
                }
                if (player.hp < player.maxHp) {
                    const healAmount = effect.amount;
                    const oldHp = player.hp;
                    const newHp = Math.min(player.maxHp, oldHp + healAmount);
                    const actualHeal = newHp - oldHp;

                    if (actualHeal > 0) {
                        CombatManager.setPlayerHp(newHp); // Utilise la fonction de CombatManager
                        CombatManager.logMessage(`Vous récupérez ${actualHeal} points de vie grâce à ${item.name}.`);
                        effectApplied = true;
                    } else {
                         // Ce cas ne devrait pas arriver si player.hp < player.maxHp, mais sécurité
                         CombatManager.logMessage(`${item.name} n'a eu aucun effet.`);
                    }
                } else {
                    CombatManager.logMessage(`Vos points de vie sont déjà au maximum. ${item.name} non utilisé.`);
                    effectApplied = false; // N'a pas été utile
                }
                break;

            // --- Autres exemples d'effets possibles ---
            case 'buff':
                // Exemple: Augmenter l'attaque temporairement (nécessiterait une gestion des buffs actifs)
                // CombatManager.logMessage(`Vous vous sentez plus fort grâce à ${item.name} ! (+${effect.amount} ${effect.stat})`);
                // // Ajouter logique pour appliquer et gérer la durée du buff...
                // effectApplied = true;
                CombatManager.logMessage(`${item.name} émet une lueur... (Effet 'buff' non implémenté)`);
                effectApplied = false; // Non implémenté pour l'instant
                break;

            case 'passive':
                // Les objets passifs ne sont généralement pas "utilisés" de cette manière
                CombatManager.logMessage(`${item.name} est un objet passif et ne peut pas être utilisé.`);
                effectApplied = false;
                break;

            case 'cure': // Exemple: Guérir un état (poison, etc.)
                 // CombatManager.logMessage(`Vous vous sentez purifié par ${item.name}.`);
                 // // Logique pour retirer un état négatif...
                 // effectApplied = true;
                 CombatManager.logMessage(`${item.name} brille faiblement... (Effet 'cure' non implémenté)`);
                 effectApplied = false; // Non implémenté
                 break;

            default:
                console.warn(`Effet inconnu ou non géré pour ${item.name}: ${effect.action}`);
                CombatManager.logMessage(`L'objet ${item.name} ne semble rien faire pour le moment...`);
                effectApplied = false;
        }

        // Mettre à jour l'UI même si l'effet n'a rien fait (au cas où l'état aurait changé autrement)
        // CombatManager.updatePlayerStatsDisplay(); // Déjà fait par setPlayerHp si appelé

        return effectApplied; // Retourne true seulement si l'action a réussi ET a eu un effet concret
    }


    /**
     * Affiche les objets de l'inventaire dans le DOM.
     */
    function displayInventory() {
         // Vérification joueur et éléments DOM
         if (!inventoryItemList) {
            console.error("displayInventory: Element 'inventory-items' non trouvé.");
            return;
         }
         if (typeof player === 'undefined' || player === null) {
             inventoryItemList.innerHTML = '<li>Erreur: Joueur non chargé.</li>';
             return;
         }

        inventoryItemList.innerHTML = ''; // Vider

        if (playerInventory.length === 0) {
            inventoryItemList.innerHTML = '<li>Votre inventaire est vide.</li>';
            return;
        }

        playerInventory.forEach(item => {
            const li = document.createElement('li');

            // Informations (Nom, Quantité, Description effet)
            const itemInfo = document.createElement('span');
            const effectDesc = item.effect?.description || (item.effect?.action ? `Action: ${item.effect.action}` : 'Effet inconnu');
            itemInfo.textContent = `${item.name} (x${item.quantity}) - ${effectDesc}`;

            // Bouton Utiliser
            const useButton = document.createElement('button');
            useButton.textContent = 'Utiliser';
            useButton.dataset.itemId = item.id;
            useButton.classList.add('use-button');

            // Désactiver bouton si non utilisable ou conditions non remplies
            const isUsableAction = item.effect && !['passive'].includes(item.effect.action); // Exclut passifs
            if (!isUsableAction) {
                 useButton.disabled = true;
                 // useButton.textContent = 'Non utilisable';
            } else if (item.effect.action === 'heal' && player.hp >= player.maxHp) {
                 // Désactiver Potion de Soin si HP max
                 useButton.disabled = true;
            }
            // Ajouter d'autres conditions de désactivation si nécessaire

            li.appendChild(itemInfo);
            li.appendChild(useButton);
            inventoryItemList.appendChild(li);
        });
    }

    /**
     * Ouvre l'interface de l'inventaire (si les conditions le permettent).
     */
    function openInventory() {
        // Vérifier les dépendances pour le log et l'état du combat
        const canLog = typeof CombatManager !== 'undefined' && CombatManager.logMessage;
        const combatActive = (typeof CombatManager !== 'undefined' && CombatManager.isCombatActive()) ||
                             (typeof BossCombatManager !== 'undefined' && BossCombatManager.isBossCombatActive());

        if (combatActive) {
            if (canLog) CombatManager.logMessage("Vous ne pouvez pas ouvrir l'inventaire principal pendant un combat !");
            return; // Ne pas ouvrir
        }
        // Vérifier si l'élément DOM existe
        if (!inventoryDisplay) {
            console.error("openInventory: Element 'inventory-display' non trouvé.");
            return;
        }

        displayInventory(); // Mettre à jour le contenu avant d'afficher
        inventoryDisplay.classList.remove('hidden'); // Afficher
        isInventoryOpen = true;
        if (canLog) CombatManager.logMessage("Inventaire ouvert.");
        // Pourrait désactiver d'autres contrôles (mouvement) ici si nécessaire
    }

    /**
     * Ferme l'interface de l'inventaire.
     */
    function closeInventory() {
        // Vérifier si l'élément DOM existe
        if (!inventoryDisplay) {
            console.error("closeInventory: Element 'inventory-display' non trouvé.");
            // L'état interne peut quand même être mis à jour
        } else {
             inventoryDisplay.classList.add('hidden'); // Cacher
        }

        isInventoryOpen = false;
        const canLog = typeof CombatManager !== 'undefined' && CombatManager.logMessage;
        if (canLog) CombatManager.logMessage("Inventaire fermé.");
        // Réactiver les contrôles si désactivés à l'ouverture
    }

    // --- Gestionnaires d'événements Internes ---

    // Listener pour le bouton de fermeture (vérifier existence)
    if (closeInventoryButton) {
        closeInventoryButton.addEventListener('click', closeInventory);
    } else {
         console.warn("Bouton 'close-inventory-button' non trouvé, la fermeture par bouton ne fonctionnera pas.");
    }


     // Listener pour le bouton d'ouverture principal (vérifier existence)
     if (openInventoryButton) {
         openInventoryButton.addEventListener('click', () => {
             if (isInventoryOpen) {
                 closeInventory();
             } else {
                 openInventory();
             }
         });
     } else {
         console.warn("Bouton 'open-inventory-button' non trouvé, l'ouverture/fermeture par ce bouton ne fonctionnera pas.");
     }


    // Listener délégué pour les boutons "Utiliser" dans la liste (vérifier existence)
    if (inventoryItemList) {
        inventoryItemList.addEventListener('click', (event) => {
            // Vérifier si l'élément cliqué EST le bouton (pas un enfant) et a la classe/dataset
            if (event.target.matches('button.use-button') && event.target.dataset.itemId) {
                const itemId = event.target.dataset.itemId;
                useItem(itemId); // Appeler la fonction d'utilisation
            }
        });
    } else {
         console.warn("Conteneur 'inventory-items' non trouvé, l'utilisation des objets depuis l'inventaire ne fonctionnera pas.");
    }


    // --- Interface Publique du Module ---
    return {
        // Gestion des items
        addItem: addItem,
        removeItem: removeItem,
        // Utilisation
        useItem: useItem,           // Pour l'UI de l'inventaire
        applyItemEffect: applyItemEffect, // Pour l'usage en combat (via main.js)
        // Accès et affichage
        getInventory: () => JSON.parse(JSON.stringify(playerInventory)), // Retourne une copie profonde pour sécurité
        displayInventory: displayInventory, // Pour rafraîchir si besoin depuis l'extérieur
        // Contrôle UI
        openInventory: openInventory,
        closeInventory: closeInventory,
        isInventoryOpen: () => isInventoryOpen,
    };

})(); // Fin de l'IIFE