// js/app.js
console.log("App module loaded. Initializing game...");

const Game = {
    gameLoopInterval: null,
    updateFrequency: 2000,
    eventFrequency: 15000,
    lastEventCheckTime: 0,

    init: function() {
        console.log("--- Chroniques d'Aldoria Initialisation ---");

        // Fonction à exécuter une fois le DOM chargé
        const onDOMLoaded = () => {
             // 1. Initialiser la Simulation d'abord (pour les données)
             Simulation.recalculateBuildingEffects(); // Calcul initial des effets (même si 0 bâtiment)

             // 2. Initialiser l'UI (qui peut avoir besoin des données de Simu)
             UI.init();

             // 3. Initialiser l'état des héros dans l'UI (capacité initiale)
             if (UI.activeMode === 'hero') { // Si on charge directement en mode héros (peu probable)
                 UI.updateHeroCapacity(Simulation.stats.maxHeroCapacity);
                 UI.updateHeroList(Heroes.getHeroes());
             }

             // 4. Dessiner l'état initial du canvas
             UI.drawGame();

             // 5. Démarrer la boucle de jeu
             this.lastEventCheckTime = Date.now();
             this.startGameLoop();

            console.log("--- Initialisation Terminée ---");
        };

        // Vérifier si le DOM est déjà prêt
        if (document.readyState === 'loading') {
             document.addEventListener('DOMContentLoaded', onDOMLoaded);
        } else {
             onDOMLoaded(); // Le DOM est déjà prêt
        }
    },

    gameLoop: function() {
        const now = Date.now();

        // 1. Mettre à jour la simulation (ressources)
        Simulation.updateResources();

        // 2. Vérifier événements aléatoires
        if (now - this.lastEventCheckTime >= this.eventFrequency) {
            console.log("Checking for random event...");
            if (Math.random() < 0.3) { // Réduit un peu la probabilité pour le test
                Events.triggerRandomEvent();
            } else {
                // console.log("No event triggered this time.");
            }
            this.lastEventCheckTime = now;
        }

        // 3. Mettre à jour le rendu graphique (PAS dans la boucle de base pour un jeu de gestion, sauf si animation)
        // On redessine seulement quand quelque chose change (construction, amélioration) via UI.drawGame()
        // Si on veut des animations (ex: héros qui bougent), il faudrait une boucle séparée avec requestAnimationFrame
        // UI.drawGame(); // Ne pas appeler ici à chaque tick pour la performance

        // 4. Autres logiques ?
    },

    startGameLoop: function() {
        console.log(`Starting game loop with frequency: ${this.updateFrequency}ms`);
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }
        this.gameLoopInterval = setInterval(() => this.gameLoop(), this.updateFrequency);
    },

    stopGameLoop: function() {
        console.log("Stopping game loop.");
        clearInterval(this.gameLoopInterval);
        this.gameLoopInterval = null;
    }
};

Game.init();