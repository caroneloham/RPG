// js/app.js
console.log("App module loaded. Initializing Chroniques d'Aldoria...");

const Game = {
    gameLoopInterval: null,         // Référence pour arrêter/démarrer l'intervalle de la boucle principale
    updateFrequency: 2000,          // Fréquence de mise à jour des ressources (en millisecondes), ex: toutes les 2 secondes
    eventCheckFrequency: 15000,     // Fréquence de vérification pour déclencher un événement aléatoire (en ms), ex: toutes les 15s
    lastEventCheckTime: 0,          // Timestamp de la dernière vérification d'événement
    eventTriggerChance: 0.4,        // Probabilité (0 à 1) qu'un événement se déclenche lors d'une vérification

    // Fonction principale d'initialisation du jeu
    init: function() {
        console.log("--- Chroniques d'Aldoria: Initialisation Globale ---");

        // Fonction à exécuter une fois que le DOM est complètement chargé et prêt
        const onDOMLoaded = () => {
             console.log("DOM Loaded. Proceeding with game initialization...");

             // Étape 1: Initialiser la Simulation
             // S'assurer que les objets Simulation et BuildingTypes existent
             if (typeof Simulation === 'undefined' || typeof BuildingTypes === 'undefined') {
                 console.error("CRITICAL ERROR: Simulation module or BuildingTypes not loaded correctly. Aborting initialization.");
                 document.body.innerHTML = "<h1>Erreur Critique</h1><p>Impossible de charger les modules principaux du jeu. Vérifiez la console (F12).</p>";
                 return;
             }
             // Calculer les effets initiaux (même s'il n'y a pas encore de bâtiments)
             // Cela initialise totalProductionRates et stats
             Simulation.recalculateBuildingEffects();
             console.log("Simulation initialized and initial effects calculated.");

             // Étape 2: Initialiser l'Interface Utilisateur (UI)
             // L'UI peut avoir besoin des données initiales de Simulation (ex: ressources)
             if (typeof UI === 'undefined') {
                  console.error("CRITICAL ERROR: UI module not loaded correctly. Aborting initialization.");
                   document.body.innerHTML = "<h1>Erreur Critique</h1><p>Impossible de charger l'interface du jeu. Vérifiez la console (F12).</p>";
                  return;
             }
             UI.init(); // Récupère les éléments DOM, attache les listeners principaux
             console.log("UI Initialized.");

             // Étape 3: Initialiser les autres modules si nécessaire
             if (typeof Heroes === 'undefined' || typeof Events === 'undefined') {
                  console.warn("Heroes or Events module might not be loaded correctly.");
                  // Peut continuer mais certaines fonctionnalités seront absentes
             } else {
                 console.log("Heroes and Events modules checked.");
             }

             // Étape 4: Dessiner l'état initial du jeu sur le Canvas
             // Doit être fait après l'initialisation de l'UI (pour avoir le contexte)
             // et après l'init de Simulation (pour savoir quoi dessiner, même si c'est vide au début)
             if (UI.elements.canvasContext) {
                 UI.drawGame();
                 console.log("Initial game state drawn on canvas.");
             } else {
                 console.warn("Canvas context not available, skipping initial draw.");
             }


             // Étape 5: Démarrer la boucle de jeu principale
             this.lastEventCheckTime = Date.now(); // Initialiser le timer d'événement
             this.startGameLoop();

             console.log("--- Initialisation du jeu terminée avec succès ---");
             UI.logEvent("Votre règne sur Aldoria commence !", "success");
        };

        // Attendre que le DOM soit prêt avant d'exécuter l'initialisation
        if (document.readyState === 'loading') {
            console.log("DOM not ready yet, adding event listener...");
            document.addEventListener('DOMContentLoaded', onDOMLoaded);
        } else {
            // Le DOM est déjà prêt, exécuter directement
            console.log("DOM already ready, running initialization now.");
            onDOMLoaded();
        }
    },

    // La boucle principale du jeu, exécutée à intervalles réguliers
    gameLoop: function() {
        const now = Date.now();
        // console.log(`Game Loop Tick @ ${now}`); // Décommenter pour debug très verbeux

        // 1. Mettre à jour la Simulation (principalement les ressources qui s'accumulent)
        Simulation.updateResources();

        // 2. Vérifier s'il est temps de tenter de déclencher un événement aléatoire
        if (now - this.lastEventCheckTime >= this.eventCheckFrequency) {
            console.log("Checking for random event trigger...");
            // Appliquer la probabilité de déclenchement
            if (Math.random() < this.eventTriggerChance) {
                console.log("Event chance met, triggering random event...");
                 if (typeof Events !== 'undefined' && Events.triggerRandomEvent) {
                    Events.triggerRandomEvent();
                 } else {
                    console.warn("Events module or triggerRandomEvent function not available.");
                 }
            } else {
                console.log("No random event triggered this time (chance not met).");
            }
            this.lastEventCheckTime = now; // Réinitialiser le timer, qu'un événement ait eu lieu ou non
        }

        // 3. Mettre à jour le rendu graphique (Canvas) ?
        // NON - Pour un jeu de gestion, redessiner le canvas uniquement lorsque
        // quelque chose de VISUEL change (construction, amélioration, déplacement d'unité...).
        // Le redessin est déclenché par les actions spécifiques dans UI.js ou Simulation.js.
        // Si des animations fluides sont nécessaires (unités qui bougent), utiliser requestAnimationFrame séparément.

        // 4. Autres logiques de jeu périodiques
        // - Vérifier les conditions de victoire/défaite
        // - Mettre à jour l'état des héros (faim, énergie - futur)
        // - Gérer l'IA des PNJ (futur)
        // TODO

    },

    // Démarre la boucle de jeu en utilisant setInterval
    startGameLoop: function() {
        console.log(`Starting game loop. Update frequency: ${this.updateFrequency}ms, Event check frequency: ${this.eventCheckFrequency}ms.`);
        // S'assurer qu'il n'y a pas déjà une boucle active
        if (this.gameLoopInterval) {
            console.warn("Attempting to start game loop, but one seems already active. Clearing previous interval.");
            clearInterval(this.gameLoopInterval);
        }
        // Démarrer la nouvelle boucle
        this.gameLoopInterval = setInterval(() => this.gameLoop(), this.updateFrequency);
        console.log("Game loop started.");
    },

    // Arrête la boucle de jeu
    stopGameLoop: function() {
        if (this.gameLoopInterval) {
            console.log("Stopping game loop.");
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null; // Réinitialiser la référence
        } else {
            console.log("Game loop is not currently running.");
        }
    }
};

// Lancer l'initialisation globale du jeu lorsque ce script est chargé
Game.init();
