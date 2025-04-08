// js/simulation.js
console.log("Simulation module loaded.");

// --- Définition des Types de Bâtiments ---
const BuildingTypes = {
    // Ressources Base
    'hutte_bucheron': {
        id: 'hutte_bucheron', name: "Hutte de Bûcheron", description: "Augmente la production de bois.",
        baseCost: { wood: 50, stone: 10 }, maxLevel: 5, upgradeCostMultiplier: 1.6,
        baseEffect: { productionRate: { wood: 0.5 } }, upgradeEffectMultiplier: 1.4,
        initialPosition: { x: 50, y: 50 }, color: '#8B4513' // SaddleBrown
    },
    'carriere_pierre': {
        id: 'carriere_pierre', name: "Carrière de Pierre", description: "Augmente la production de pierre.",
        baseCost: { wood: 30, stone: 40 }, maxLevel: 5, upgradeCostMultiplier: 1.6,
        baseEffect: { productionRate: { stone: 0.5 } }, upgradeEffectMultiplier: 1.4,
        initialPosition: { x: 120, y: 50 }, color: '#708090' // SlateGray
    },
    'mine_or': {
        id: 'mine_or', name: "Mine d'Or", description: "Augmente la production d'or.",
        baseCost: { wood: 80, stone: 100, gold: 20 }, maxLevel: 5, upgradeCostMultiplier: 1.8,
        baseEffect: { productionRate: { gold: 0.1 } }, upgradeEffectMultiplier: 1.5,
        initialPosition: { x: 190, y: 50 }, color: '#DAA520' // Goldenrod
    },
    'autel_mana': {
        id: 'autel_mana', name: "Autel de Mana", description: "Augmente la régénération de mana.",
        baseCost: { stone: 80, gold: 50, mana: 10 }, maxLevel: 5, upgradeCostMultiplier: 1.8,
        baseEffect: { productionRate: { mana: 0.05 } }, upgradeEffectMultiplier: 1.5,
        initialPosition: { x: 260, y: 50 }, color: '#483D8B' // DarkSlateBlue
    },
     'ferme': {
        id: 'ferme', name: "Ferme", description: "Fournit de la nourriture (ressource future?) et augmente légèrement l'or via surplus.",
        baseCost: { wood: 60, stone: 20 }, maxLevel: 3, upgradeCostMultiplier: 1.5,
        baseEffect: { productionRate: { gold: 0.02 } /*, food: 1 */ }, upgradeEffectMultiplier: 1.3,
        initialPosition: { x: 50, y: 120 }, color: '#90EE90' // LightGreen
    },
    // Héros / Militaire
     'hutte_habitation': {
        id: 'hutte_habitation', name: "Hutte d'Habitation", description: "Augmente la capacité maximale de héros.",
        baseCost: { wood: 40, stone: 10 }, maxLevel: 5, upgradeCostMultiplier: 1.7,
        baseEffect: { heroCapacity: 1 }, upgradeEffectMultiplier: 1, // Augmente de 1 à chaque niveau
        initialPosition: { x: 330, y: 50 }, color: '#D2B48C' // Tan
    },
     'caserne': {
        id: 'caserne', name: "Caserne", description: "Permet de recruter des unités Guerrier et améliore leur entraînement (futur).",
        baseCost: { wood: 100, stone: 80, gold: 50 }, maxLevel: 3, upgradeCostMultiplier: 2.0,
        baseEffect: { unlockUnit: 'Guerrier' /*, trainingBonus: 0.1 */ }, upgradeEffectMultiplier: 1.2,
        initialPosition: { x: 120, y: 120 }, color: '#B22222' // Firebrick
    },
     'tour_mage': {
        id: 'tour_mage', name: "Tour de Mage", description: "Permet de recruter des unités Mage et améliore la recherche (futur).",
        baseCost: { wood: 70, stone: 120, gold: 80, mana: 30 }, maxLevel: 3, upgradeCostMultiplier: 2.0,
        baseEffect: { unlockUnit: 'Mage' /*, researchBonus: 0.1 */ }, upgradeEffectMultiplier: 1.2,
        initialPosition: { x: 190, y: 120 }, color: '#8A2BE2' // BlueViolet
    },
    'tour_guet': {
        id: 'tour_guet', name: "Tour de Guet", description: "Améliore la défense et prévient des invasions (futur).",
        baseCost: { wood: 50, stone: 70 }, maxLevel: 3, upgradeCostMultiplier: 1.5,
        baseEffect: { defenseValue: 10 }, upgradeEffectMultiplier: 1.5,
        initialPosition: { x: 260, y: 120 }, color: '#A0522D' // Sienna
    },
     // Économie / Utilitaires
    'marche': {
        id: 'marche', name: "Marché", description: "Améliore les revenus en or et permet des échanges (futur).",
        baseCost: { wood: 120, gold: 100 }, maxLevel: 3, upgradeCostMultiplier: 1.8,
        baseEffect: { productionRate: { gold: 0.05 } /*, tradeEfficiency: 0.1 */ }, upgradeEffectMultiplier: 1.4,
        initialPosition: { x: 330, y: 120 }, color: '#FFD700' // Gold
    },
    'forge': {
        id: 'forge', name: "Forge", description: "Permet d'améliorer l'équipement des héros (futur).",
        baseCost: { stone: 150, gold: 70 }, maxLevel: 3, upgradeCostMultiplier: 1.9,
        baseEffect: { enableUpgrades: 'equipment' }, upgradeEffectMultiplier: 1.0, // L'effet est le déblocage
        initialPosition: { x: 50, y: 190 }, color: '#DC143C' // Crimson
    },
     'bibliotheque': {
        id: 'bibliotheque', name: "Bibliothèque", description: "Permet la recherche de technologies (futur) et génère un peu de mana.",
        baseCost: { wood: 100, stone: 50, gold: 60 }, maxLevel: 3, upgradeCostMultiplier: 1.7,
        baseEffect: { productionRate: { mana: 0.02 } /*, enableResearch: true */}, upgradeEffectMultiplier: 1.3,
        initialPosition: { x: 120, y: 190 }, color: '#4682B4' // SteelBlue
    },
    'laboratoire_alchimique': {
        id: 'laboratoire_alchimique', name: "Laboratoire Alchimique", description: "Permet de créer des potions (futur) et améliore la génération de mana.",
        baseCost: { wood: 80, stone: 100, mana: 40 }, maxLevel: 3, upgradeCostMultiplier: 1.8,
        baseEffect: { productionRate: { mana: 0.03 } /*, enablePotions: true */ }, upgradeEffectMultiplier: 1.4,
        initialPosition: { x: 190, y: 190 }, color: '#9932CC' // DarkOrchid
    },
    'grenier': {
        id: 'grenier', name: "Grenier", description: "Augmente la capacité de stockage des ressources (futur).",
        baseCost: { wood: 150, stone: 50 }, maxLevel: 3, upgradeCostMultiplier: 1.6,
        baseEffect: { storageCapacityMultiplier: 1.2 }, upgradeEffectMultiplier: 1.2,
        initialPosition: { x: 260, y: 190 }, color: '#F5DEB3' // Wheat
    },
     'temple': {
        id: 'temple', name: "Temple", description: "Augmente le moral (futur) et accorde parfois des bénédictions mineures.",
        baseCost: { stone: 120, gold: 150, mana: 50 }, maxLevel: 2, upgradeCostMultiplier: 2.2,
        baseEffect: { /* moraleBonus: 5, blessingChance: 0.01 */ }, upgradeEffectMultiplier: 1.5,
        initialPosition: { x: 330, y: 190 }, color: '#FFFAF0' // FloralWhite
    }
    // Ajoutez d'autres bâtiments ici si désiré
};

