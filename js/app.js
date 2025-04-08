// js/app.js
console.log("App module loaded. Initializing game...");

const Game = {
    gameLoopInterval: null, // Référence à l'intervalle de la boucle de jeu
    updateFrequency: 2000, // Fréquence de mise à jour des ressources (en ms), ex: toutes les 2 secondes
    eventFrequency: 15000, // Fréquence de tentative de déclenchement d'événement (en ms), ex: toutes les 15s
    lastEventCheckTime: 0, // Pour suivre quand vérifier les événements

    // Fonction principale d'initialisation du jeu
    init: function() {
        console.log("--- Chroniques d'Aldoria Initialisation ---");

        // 1. Initialiser l'interface utilisateur
        // Assurez-vous que le DOM est prêt avant d'initialiser l'UI
        if (document.readyState === 'loading') {
             document.addEventListener('DOMContentLoaded', () => {
                 UI.init();
                 this.startGameLoop(); // Démarrer la boucle une fois l'UI prête
             });
        } else {
             // Le DOM est déjà prêt
             UI.init();
             this.startGameLoop(); // Démarrer la boucle immédiatement
        }

        // 2. Autres initialisations (si nécessaire)
        // (Simulation, Heroes, Events sont déjà chargés et leurs objets/fonctions sont disponibles)
        this.lastEventCheckTime = Date.now();

        console.log("--- Initialisation Terminée ---");
    },

    // Boucle de jeu principale
    gameLoop: function() {
        const now = Date.now();
        // console.log("Game Loop Tick"); // Peut être très verbeux

        // 1. Mettre à jour la simulation (ressources, etc.)
        Simulation.updateResources();

        // 2. Vérifier s'il faut déclencher un événement (basé sur la fréquence)
        if (now - this.lastEventCheckTime >= this.eventFrequency) {
            console.log("Checking for random event...");
            // Ajoute une probabilité pour que l'événement ne se déclenche pas à chaque fois
            if (Math.random() < 0.6) { // 60% de chance de déclencher un événement à chaque check
                Events.triggerRandomEvent();
            } else {
                console.log("No event triggered this time.");
            }
            this.lastEventCheckTime = now; // Réinitialiser le timer d'événement
        }


        // 3. Mettre à jour les animations / le rendu graphique (Canvas)
        // Pour des animations fluides, requestAnimationFrame est mieux, mais pour un jeu de gestion,
        // une mise à jour dans la boucle principale peut suffire au début.
         UI.animateCanvas(now); // Passe le temps actuel si besoin pour l'animation

        // 4. Autres logiques de jeu (vérifier conditions de victoire/défaite, IA...)
        // TODO

    },

    // Démarre la boucle de jeu
    startGameLoop: function() {
        console.log(`Starting game loop with frequency: ${this.updateFrequency}ms`);
        // Arrête une boucle précédente si elle existe (sécurité)
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }
        // Exécute gameLoop toutes les X millisecondes
        this.gameLoopInterval = setInterval(() => this.gameLoop(), this.updateFrequency);

        // Pour les animations canvas plus fluides, on pourrait utiliser requestAnimationFrame séparément:
        // function animationLoop(timestamp) {
        //     UI.animateCanvas(timestamp);
        //     requestAnimationFrame(animationLoop);
        // }
        // requestAnimationFrame(animationLoop);
    },

    // Arrête la boucle de jeu
    stopGameLoop: function() {
        console.log("Stopping game loop.");
        clearInterval(this.gameLoopInterval);
        this.gameLoopInterval = null;
    }
};

// Lance l'initialisation du jeu lorsque le script est chargé
Game.init();