// js/ui.js
console.log("UI module loaded.");

const UI = {
    // Références aux éléments du DOM importants
    elements: {
        resourceWood: null,
        resourceStone: null,
        resourceGold: null,
        resourceMana: null,
        buildModeButton: null,
        heroModeButton: null,
        eventModeButton: null,
        modeContentArea: null,
        gameCanvas: null,
        canvasContext: null,
         eventLogList: null,
         // Ajouter d'autres éléments au besoin (ex: liste des héros)
    },

    // Initialise l'UI : récupère les éléments et attache les écouteurs
    init: function() {
        console.log("Initializing UI...");
        this.elements.resourceWood = document.getElementById('resource-wood');
        this.elements.resourceStone = document.getElementById('resource-stone');
        this.elements.resourceGold = document.getElementById('resource-gold');
        this.elements.resourceMana = document.getElementById('resource-mana');
        this.elements.buildModeButton = document.getElementById('btn-build-mode');
        this.elements.heroModeButton = document.getElementById('btn-hero-mode');
        this.elements.eventModeButton = document.getElementById('btn-event-mode');
        this.elements.modeContentArea = document.getElementById('mode-content-area');
        this.elements.gameCanvas = document.getElementById('game-canvas');
         this.elements.eventLogList = document.getElementById('event-list');


        // Vérification que les éléments existent
        if (!this.elements.resourceWood || !this.elements.buildModeButton || !this.elements.gameCanvas || !this.elements.eventLogList) {
             console.error("Erreur : Un ou plusieurs éléments UI n'ont pas été trouvés dans le DOM !");
             return; // Arrêter l'initialisation si un élément clé manque
         }

        // Initialiser le contexte du canvas
        if (this.elements.gameCanvas.getContext) {
            this.elements.canvasContext = this.elements.gameCanvas.getContext('2d');
            console.log("Canvas context initialized.");
            // Dessiner quelque chose de simple au début
            this.drawPlaceholderCanvas();
        } else {
             console.warn("Canvas non supporté ou élément non trouvé.");
         }


        // Attacher les écouteurs d'événements aux boutons
        this.elements.buildModeButton.addEventListener('click', () => this.enterBuildMode());
        this.elements.heroModeButton.addEventListener('click', () => this.enterHeroMode());
        this.elements.eventModeButton.addEventListener('click', () => this.enterEventMode());

         // Initialiser l'affichage des ressources
        if (typeof Simulation !== 'undefined' && Simulation.getResources) {
            this.updateResourceDisplay(Simulation.getResources());
        } else {
             console.warn("Simulation module not ready for initial resource display.");
        }

        console.log("UI Initialized.");
    },

    // Met à jour l'affichage des ressources dans le DOM
    updateResourceDisplay: function(resources) {
        if (!this.elements.resourceWood) { // Vérifie si l'UI est initialisée
            // console.warn("UI elements not yet available for resource update.");
            return;
        }
        this.elements.resourceWood.textContent = Math.floor(resources.wood);
        this.elements.resourceStone.textContent = Math.floor(resources.stone);
        this.elements.resourceGold.textContent = resources.gold.toFixed(2); // Garde 2 décimales pour l'or
        this.elements.resourceMana.textContent = resources.mana.toFixed(2); // et le mana
    },

    // Fonctions pour changer de mode (modifie le contenu de mode-content-area)
    enterBuildMode: function() {
        console.log("Entering Build Mode...");
        this.elements.modeContentArea.innerHTML = `
            <h3>Mode Construction</h3>
            <p>Ici, vous pourrez placer des bâtiments.</p>
            <button id="build-farm-btn">Construire Ferme (Coût: 20 Bois, 10 Pierre)</button>
            <button id="build-barracks-btn">Construire Caserne (Coût: 50 Bois, 30 Pierre, 10 Or)</button>
            `;
         // Ajouter les listeners pour les nouveaux boutons
         document.getElementById('build-farm-btn')?.addEventListener('click', () => {
             console.log("Tentative de construction : Ferme");
             Simulation.spendResources({ wood: 20, stone: 10 });
         });
         document.getElementById('build-barracks-btn')?.addEventListener('click', () => {
             console.log("Tentative de construction : Caserne");
             Simulation.spendResources({ wood: 50, stone: 30, gold: 10 });
         });
    },

    enterHeroMode: function() {
        console.log("Entering Hero Management Mode...");
        this.elements.modeContentArea.innerHTML = `
            <h3>Gestion des Héros</h3>
            <p>Recrutez et gérez vos héros.</p>
            <button id="recruit-warrior-btn">Recruter Guerrier (50 Or, 10 Bois)</button>
            <button id="recruit-mage-btn">Recruter Mage (70 Or, 20 Mana)</button>
            <div id="hero-list-display">
                <h4>Héros Actuels :</h4>
                <ul></ul>
            </div>
        `;
        this.updateHeroList(Heroes.getHeroes()); // Afficher la liste actuelle

         // Listeners pour les boutons de recrutement
         document.getElementById('recruit-warrior-btn')?.addEventListener('click', () => {
             Heroes.recruitNewHero("Guerrier Anonyme", "Guerrier"); // Utilise la fonction de heroes.js
         });
         document.getElementById('recruit-mage-btn')?.addEventListener('click', () => {
              // Exemple avec un coût différent (il faudrait le rendre dynamique)
              if (Simulation.spendResources({ gold: 70, mana: 20 })) {
                   Heroes.recruitNewHero("Mage Débutant", "Mage");
              }
         });
    },

     // Met à jour la liste des héros dans l'interface (mode héros)
    updateHeroList: function(heroes) {
        const heroListElement = this.elements.modeContentArea.querySelector('#hero-list-display ul');
        if (!heroListElement) return; // Ne fait rien si on n'est pas en mode héros

        heroListElement.innerHTML = ''; // Vide la liste précédente
        if (heroes.length === 0) {
            heroListElement.innerHTML = '<li>Aucun héros recruté pour le moment.</li>';
        } else {
            heroes.forEach(hero => {
                const li = document.createElement('li');
                li.textContent = `ID: ${hero.id} - ${hero.name} (${hero.role}) - Nv: ${hero.level} (XP: ${hero.xp})`;
                // TODO: Ajouter des boutons d'action par héros (assigner tâche, etc.)
                heroListElement.appendChild(li);
            });
        }
    },

    enterEventMode: function() {
        console.log("Entering Event Management Mode...");
        this.elements.modeContentArea.innerHTML = `
            <h3>Gestion des Événements</h3>
            <p>Déclenchez ou répondez aux événements.</p>
            <button id="trigger-random-event-btn">Déclencher Événement Aléatoire</button>
             <button id="trigger-blessing-btn">Déclencher Bénédiction Sylvestre (Test)</button>
        `;
         // Listener pour déclencher un événement aléatoire
         document.getElementById('trigger-random-event-btn')?.addEventListener('click', () => {
             Events.triggerRandomEvent();
         });
         document.getElementById('trigger-blessing-btn')?.addEventListener('click', () => {
             Events.triggerSpecificEvent("Bénédiction Sylvestre");
         });
    },

    // Ajoute une entrée dans le journal des événements
    logEvent: function(message, type = 'info') { // type peut être 'info', 'warning', 'error', 'success'
         if (!this.elements.eventLogList) return;

         const li = document.createElement('li');
         li.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
         li.classList.add(`event-${type}`); // Pour styliser différemment (via CSS)

         // Ajoute au début de la liste
         this.elements.eventLogList.prepend(li);

         // Limite le nombre d'entrées dans le log (ex: 20 dernières)
         while (this.elements.eventLogList.children.length > 20) {
             this.elements.eventLogList.removeChild(this.elements.eventLogList.lastChild);
         }
    },

    // Fonction pour afficher des messages temporaires (pourrait être une popup ou une zone dédiée)
    displayMessage: function(message, type = 'info') {
        // Pour l'instant, on logue dans la console et dans le journal d'événements
        console.log(`[MESSAGE - ${type.toUpperCase()}]: ${message}`);
        this.logEvent(message, type);
        // TODO: Implémenter un affichage plus visible (ex: une petite boîte de notification)
    },

    // Fonction simple pour dessiner sur le canvas (placeholder)
    drawPlaceholderCanvas: function() {
        if (!this.elements.canvasContext) return;
        const ctx = this.elements.canvasContext;
        const canvas = this.elements.gameCanvas;

        // Nettoyer le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dessiner un fond simple
        ctx.fillStyle = '#e0f0e0'; // Vert pâle
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dessiner un texte
        ctx.fillStyle = '#333';
        ctx.font = '20px MedievalSharp'; // Utiliser la police thématique
        ctx.textAlign = 'center';
        ctx.fillText('Le Royaume d\'Aldoria', canvas.width / 2, canvas.height / 2);

        // TODO: Ajouter des éléments graphiques réels (bâtiments, unités...)
    },

     // Fonction pour gérer les animations du canvas (appelée dans la boucle de jeu)
    animateCanvas: function(timestamp) {
        if (!this.elements.canvasContext) return;
         // Pour l'instant, redessine juste le placeholder
         // this.drawPlaceholderCanvas();

         // TODO: Implémenter une logique d'animation plus complexe ici
         // Mettre à jour les positions, dessiner les sprites, etc.
         // requestAnimationFrame(this.animateCanvas.bind(this)); // Pour une boucle d'animation fluide
    }

};