const Simulation = {
    resources: {
        wood: 100,
        stone: 100,
        gold: 50,
        mana: 10
    },
    // Taux de production de BASE (avant bonus des bâtiments)
    baseProductionRates: {
        wood: 0.1, // Très faible sans bâtiment
        stone: 0.1,
        gold: 0.01,
        mana: 0
    },
    // Taux de production totaux (base + bonus bâtiments)
    totalProductionRates: {
        wood: 0.1,
        stone: 0.1,
        gold: 0.01,
        mana: 0
    },
    // Joueur/Royaume stats affectées par les bâtiments
    stats: {
       maxHeroCapacity: 2, // Capacité de base
       defenseValue: 0,
       // Ajouter d'autres stats ici (stockage max, bonus divers...)
    },

    constructedBuildings: [], // Liste des bâtiments construits { typeId, level, position, currentEffect }

    // Recalcule TOUS les bonus à partir des bâtiments construits
    recalculateBuildingEffects: function() {
        // Réinitialiser les taux totaux et les stats aux valeurs de base
        this.totalProductionRates = { ...this.baseProductionRates };
        this.stats.maxHeroCapacity = 2; // Réinitialiser à la valeur de base
        this.stats.defenseValue = 0;
        // Ajouter la réinitialisation d'autres stats ici

        // Appliquer les effets de chaque bâtiment construit
        this.constructedBuildings.forEach(building => {
            const type = BuildingTypes[building.typeId];
            if (!type) return; // Sécurité

            // Recalculer l'effet actuel du bâtiment basé sur son niveau
            building.currentEffect = this.calculateBuildingEffect(type, building.level);

            // Appliquer l'effet
            if (building.currentEffect.productionRate) {
                for (const resource in building.currentEffect.productionRate) {
                    this.totalProductionRates[resource] = (this.totalProductionRates[resource] || 0) + building.currentEffect.productionRate[resource];
                }
            }
            if (building.currentEffect.heroCapacity) {
                this.stats.maxHeroCapacity += building.currentEffect.heroCapacity;
            }
             if (building.currentEffect.defenseValue) {
                this.stats.defenseValue += building.currentEffect.defenseValue;
            }
            // Ajouter l'application d'autres effets ici (unlocks, bonus, etc.)
        });

        console.log("Building effects recalculated. New rates:", this.totalProductionRates, "New stats:", this.stats);
         // Mettre à jour l'UI des héros si la capacité change
         if (typeof UI !== 'undefined' && UI.updateHeroCapacity) {
            UI.updateHeroCapacity(this.stats.maxHeroCapacity);
         }
    },

     // Calcule l'effet d'un bâtiment à un niveau donné
    calculateBuildingEffect: function(buildingType, level) {
        let effect = {};
        if (buildingType.baseEffect.productionRate) {
            effect.productionRate = {};
            for (const resource in buildingType.baseEffect.productionRate) {
                // Effet = base * (multiplicateur ^ (niveau - 1))
                effect.productionRate[resource] = buildingType.baseEffect.productionRate[resource] * Math.pow(buildingType.upgradeEffectMultiplier, level - 1);
            }
        }
         if (buildingType.baseEffect.heroCapacity) {
            // Simple addition pour la capacité héros
            // Si mult=1, c'est base * 1^(n-1) = base. Donc ajoute 'baseEffect.heroCapacity' à chaque niveau.
             effect.heroCapacity = buildingType.baseEffect.heroCapacity * (buildingType.upgradeEffectMultiplier === 1 ? level : Math.pow(buildingType.upgradeEffectMultiplier, level - 1));
             // Correction : Si le multiplier est 1, l'effet de base s'ajoute à chaque niveau.
             if (buildingType.upgradeEffectMultiplier === 1) {
                 effect.heroCapacity = buildingType.baseEffect.heroCapacity; // L'effet est par niveau, pas cumulatif exponentiel ici
             } else {
                 // Si le multiplier est > 1, on peut avoir une progression, mais +1 par niveau est plus courant pour capacité
                 // Pour garder simple : +X par niveau.
                 // Recalculate ne somme pas, il définit la stat totale.
                 // DONC, on doit retourner la contribution TOTALE de ce bâtiment à ce niveau.
                 // Si +1 par niveau, au niveau 3, la contribution totale est 3.
                 effect.heroCapacity = buildingType.baseEffect.heroCapacity * level;
             }
         }
         if (buildingType.baseEffect.defenseValue) {
             effect.defenseValue = buildingType.baseEffect.defenseValue * Math.pow(buildingType.upgradeEffectMultiplier, level - 1);
         }
         // Ajouter le calcul pour d'autres types d'effets ici
         // Pour les unlocks, l'effet est souvent le même quel que soit le niveau
         if (buildingType.baseEffect.unlockUnit) effect.unlockUnit = buildingType.baseEffect.unlockUnit;
         if (buildingType.baseEffect.enableUpgrades) effect.enableUpgrades = buildingType.baseEffect.enableUpgrades;

        return effect;
    },

     // Calcule le coût d'une action (construction ou amélioration)
     calculateCost: function(buildingType, currentLevel = 0) { // level 0 = construction initiale
        const cost = {};
        // Pour la construction (currentLevel=0), le multiplicateur est 1 (pow(mult, 0))
        // Pour l'amélioration du niveau 1 au niveau 2 (currentLevel=1), on utilise pow(mult, 1)
        const costMultiplier = Math.pow(buildingType.upgradeCostMultiplier, currentLevel);
        for(const resource in buildingType.baseCost) {
            cost[resource] = Math.ceil(buildingType.baseCost[resource] * costMultiplier); // Arrondi au supérieur
        }
        return cost;
    },


    updateResources: function() {
        // Utiliser totalProductionRates maintenant
        this.resources.wood += this.totalProductionRates.wood;
        this.resources.stone += this.totalProductionRates.stone;
        this.resources.gold += this.totalProductionRates.gold;
        this.resources.mana += this.totalProductionRates.mana;

        this.resources.wood = Math.round(this.resources.wood * 100) / 100;
        this.resources.stone = Math.round(this.resources.stone * 100) / 100;
        this.resources.gold = Math.round(this.resources.gold * 100) / 100;
        this.resources.mana = Math.round(this.resources.mana * 100) / 100;

         if (typeof UI !== 'undefined' && UI.updateResourceDisplay) {
             UI.updateResourceDisplay(this.resources);
         } else {
             // Ne pas logger en boucle, juste une fois si ça arrive au début
             // console.warn("UI module not ready for resource update.");
         }
    },

    getResources: function() {
        return { ...this.resources }; // Retourne une copie
    },

    spendResources: function(cost) {
        for (const resource in cost) {
             // Vérifier si la ressource existe avant de comparer
             if (this.resources[resource] === undefined || this.resources[resource] < cost[resource]) {
                const required = cost[resource];
                const available = this.resources[resource] !== undefined ? Math.floor(this.resources[resource]) : 0;
                const message = `Pas assez de ${resource}. Requis: ${required}, Disponible: ${available}`;
                console.warn(message);
                if (typeof UI !== 'undefined' && UI.displayMessage) {
                     UI.displayMessage(message, 'error');
                }
                return false; // Échec
            }
        }
        // Si toutes les ressources sont suffisantes, on les dépense
        for (const resource in cost) {
            this.resources[resource] -= cost[resource];
        }
        console.log("Ressources dépensées:", cost);
         // Mettre à jour l'affichage immédiatement après la dépense
         if (typeof UI !== 'undefined' && UI.updateResourceDisplay) {
            UI.updateResourceDisplay(this.resources);
         }
        return true; // Succès
    },

    addResources: function(gains) {
         for (const resource in gains) {
             if (this.resources.hasOwnProperty(resource)) {
                 this.resources[resource] += gains[resource];
                 console.log(`${gains[resource]} ${resource} ajouté.`);
             }
         }
          // Mettre à jour l'affichage immédiatement après le gain
         if (typeof UI !== 'undefined' && UI.updateResourceDisplay) {
            UI.updateResourceDisplay(this.resources);
         }
    },

     // --- Nouvelles fonctions pour gérer les bâtiments ---

     // Tente de construire un nouveau bâtiment
     buildBuilding: function(buildingTypeId) {
         const type = BuildingTypes[buildingTypeId];
         if (!type) {
             console.error(`Type de bâtiment inconnu: ${buildingTypeId}`);
             return false;
         }

         // Vérifier si déjà construit
         if (this.constructedBuildings.some(b => b.typeId === buildingTypeId)) {
             const message = `Vous avez déjà construit un(e) ${type.name}. Vous pouvez l'améliorer.`;
             console.warn(message);
              if (typeof UI !== 'undefined' && UI.displayMessage) {
                 UI.displayMessage(message, 'warning');
             }
             return false;
         }

         // Vérifier le coût
         const cost = this.calculateCost(type, 0); // Coût niveau 1 (level=0)
         if (this.spendResources(cost)) {
             // Ajouter le bâtiment à la liste
             const newBuilding = {
                 typeId: buildingTypeId,
                 level: 1,
                 position: { ...type.initialPosition }, // Copie de la position
                 currentEffect: {} // Sera calculé par recalculate
             };
             this.constructedBuildings.push(newBuilding);
             console.log(`${type.name} construit !`);

             // Recalculer tous les effets et mettre à jour le jeu/UI
             this.recalculateBuildingEffects();

             // Mettre à jour l'UI (mode construction et canvas)
             if (typeof UI !== 'undefined') {
                 if (UI.activeMode === 'build') {
                    UI.updateBuildModeUI(); // Rafraîchir la liste des bâtiments si on est en mode construction
                 }
                 UI.drawGame(); // Redessiner le canvas avec le nouveau bâtiment
                 UI.logEvent(`${type.name} (Niveau 1) construit.`);
             }
             return true;
         } else {
             console.log(`Construction de ${type.name} échouée (ressources).`);
             // Message d'erreur géré par spendResources
             return false;
         }
     },

     // Tente d'améliorer un bâtiment existant
     upgradeBuilding: function(buildingTypeId) {
         const buildingIndex = this.constructedBuildings.findIndex(b => b.typeId === buildingTypeId);
         if (buildingIndex === -1) {
             console.error(`Tentative d'amélioration d'un bâtiment non construit: ${buildingTypeId}`);
              if (typeof UI !== 'undefined') UI.displayMessage(`Erreur: ${BuildingTypes[buildingTypeId]?.name} non construit.`, 'error');
             return false;
         }

         const building = this.constructedBuildings[buildingIndex];
         const type = BuildingTypes[buildingTypeId];

         // Vérifier niveau max
         if (building.level >= type.maxLevel) {
             const message = `${type.name} est déjà au niveau maximum (${type.maxLevel}).`;
             console.warn(message);
             if (typeof UI !== 'undefined' && UI.displayMessage) {
                 UI.displayMessage(message, 'info');
             }
             return false;
         }

         // Vérifier le coût d'amélioration
         const cost = this.calculateCost(type, building.level); // Coût pour passer au niveau suivant ( basé sur niveau actuel)
         if (this.spendResources(cost)) {
             // Augmenter le niveau
             building.level++;
             console.log(`${type.name} amélioré au niveau ${building.level} !`);

             // Recalculer tous les effets (important: AVANT de redessiner l'UI qui dépend des nouveaux coûts/stats)
             this.recalculateBuildingEffects();

             // Mettre à jour l'UI
             if (typeof UI !== 'undefined') {
                 if (UI.activeMode === 'build') {
                    UI.updateBuildModeUI(); // Rafraîchir la liste des bâtiments (coût/niveau)
                 }
                 UI.drawGame(); // Redessiner le canvas (potentiellement changer l'apparence avec le niveau)
                 UI.logEvent(`${type.name} amélioré au niveau ${building.level}.`);
             }
             return true;
         } else {
             console.log(`Amélioration de ${type.name} échouée (ressources).`);
              // Message d'erreur géré par spendResources
             return false;
         }
     },

      // Récupère les données des bâtiments construits (pour l'UI)
      getConstructedBuildingsData: function() {
          // S'assure que BuildingTypes est défini
          if (typeof BuildingTypes === 'undefined') {
              console.error("BuildingTypes n'est pas défini lors de l'appel à getConstructedBuildingsData");
              return [];
          }
          return this.constructedBuildings.map(b => {
              const type = BuildingTypes[b.typeId];
              if (!type) {
                  console.warn(`Type de bâtiment inconnu trouvé dans constructedBuildings: ${b.typeId}`);
                  return null; // Retourner null pour filtrer ensuite
              }
              // Calculer le coût d'amélioration seulement si ce n'est pas le niveau max
              const upgradeCost = (b.level < type.maxLevel)
                  ? this.calculateCost(type, b.level) // Coût basé sur le niveau actuel pour passer au suivant
                  : null;

              return {
                  ...b, // Contient typeId, level, position, currentEffect (calculé par recalculate)
                  name: type.name,
                  description: type.description,
                  maxLevel: type.maxLevel,
                  color: type.color, // Pour le dessin
                  upgradeCost: upgradeCost // Coût pour le PROCHAIN niveau (ou null si max)
              };
          }).filter(b => b !== null); // Filtrer les entrées null si un type était inconnu
      }
};
