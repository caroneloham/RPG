// js/events.js
console.log("Events module loaded.");

const Events = {
    possibleEvents: [
        {
            name: "Bénédiction Sylvestre",
            description: "Les esprits de la forêt offrent un don de bois.",
            type: "blessing",
            trigger: function() {
                console.log("Événement déclenché : Bénédiction Sylvestre");
                const woodGain = Math.floor(Math.random() * 50) + 20; // Gain aléatoire entre 20 et 70
                Simulation.addResources({ wood: woodGain });
                // Afficher dans le journal via UI.js
                if (typeof UI !== 'undefined' && UI.logEvent) {
                    UI.logEvent(`Bénédiction Sylvestre : +${woodGain} bois !`);
                }
            }
        },
        {
            name: "Petite Faille de Mana",
            description: "Une fluctuation magique mineure libère un peu de mana.",
             type: "blessing",
            trigger: function() {
                console.log("Événement déclenché : Petite Faille de Mana");
                const manaGain = Math.floor(Math.random() * 10) + 5; // Gain aléatoire entre 5 et 15
                Simulation.addResources({ mana: manaGain });
                 if (typeof UI !== 'undefined' && UI.logEvent) {
                    UI.logEvent(`Petite Faille de Mana : +${manaGain} mana.`);
                 }
            }
        },
        {
            name: "Tempête Inattendue",
            description: "Une violente tempête endommage les réserves de bois.",
            type: "disaster",
            trigger: function() {
                console.log("Événement déclenché : Tempête Inattendue");
                const woodLoss = Math.floor(Math.random() * 30) + 10; // Perte entre 10 et 40
                // On s'assure de ne pas passer en négatif
                const actualLoss = Math.min(Simulation.resources.wood, woodLoss);
                Simulation.spendResources({ wood: actualLoss }); // Utilise spendResources pour la logique
                 if (typeof UI !== 'undefined' && UI.logEvent) {
                    UI.logEvent(`Tempête Inattendue : -${actualLoss} bois endommagé(s).`, 'warning');
                 }
            }
        },
         {
            name: "Veine d'Or Découverte",
            description: "Vos prospecteurs ont trouvé une petite veine d'or.",
            type: "blessing",
            trigger: function() {
                console.log("Événement déclenché : Veine d'Or");
                const goldGain = Math.floor(Math.random() * 25) + 10; // Gain aléatoire entre 10 et 35
                Simulation.addResources({ gold: goldGain });
                 if (typeof UI !== 'undefined' && UI.logEvent) {
                    UI.logEvent(`Veine d'Or Découverte : +${goldGain} or !`);
                 }
            }
        }
        // TODO: Ajouter plus d'événements (invasions, quêtes, découvertes...)
    ],

    // Déclenche un événement aléatoire parmi ceux possibles
    triggerRandomEvent: function() {
        const randomIndex = Math.floor(Math.random() * this.possibleEvents.length);
        const eventToTrigger = this.possibleEvents[randomIndex];

        console.log(`Tentative de déclenchement : ${eventToTrigger.name}`);
        eventToTrigger.trigger(); // Exécute la fonction 'trigger' de l'événement
    },

     // Potentiellement une fonction pour déclencher un événement spécifique (utile pour les boutons)
     triggerSpecificEvent: function(eventName) {
         const event = this.possibleEvents.find(e => e.name === eventName);
         if (event) {
             event.trigger();
         } else {
             console.warn(`Événement "${eventName}" non trouvé.`);
         }
     }
};