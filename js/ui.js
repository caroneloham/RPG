// js/ui.js
console.log("UI module loaded.");

const UI = {
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
        heroListDisplay: null,      // Référence spécifique pour la liste ul des héros
        heroCapacityDisplay: null, // Référence spécifique pour le p de capacité héros
    },
    activeMode: null, // Pour savoir quel mode est actif ('build', 'hero', 'event')

    init: function() {
        console.log("Initializing UI...");
        // Récupération des éléments principaux
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

        // Vérification critique de l'existence des éléments
        let missingElement = false;
        for (const key in this.elements) {
             // Ne pas vérifier les éléments spécifiques aux modes ici (heroListDisplay, heroCapacityDisplay)
             if (key !== 'heroListDisplay' && key !== 'heroCapacityDisplay' && !this.elements[key]) {
                 console.error(`Erreur UI Init: Élément DOM manquant - #${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
                 missingElement = true;
             }
        }
        if (missingElement) {
             console.error("Arrêt de l'initialisation de l'UI car des éléments clés sont manquants.");
             // Optionnel : Afficher un message d'erreur à l'utilisateur dans le body
             document.body.innerHTML = "<h1>Erreur Critique</h1><p>Impossible d'initialiser l'interface du jeu. Veuillez vérifier la console (F12).</p>";
             return; // Arrêter l'exécution de init
        }


        // Initialisation du Canvas
        if (this.elements.gameCanvas.getContext) {
            this.elements.canvasContext = this.elements.gameCanvas.getContext('2d');
            console.log("Canvas context initialized.");
            // Le premier dessin sera fait par App.js après l'init de Simulation
        } else {
             console.warn("Le Canvas HTML5 n'est pas supporté par ce navigateur.");
             // On pourrait désactiver les fonctionnalités liées au canvas ou afficher un message
             this.elements.gameCanvas.style.display = 'none'; // Cacher le canvas
        }


        // Attacher les écouteurs d'événements aux boutons de mode principaux
        this.elements.buildModeButton.addEventListener('click', () => this.enterBuildMode());
        this.elements.heroModeButton.addEventListener('click', () => this.enterHeroMode());
        this.elements.eventModeButton.addEventListener('click', () => this.enterEventMode());

        // Afficher un message initial dans la zone de contenu
        this.elements.modeContentArea.innerHTML = '<p>Bienvenue, Seigneur/Seigneuresse ! Sélectionnez un mode ci-dessus pour commencer à gérer votre royaume.</p>';

        // Mettre à jour l'affichage initial des ressources (si Simulation est déjà chargée)
        if (typeof Simulation !== 'undefined' && Simulation.getResources) {
            this.updateResourceDisplay(Simulation.getResources());
        } else {
             console.warn("Simulation module not ready during UI init for initial resource display.");
             // Afficher 0 partout par défaut si Simulation n'est pas prêt
             this.updateResourceDisplay({ wood: 0, stone: 0, gold: 0, mana: 0 });
        }

        console.log("UI Initialized successfully.");
    },

    // Met à jour l'affichage des 4 ressources principales
    updateResourceDisplay: function(resources) {
        // Vérifier si les éléments existent (sécurité post-init)
        if (!this.elements.resourceWood || !this.elements.resourceStone || !this.elements.resourceGold || !this.elements.resourceMana) {
            // console.warn("UI elements for resources not available for update.");
            return;
        }
        this.elements.resourceWood.textContent = Math.floor(resources.wood);
        this.elements.resourceStone.textContent = Math.floor(resources.stone);
        this.elements.resourceGold.textContent = resources.gold.toFixed(2); // Garde 2 décimales
        this.elements.resourceMana.textContent = resources.mana.toFixed(2); // Garde 2 décimales
    },

    // --- Gestion du Mode Construction ---
    enterBuildMode: function() {
        console.log("Entering Build Mode...");
        this.activeMode = 'build';
        // Vider les références spécifiques aux autres modes
        this.elements.heroListDisplay = null;
        this.elements.heroCapacityDisplay = null;
        this.updateBuildModeUI(); // Appelle la fonction dédiée à la mise à jour de ce mode
    },

    // Met à jour le contenu de la zone #mode-content-area pour le mode construction
    updateBuildModeUI: function() {
        // Ne fait rien si on n'est pas censé être en mode construction
        if (this.activeMode !== 'build' || !this.elements.modeContentArea) return;

        // Vérifier si BuildingTypes est disponible
        if (typeof BuildingTypes === 'undefined') {
             this.elements.modeContentArea.innerHTML = '<h3>Erreur</h3><p>Les définitions des bâtiments n\'ont pas pu être chargées.</p>';
             console.error("BuildingTypes non défini lors de la mise à jour de l'UI Build Mode.");
             return;
        }

        let content = `<h3>Mode Construction</h3>
                       <p>Construisez de nouveaux bâtiments (achat unique) ou améliorez ceux existants.</p>
                       <div id="building-list">`;

        const constructedData = Simulation.getConstructedBuildingsData(); // Récupère les données à jour
        const constructedIds = constructedData.map(b => b.typeId);

        // Boucle sur TOUS les types de bâtiments définis dans BuildingTypes
        for (const typeId in BuildingTypes) {
            const type = BuildingTypes[typeId];
            const isBuilt = constructedIds.includes(typeId);
            const buildingInstanceData = isBuilt ? constructedData.find(b => b.typeId === typeId) : null;

            // Formatter le coût pour affichage lisible
            const formatCost = (costObject) => {
                if (!costObject) return "N/A";
                return Object.entries(costObject)
                             .map(([res, val]) => `${val} ${res.charAt(0).toUpperCase() + res.slice(1)}`)
                             .join(', ');
            };

            content += `<div class="building-option">
                           <h4>${type.name} ${isBuilt ? `(Niveau ${buildingInstanceData.level}/${type.maxLevel})` : ''}</h4>
                           <p>${type.description}</p>`;

            if (isBuilt) {
                // Si le bâtiment est construit
                if (buildingInstanceData.level < type.maxLevel) {
                    // Et qu'il peut être amélioré
                    const upgradeCost = buildingInstanceData.upgradeCost; // Coût calculé par getConstructedBuildingsData
                    const costString = formatCost(upgradeCost);
                    content += `<p><strong>Coût Amélio. (Nv ${buildingInstanceData.level + 1}):</strong> ${costString}</p>
                                <button class="btn-upgrade" data-building-id="${typeId}">Améliorer</button>`;
                } else {
                    // Si au niveau maximum
                    content += `<p><strong class="max-level-notice">Niveau Maximum Atteint</strong></p>`;
                }
            } else {
                // Si le bâtiment n'est pas construit
                const buildCost = Simulation.calculateCost(type, 0); // Coût pour niveau 1 (level 0)
                const costString = formatCost(buildCost);
                content += `<p><strong>Coût Construction:</strong> ${costString}</p>
                            <button class="btn-build" data-building-id="${typeId}">Construire</button>`;
            }
            content += `</div>`; // Fin de .building-option
        }

        content += `</div>`; // Fin de #building-list
        this.elements.modeContentArea.innerHTML = content;

        // Rattacher les écouteurs d'événements aux nouveaux boutons créés
        this.attachBuildModeListeners();
    },

    // Attache les listeners pour les boutons Construire/Améliorer
    attachBuildModeListeners: function() {
         this.elements.modeContentArea.querySelectorAll('.btn-build').forEach(button => {
            // Supprimer l'ancien listener s'il existe pour éviter les doublons (bonne pratique)
            button.replaceWith(button.cloneNode(true)); // Crée un clone sans listeners
        });
         this.elements.modeContentArea.querySelectorAll('.btn-upgrade').forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });

         // Ajouter les nouveaux listeners aux clones
         this.elements.modeContentArea.querySelectorAll('.btn-build').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.buildingId;
                console.log(`Click Construire: ${id}`);
                Simulation.buildBuilding(id);
                // L'UI est mise à jour DANS buildBuilding s'il réussit (via recalculate -> updateBuildModeUI)
            });
        });
        this.elements.modeContentArea.querySelectorAll('.btn-upgrade').forEach(button => {
             button.addEventListener('click', (e) => {
                const id = e.target.dataset.buildingId;
                 console.log(`Click Améliorer: ${id}`);
                Simulation.upgradeBuilding(id);
                 // L'UI est mise à jour DANS upgradeBuilding s'il réussit (via recalculate -> updateBuildModeUI)
            });
        });
    },

    // --- Gestion du Mode Héros ---
    enterHeroMode: function() {
        console.log("Entering Hero Management Mode...");
        this.activeMode = 'hero';
        // Générer la structure HTML de base pour ce mode
        this.elements.modeContentArea.innerHTML = `
            <h3>Gestion des Héros</h3>
            <p id="hero-capacity-display">Capacité: ... / ...</p>
            <p>Recrutez de nouveaux héros ou gérez ceux existants.</p>
            <div class="recruitment-options">
                <button id="recruit-warrior-btn" disabled title="Nécessite une Caserne.">Recruter Guerrier (Coût: 50 Or, 10 Bois)</button>
                <button id="recruit-mage-btn" disabled title="Nécessite une Tour de Mage.">Recruter Mage (Coût: 70 Or, 20 Mana)</button>
                <!-- Ajouter d'autres options de recrutement ici -->
            </div>
            <div id="hero-list-display">
                <h4>Héros Actuels :</h4>
                <ul><li>Chargement de la liste des héros...</li></ul>
            </div>
        `;
        // Récupérer les références aux éléments spécifiques à ce mode
        this.elements.heroListDisplay = this.elements.modeContentArea.querySelector('#hero-list-display ul');
        this.elements.heroCapacityDisplay = this.elements.modeContentArea.querySelector('#hero-capacity-display');

        // Vérifier si les éléments ont bien été trouvés
        if (!this.elements.heroListDisplay || !this.elements.heroCapacityDisplay) {
            console.error("Erreur UI Hero Mode: Impossible de trouver #hero-list-display ul ou #hero-capacity-display.");
            this.elements.modeContentArea.innerHTML += "<p class='error-message'>Erreur lors de l'affichage des détails des héros.</p>";
            return;
        }

        // Mettre à jour immédiatement l'affichage avec les données actuelles
        this.updateHeroList(Heroes.getHeroes()); // Met à jour la liste <ul>
        this.updateHeroCapacity(Simulation.stats.maxHeroCapacity); // Met à jour le texte capacité X/Y
        // this.checkRecruitmentAvailability(); // Est appelé par updateHeroList et updateHeroCapacity

        // Attacher les écouteurs aux boutons de recrutement
        this.attachHeroModeListeners();
    },

    // Met à jour la liste <ul> des héros dans l'interface
    updateHeroList: function(heroes) {
        // Vérifie si l'élément existe (on doit être en mode héros)
        if (this.activeMode !== 'hero' || !this.elements.heroListDisplay) {
            // console.warn("Tentative de mise à jour de la liste des héros hors du mode héros.");
            return;
        }

        this.elements.heroListDisplay.innerHTML = ''; // Vide la liste précédente
        if (heroes.length === 0) {
            this.elements.heroListDisplay.innerHTML = '<li>Aucun héros n\'a été recruté pour le moment.</li>';
        } else {
            heroes.forEach(hero => {
                const li = document.createElement('li');
                li.textContent = `ID: ${hero.id} | ${hero.name} (${hero.role}) - Nv. ${hero.level} (XP: ${hero.xp})`;
                // TODO: Ajouter des boutons d'action par héros (assigner, détails, etc.)
                this.elements.heroListDisplay.appendChild(li);
            });
        }
        // Après avoir mis à jour la liste (et donc potentiellement le nombre actuel), vérifier la dispo du recrutement
        this.checkRecruitmentAvailability();
    },

    // Met à jour le texte affichant la capacité actuelle / maximale des héros
    updateHeroCapacity: function(maxCapacity) {
        // Vérifie si l'élément existe (on doit être en mode héros)
       if (this.activeMode !== 'hero' || !this.elements.heroCapacityDisplay) {
           // console.warn("Tentative de mise à jour de la capacité héros hors du mode héros.");
           return;
       }

        const currentHeroes = Heroes.getHeroes().length; // Récupère le nombre actuel
        this.elements.heroCapacityDisplay.textContent = `Capacité Héros: ${currentHeroes} / ${maxCapacity}`;

        // Après avoir mis à jour la capacité max (qui peut changer avec les bâtiments), vérifier la dispo du recrutement
        this.checkRecruitmentAvailability();
    },

    // Vérifie les conditions (bâtiments requis, capacité) pour activer/désactiver les boutons de recrutement
    checkRecruitmentAvailability: function() {
        if (this.activeMode !== 'hero') return; // Seulement en mode héros

        const currentHeroes = Heroes.getHeroes().length;
        const maxCapacity = Simulation.stats.maxHeroCapacity;
        const canRecruitMore = currentHeroes < maxCapacity;

        const builtBuildings = Simulation.getConstructedBuildingsData(); // Donne un tableau d'objets bâtiment
        const hasBarracks = builtBuildings.some(b => b.typeId === 'caserne' && b.level > 0);
        const hasMageTower = builtBuildings.some(b => b.typeId === 'tour_mage' && b.level > 0);
        // Ajouter ici les vérifications pour d'autres types de héros si nécessaire

        const warriorBtn = document.getElementById('recruit-warrior-btn');
        const mageBtn = document.getElementById('recruit-mage-btn');

        // Activer/Désactiver le bouton Guerrier
        if (warriorBtn) {
            if (canRecruitMore && hasBarracks) {
                warriorBtn.disabled = false;
                warriorBtn.title = "Recruter un Guerrier"; // Tooltip normal
            } else {
                warriorBtn.disabled = true;
                if (!hasBarracks) {
                    warriorBtn.title = "Nécessite une Caserne (Niveau 1 ou plus).";
                } else if (!canRecruitMore) {
                    warriorBtn.title = "Capacité maximale de héros atteinte.";
                } else {
                     warriorBtn.title = "Recrutement impossible pour le moment."; // Générique
                }
            }
        }

        // Activer/Désactiver le bouton Mage
        if (mageBtn) {
            if (canRecruitMore && hasMageTower) {
                mageBtn.disabled = false;
                mageBtn.title = "Recruter un Mage";
            } else {
                mageBtn.disabled = true;
                 if (!hasMageTower) {
                    mageBtn.title = "Nécessite une Tour de Mage (Niveau 1 ou plus).";
                } else if (!canRecruitMore) {
                    mageBtn.title = "Capacité maximale de héros atteinte.";
                } else {
                     mageBtn.title = "Recrutement impossible pour le moment.";
                }
            }
        }
    },

    // Attache les listeners pour les boutons de recrutement
     attachHeroModeListeners: function() {
        const warriorBtn = document.getElementById('recruit-warrior-btn');
        const mageBtn = document.getElementById('recruit-mage-btn');

        if (warriorBtn) {
             // Remplacer pour éviter double listener
            const newWarriorBtn = warriorBtn.cloneNode(true);
            warriorBtn.parentNode.replaceChild(newWarriorBtn, warriorBtn);
            newWarriorBtn.addEventListener('click', () => {
                console.log("Click Recruter Guerrier");
                // Vérifier à nouveau juste avant l'action (sécurité)
                if (Heroes.getHeroes().length < Simulation.stats.maxHeroCapacity && Simulation.getConstructedBuildingsData().some(b => b.typeId === 'caserne')) {
                    const cost = { gold: 50, wood: 10 }; // Coût spécifique au guerrier
                    if (Simulation.spendResources(cost)) {
                        Heroes.recruitNewHero("Guerrier Recrue", "Guerrier"); // Nom exemple
                    } // Message d'erreur géré par spendResources si échec
                } else {
                     this.displayMessage("Conditions de recrutement non remplies (capacité ou bâtiment).", "warning");
                     this.checkRecruitmentAvailability(); // Re-vérifier pour màj le bouton si état a changé
                }
            });
        }

         if (mageBtn) {
              const newMageBtn = mageBtn.cloneNode(true);
              mageBtn.parentNode.replaceChild(newMageBtn, mageBtn);
              newMageBtn.addEventListener('click', () => {
                console.log("Click Recruter Mage");
                 if (Heroes.getHeroes().length < Simulation.stats.maxHeroCapacity && Simulation.getConstructedBuildingsData().some(b => b.typeId === 'tour_mage')) {
                    const cost = { gold: 70, mana: 20 }; // Coût spécifique au mage
                     if (Simulation.spendResources(cost)) {
                        Heroes.recruitNewHero("Mage Apprenti", "Mage"); // Nom exemple
                    }
                } else {
                     this.displayMessage("Conditions de recrutement non remplies (capacité ou bâtiment).", "warning");
                     this.checkRecruitmentAvailability();
                }
            });
        }
    },

    // --- Gestion du Mode Événements ---
    enterEventMode: function() {
        console.log("Entering Event Management Mode...");
        this.activeMode = 'event';
         // Vider les références spécifiques aux autres modes
        this.elements.heroListDisplay = null;
        this.elements.heroCapacityDisplay = null;
        // Afficher le contenu et les boutons pour ce mode
        this.elements.modeContentArea.innerHTML = `
            <h3>Gestion des Événements</h3>
            <p>Les événements aléatoires impactent votre royaume. Vous pouvez aussi en déclencher certains manuellement ici pour tester.</p>
            <button id="trigger-random-event-btn">Déclencher Événement Aléatoire</button>
            <button id="trigger-blessing-btn">Déclencher Bénédiction Sylvestre (Test)</button>
             <button id="trigger-disaster-btn">Déclencher Tempête (Test)</button>
        `;
        // Attacher les listeners
        this.attachEventModeListeners();
    },

    // Attache les listeners pour les boutons du mode événement
    attachEventModeListeners: function() {
         const randomBtn = document.getElementById('trigger-random-event-btn');
         const blessingBtn = document.getElementById('trigger-blessing-btn');
         const disasterBtn = document.getElementById('trigger-disaster-btn');

         if (randomBtn) {
             const newRandomBtn = randomBtn.cloneNode(true);
             randomBtn.parentNode.replaceChild(newRandomBtn, randomBtn);
             newRandomBtn.addEventListener('click', () => Events.triggerRandomEvent());
         }
         if (blessingBtn) {
             const newBlessingBtn = blessingBtn.cloneNode(true);
             blessingBtn.parentNode.replaceChild(newBlessingBtn, blessingBtn);
             newBlessingBtn.addEventListener('click', () => Events.triggerSpecificEvent("Bénédiction Sylvestre"));
         }
         if (disasterBtn) {
             const newDisasterBtn = disasterBtn.cloneNode(true);
             disasterBtn.parentNode.replaceChild(newDisasterBtn, disasterBtn);
             newDisasterBtn.addEventListener('click', () => Events.triggerSpecificEvent("Tempête Inattendue"));
         }
    },

    // --- Fonctions Utilitaires UI ---

    // Ajoute une entrée dans le journal des événements en haut de la liste
    logEvent: function(message, type = 'info') { // types: 'info', 'warning', 'error', 'success'
         if (!this.elements.eventLogList) return;

         const li = document.createElement('li');
         // Formatage simple de l'heure
         const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
         li.innerHTML = `<span class="event-time">[${time}]</span> <span class="event-message">${message}</span>`; // Utiliser innerHTML pour les spans
         li.classList.add(`event-${type}`); // Classe CSS pour le style (ex: couleur)

         // Insérer au début de la liste <ul>
         this.elements.eventLogList.prepend(li);

         // Limiter le nombre d'entrées pour éviter de surcharger le DOM
         while (this.elements.eventLogList.children.length > 30) { // Garde les 30 dernières entrées
             this.elements.eventLogList.removeChild(this.elements.eventLogList.lastChild);
         }
    },

    // Affiche un message à l'utilisateur (actuellement via logEvent, pourrait être une notification)
    displayMessage: function(message, type = 'info') {
        // Pour l'instant, on logue dans la console ET dans le journal des événements
        console.log(`[MSG-${type.toUpperCase()}]: ${message}`);
        this.logEvent(message, type);

        // TODO: Implémenter un système de notifications "Toast" ou similaire pour plus de visibilité
        // Exemple simple (nécessiterait CSS pour le style et positionnement):
        /*
        const notification = document.createElement('div');
        notification.className = `game-notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000); // Disparaît après 3 secondes
        */
    },

    // --- Dessin sur le Canvas ---

    // Fonction principale pour dessiner tout l'état du jeu sur le canvas
    drawGame: function() {
        if (!this.elements.canvasContext) {
            // console.warn("Tentative de dessin sans contexte canvas.");
            return;
        }
        const ctx = this.elements.canvasContext;
        const canvas = this.elements.gameCanvas;

        // 1. Nettoyer complètement le canvas avant de redessiner
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Dessiner le fond (peut devenir une image ou une grille plus tard)
        ctx.fillStyle = '#c2b280'; // Couleur terre/sable un peu plus foncée
        ctx.fillRect(0, 0, canvas.width, canvas.height);
         // Optionnel : Dessiner une grille légère
         this.drawGrid(ctx, canvas.width, canvas.height, 50); // Grille de 50x50 pixels

        // 3. Dessiner les bâtiments construits
        this.drawBuildings(ctx);

        // 4. Dessiner les héros (sera implémenté plus tard)
        // this.drawHeroes(ctx);

        // 5. Dessiner d'autres éléments UI sur le canvas si nécessaire (ex: zone sélectionnée)
    },

    // Dessine une grille sur le canvas (fonction utilitaire)
    drawGrid: function(ctx, width, height, gridSize) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'; // Couleur gris très léger
        ctx.lineWidth = 0.5;

        for (let x = gridSize; x < width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        for (let y = gridSize; y < height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();
         ctx.lineWidth = 1; // Remettre la valeur par défaut
    },


    // Dessine les bâtiments sur le canvas
    drawBuildings: function(ctx) {
        const buildings = Simulation.getConstructedBuildingsData(); // Récupère les données à jour
        const baseBuildingSize = 35; // Taille de base
        const sizeIncreasePerLevel = 2; // Augmente légèrement la taille par niveau

        buildings.forEach(building => {
            const level = building.level;
            const buildingSize = baseBuildingSize + (level - 1) * sizeIncreasePerLevel;
            const x = building.position.x; // Centre X
            const y = building.position.y; // Centre Y
            const halfSize = buildingSize / 2;

            // Dessiner la forme du bâtiment (carré avec bordure)
            ctx.fillStyle = building.color || '#CCCCCC'; // Utilise la couleur définie ou gris
            ctx.fillRect(x - halfSize, y - halfSize, buildingSize, buildingSize);

            ctx.strokeStyle = '#333333'; // Bordure noire
            ctx.lineWidth = (level > 3) ? 2 : 1; // Bordure plus épaisse pour haut niveau
            ctx.strokeRect(x - halfSize, y - halfSize, buildingSize, buildingSize);
             ctx.lineWidth = 1; // Réinitialiser

            // Afficher le niveau du bâtiment au centre
            ctx.fillStyle = '#FFFFFF'; // Texte blanc pour contraste
             ctx.shadowColor = 'black'; // Ombre pour lisibilité
             ctx.shadowBlur = 2;
            ctx.font = `bold ${10 + level}px Arial`; // Taille de police augmente avec niveau
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle'; // Aligner verticalement au centre
            ctx.fillText(`Lv${level}`, x, y);

             // Réinitialiser l'ombre
             ctx.shadowColor = 'transparent';
             ctx.shadowBlur = 0;

            // TODO: Ajouter une indication visuelle si améliorable ? Ou au survol ?
        });
    },

    // Fonction pour gérer les animations du canvas (si nécessaire plus tard)
    // animateCanvas: function(timestamp) {
    //     // Mettre à jour les positions, états des animations...
    //     this.drawGame(); // Redessiner l'état mis à jour
    //     // Demander la prochaine frame
    //     requestAnimationFrame(this.animateCanvas.bind(this));
    // }
};
