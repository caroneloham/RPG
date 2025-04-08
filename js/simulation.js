// js/simulation.js
console.log("Simulation module loaded.");

// Encapsulation dans un objet pour éviter de polluer le scope global
const Simulation = {
    resources: {
        wood: 100,
        stone: 100,
        gold: 50,
        mana: 10
    },
    productionRates: { // Par cycle de mise à jour
        wood: 1,
        stone: 1,
        gold: 0.1,
        mana: 0.05
    },

    // Met à jour les ressources basées sur les taux de production
    updateResources: function() {
        this.resources.wood += this.productionRates.wood;
        this.resources.stone += this.productionRates.stone;
        this.resources.gold += this.productionRates.gold;
        this.resources.mana += this.productionRates.mana;

        // Arrondi pour éviter les décimales infinies pour or et mana
        this.resources.gold = Math.round(this.resources.gold * 100) / 100;
        this.resources.mana = Math.round(this.resources.mana * 100) / 100;

         // Déclenche la mise à jour de l'UI (via le module UI)
         if (typeof UI !== 'undefined' && UI.updateResourceDisplay) {
             UI.updateResourceDisplay(this.resources);
         } else {
            // Fallback si UI n'est pas encore chargé ou défini
             console.warn("UI module not ready for resource update.");
         }
    },

    // Fonction pour obtenir l'état actuel des ressources
    getResources: function() {
        return { ...this.resources }; // Retourne une copie
    },

    // Fonction pour dépenser des ressources (retourne true si succès, false sinon)
    spendResources: function(cost) {
        for (const resource in cost) {
            if (this.resources[resource] < cost[resource]) {
                console.warn(`Pas assez de ${resource}. Requis: ${cost[resource]}, Disponible: ${this.resources[resource]}`);
                // Optionnel: Afficher un message à l'utilisateur via UI.js
                if (typeof UI !== 'undefined' && UI.displayMessage) {
                     UI.displayMessage(`Ressources insuffisantes : manque de ${resource}.`, 'error');
                }
                return false; // Échec
            }
        }
        // Si toutes les ressources sont suffisantes, on les dépense
        for (const resource in cost) {
            this.resources[resource] -= cost[resource];
        }
        console.log("Ressources dépensées:", cost);
         UI.updateResourceDisplay(this.resources); // Met à jour l'affichage après dépense
        return true; // Succès
    },

     // Fonction pour ajouter des ressources (ex: récompense d'événement)
    addResources: function(gains) {
         for (const resource in gains) {
             if (this.resources.hasOwnProperty(resource)) {
                 this.resources[resource] += gains[resource];
                 console.log(`${gains[resource]} ${resource} ajouté.`);
             }
         }
         UI.updateResourceDisplay(this.resources); // Met à jour l'affichage après gain
    }
};