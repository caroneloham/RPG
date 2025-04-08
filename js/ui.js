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
             this.updateResourceDisplay({ wood: 0, stone: 0, gold: 0, mana: 0 });
        }

        console.log("UI Initialized successfully.");
    },

    // Met à jour l'affichage des 4 ressources principales
    updateResourceDisplay: function(resources) {
        if (!this.elements.resourceWood || !this.elements.resourceStone || !this.elements.resourceGold || !this.elements.resourceMana) {
            return;
        }
        this.elements.resourceWood.textContent = Math.floor(resources.wood);
        this.elements.resourceStone.textContent = Math.floor(resources.stone);
        this.elements.resourceGold.textContent = resources.gold.toFixed(2);
        this.elements.resourceMana.textContent = resources.mana.toFixed(2);
    },

    // --- Gestion du Mode Construction ---
    enterBuildMode: function() {
        console.log("Entering Build Mode...");
        this.activeMode = 'build';
        this.elements.heroListDisplay = null;
        this.elements.heroCapacityDisplay = null;
        this.updateBuildModeUI();
    },

    updateBuildModeUI: function() {
        if (this.activeMode !== 'build' || !this.elements.modeContentArea) return;
        if (typeof BuildingTypes === 'undefined') {
             this.elements.modeContentArea.innerHTML = '<h3>Erreur</h3><p>Les définitions des bâtiments n\'ont pas pu être chargées.</p>';
             console.error("BuildingTypes non défini lors de la mise à jour de l'UI Build Mode.");
             return;
        }

        let content = `<h3>Mode Construction</h3>
                       <p>Construisez de nouveaux bâtiments (achat unique) ou améliorez ceux existants.</p>
                       <div id="building-list">`;

        const constructedData = Simulation.getConstructedBuildingsData();
        const constructedIds = constructedData.map(b => b.typeId);

        const formatCost = (costObject) => {
            if (!costObject) return "N/A";
            return Object.entries(costObject)
                         .map(([res, val]) => `${val} ${res.charAt(0).toUpperCase() + res.slice(1)}`)
                         .join(', ');
        };

        for (const typeId in BuildingTypes) {
            const type = BuildingTypes[typeId];
            const isBuilt = constructedIds.includes(typeId);
            const buildingInstanceData = isBuilt ? constructedData.find(b => b.typeId === typeId) : null;

            content += `<div class="building-option">
                           <h4>${type.name} ${isBuilt ? `(Niveau ${buildingInstanceData.level}/${type.maxLevel})` : ''}</h4>
                           <p>${type.description}</p>`;

            if (isBuilt) {
                if (buildingInstanceData.level < type.maxLevel) {
                    const upgradeCost = buildingInstanceData.upgradeCost;
                    const costString = formatCost(upgradeCost);
                    content += `<p><strong>Coût Amélio. (Nv ${buildingInstanceData.level + 1}):</strong> ${costString}</p>
                                <button class="btn-upgrade" data-building-id="${typeId}">Améliorer</button>`;
                } else {
                    content += `<p><strong class="max-level-notice">Niveau Maximum Atteint</strong></p>`;
                }
            } else {
                const buildCost = Simulation.calculateCost(type, 0);
                const costString = formatCost(buildCost);
                content += `<p><strong>Coût Construction:</strong> ${costString}</p>
                            <button class="btn-build" data-building-id="${typeId}">Construire</button>`;
            }
            content += `</div>`;
        }

        content += `</div>`;
        this.elements.modeContentArea.innerHTML = content;
        this.attachBuildModeListeners();
    },

    attachBuildModeListeners: function() {
         this.elements.modeContentArea.querySelectorAll('.btn-build').forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
         this.elements.modeContentArea.querySelectorAll('.btn-upgrade').forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });

         this.elements.modeContentArea.querySelectorAll('.btn-build').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.buildingId;
                Simulation.buildBuilding(id);
            });
        });
        this.elements.modeContentArea.querySelectorAll('.btn-upgrade').forEach(button => {
             button.addEventListener('click', (e) => {
                const id = e.target.dataset.buildingId;
                Simulation.upgradeBuilding(id);
            });
        });
    },

    // --- Gestion du Mode Héros ---
    enterHeroMode: function() {
        console.log("Entering Hero Management Mode...");
        this.activeMode = 'hero';
        this.elements.modeContentArea.innerHTML = `
            <h3>Gestion des Héros</h3>
            <p id="hero-capacity-display">Capacité: ... / ...</p>
            <p>Recrutez de nouveaux héros ou gérez ceux existants.</p>
            <div class="recruitment-options">
                <button id="recruit-warrior-btn" disabled title="Nécessite une Caserne.">Recruter Guerrier (Coût: 50 Or, 10 Bois)</button>
                <button id="recruit-mage-btn" disabled title="Nécessite une Tour de Mage.">Recruter Mage (Coût: 70 Or, 20 Mana)</button>
            </div>
            <div id="hero-list-display">
                <h4>Héros Actuels :</h4>
                <ul><li>Chargement de la liste des héros...</li></ul>
            </div>
        `;
        this.elements.heroListDisplay = this.elements.modeContentArea.querySelector('#hero-list-display ul');
        this.elements.heroCapacityDisplay = this.elements.modeContentArea.querySelector('#hero-capacity-display');

        if (!this.elements.heroListDisplay || !this.elements.heroCapacityDisplay) {
            console.error("Erreur UI Hero Mode: Impossible de trouver #hero-list-display ul ou #hero-capacity-display.");
            this.elements.modeContentArea.innerHTML += "<p class='error-message'>Erreur lors de l'affichage des détails des héros.</p>";
            return;
        }

        this.updateHeroList(Heroes.getHeroes());
        this.updateHeroCapacity(Simulation.stats.maxHeroCapacity);
        this.attachHeroModeListeners();
    },

    updateHeroList: function(heroes) {
        if (this.activeMode !== 'hero' || !this.elements.heroListDisplay) {
            return;
        }

        this.elements.heroListDisplay.innerHTML = ''; // Vide la liste
        if (heroes.length === 0) {
            this.elements.heroListDisplay.innerHTML = '<li>Aucun héros n\'a été recruté pour le moment.</li>';
        } else {
            heroes.forEach(hero => {
                const li = document.createElement('li');
                li.textContent = `ID: ${hero.id} | ${hero.name} (${hero.role}) - Nv. ${hero.level} (XP: ${hero.xp})`;
                this.elements.heroListDisplay.appendChild(li);
            });
        }
        this.checkRecruitmentAvailability();
    },

    updateHeroCapacity: function(maxCapacity) {
       if (this.activeMode !== 'hero' || !this.elements.heroCapacityDisplay) {
           return;
       }
        const currentHeroes = Heroes.getHeroes().length;
        this.elements.heroCapacityDisplay.textContent = `Capacité Héros: ${currentHeroes} / ${maxCapacity}`;
        this.checkRecruitmentAvailability();
    },

    checkRecruitmentAvailability: function() {
        if (this.activeMode !== 'hero') return;

        const currentHeroes = Heroes.getHeroes().length;
        const maxCapacity = Simulation.stats.maxHeroCapacity;
        const canRecruitMore = currentHeroes < maxCapacity;

        const builtBuildings = Simulation.getConstructedBuildingsData();
        const hasBarracks = builtBuildings.some(b => b.typeId === 'caserne' && b.level > 0);
        const hasMageTower = builtBuildings.some(b => b.typeId === 'tour_mage' && b.level > 0);

        const warriorBtn = document.getElementById('recruit-warrior-btn');
        const mageBtn = document.getElementById('recruit-mage-btn');

        if (warriorBtn) {
            if (canRecruitMore && hasBarracks) {
                warriorBtn.disabled = false;
                warriorBtn.title = "Recruter un Guerrier";
            } else {
                warriorBtn.disabled = true;
                warriorBtn.title = !hasBarracks ? "Nécessite une Caserne (Niveau 1+)." : (!canRecruitMore ? "Capacité maximale de héros atteinte." : "Recrutement impossible.");
            }
        }

        if (mageBtn) {
            if (canRecruitMore && hasMageTower) {
                mageBtn.disabled = false;
                mageBtn.title = "Recruter un Mage";
            } else {
                mageBtn.disabled = true;
                 mageBtn.title = !hasMageTower ? "Nécessite une Tour de Mage (Niveau 1+)." : (!canRecruitMore ? "Capacité maximale de héros atteinte." : "Recrutement impossible.");
            }
        }
    },

     attachHeroModeListeners: function() {
        const warriorBtn = document.getElementById('recruit-warrior-btn');
        const mageBtn = document.getElementById('recruit-mage-btn');

        if (warriorBtn) {
            const newWarriorBtn = warriorBtn.cloneNode(true);
            warriorBtn.parentNode.replaceChild(newWarriorBtn, warriorBtn);
            newWarriorBtn.addEventListener('click', () => {
                if (Heroes.getHeroes().length < Simulation.stats.maxHeroCapacity && Simulation.getConstructedBuildingsData().some(b => b.typeId === 'caserne')) {
                    const cost = { gold: 50, wood: 10 };
                    if (Simulation.spendResources(cost)) {
                        Heroes.recruitNewHero("Guerrier Recrue", "Guerrier");
                    }
                } else {
                     this.displayMessage("Conditions de recrutement non remplies (capacité ou bâtiment).", "warning");
                     this.checkRecruitmentAvailability();
                }
            });
        }

         if (mageBtn) {
              const newMageBtn = mageBtn.cloneNode(true);
              mageBtn.parentNode.replaceChild(newMageBtn, mageBtn);
              newMageBtn.addEventListener('click', () => {
                 if (Heroes.getHeroes().length < Simulation.stats.maxHeroCapacity && Simulation.getConstructedBuildingsData().some(b => b.typeId === 'tour_mage')) {
                    const cost = { gold: 70, mana: 20 };
                     if (Simulation.spendResources(cost)) {
                        Heroes.recruitNewHero("Mage Apprenti", "Mage");
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
        this.elements.heroListDisplay = null;
        this.elements.heroCapacityDisplay = null;
        this.elements.modeContentArea.innerHTML = `
            <h3>Gestion des Événements</h3>
            <p>Les événements aléatoires impactent votre royaume. Vous pouvez aussi en déclencher certains manuellement ici pour tester.</p>
            <button id="trigger-random-event-btn">Déclencher Événement Aléatoire</button>
            <button id="trigger-blessing-btn">Déclencher Bénédiction Sylvestre (Test)</button>
             <button id="trigger-disaster-btn">Déclencher Tempête (Test)</button>
        `;
        this.attachEventModeListeners();
    },

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
    logEvent: function(message, type = 'info') {
         if (!this.elements.eventLogList) return;
         const li = document.createElement('li');
         const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
         li.innerHTML = `<span class="event-time">[${time}]</span> <span class="event-message">${message}</span>`;
         li.classList.add(`event-${type}`);
         this.elements.eventLogList.prepend(li);
         while (this.elements.eventLogList.children.length > 30) {
             this.elements.eventLogList.removeChild(this.elements.eventLogList.lastChild);
         }
    },

    displayMessage: function(message, type = 'info') {
        console.log(`[MSG-${type.toUpperCase()}]: ${message}`);
        this.logEvent(message, type);
        // Future amélioration: notification toast
    },

    // --- Dessin sur le Canvas ---

    // Fonction principale pour dessiner tout l'état du jeu sur le canvas
    drawGame: function() {
        if (!this.elements.canvasContext) {
            return;
        }
        const ctx = this.elements.canvasContext;
        const canvas = this.elements.gameCanvas;

        // 1. Nettoyer complètement le canvas avant de redessiner
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ************************************************
        // ********** NOUVELLE PARTIE : DESSIN DU FOND MAP **********
        // ************************************************
        this.drawMapBackground(ctx, canvas.width, canvas.height);


        // 3. Dessiner la grille (Optionnel, peut être désactivé si trop chargé)
        // Mettre une grille plus légère et peut-être pas sur toute la map
        this.drawGrid(ctx, canvas.width, canvas.height, 50, 'rgba(0, 0, 0, 0.08)'); // Grille plus discrète

        // 4. Dessiner les bâtiments construits PAR-DESSUS le fond et la grille
        this.drawBuildings(ctx);

        // 5. Dessiner les héros (futur)
        // this.drawHeroes(ctx);

        // 6. Dessiner d'autres éléments UI sur le canvas si nécessaire
    },

    // NOUVELLE FONCTION : Dessine un fond de carte stylisé
    drawMapBackground: function(ctx, width, height) {
        // Zone principale (Plaines vertes)
        ctx.fillStyle = '#8FBC8F'; // DarkSeaGreen (couleur de base pour les plaines)
        ctx.fillRect(0, 0, width, height);

        // Zone d'eau (ex: un lac ou une rivière dans un coin)
        ctx.fillStyle = '#6495ED'; // CornflowerBlue
        ctx.beginPath();
        ctx.moveTo(width * 0.7, 0); // Coin supérieur droit
        ctx.lineTo(width, 0);
        ctx.lineTo(width, height * 0.4);
        ctx.quadraticCurveTo(width * 0.85, height * 0.45, width * 0.65, height * 0.3); // Courbe pour le bord du lac
        ctx.closePath();
        ctx.fill();

        // Zone de forêt (ex: une bande sur le côté gauche)
        ctx.fillStyle = '#228B22'; // ForestGreen
        ctx.fillRect(0, 0, width * 0.15, height); // Bande verticale à gauche
         // Ajouter quelques "arbres" stylisés (cercles) pour la texture
         ctx.fillStyle = '#006400'; // DarkGreen
         for(let i=0; i<15; i++) {
             const treeX = Math.random() * (width * 0.14);
             const treeY = Math.random() * height;
             const treeRadius = Math.random() * 5 + 3; // Rayon entre 3 et 8
             ctx.beginPath();
             ctx.arc(treeX, treeY, treeRadius, 0, Math.PI * 2);
             ctx.fill();
         }


        // Zone de collines/montagnes (ex: en bas)
        ctx.fillStyle = '#A0522D'; // Sienna (couleur de base collines)
        ctx.beginPath();
        ctx.moveTo(0, height * 0.8);
        // Dessiner une ligne brisée pour simuler des collines
        ctx.lineTo(width * 0.1, height * 0.75);
        ctx.lineTo(width * 0.25, height * 0.85);
        ctx.lineTo(width * 0.4, height * 0.7);
        ctx.lineTo(width * 0.6, height * 0.9);
        ctx.lineTo(width * 0.75, height * 0.75);
        ctx.lineTo(width * 0.9, height * 0.85);
        ctx.lineTo(width, height * 0.8);
        // Remplir la zone sous la ligne jusqu'en bas
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
         // Ajouter quelques pics montagneux stylisés (triangles gris)
         ctx.fillStyle = '#696969'; // DimGray
         const peaks = [ [0.2, 0.8], [0.5, 0.75], [0.8, 0.82] ]; // Positions relatives x, y (haut du triangle)
         peaks.forEach(p => {
             const peakX = width * p[0];
             const peakY = height * p[1];
             const baseWidth = width * 0.08;
             ctx.beginPath();
             ctx.moveTo(peakX - baseWidth/2, height * 0.9); // Base gauche
             ctx.lineTo(peakX, peakY); // Sommet
             ctx.lineTo(peakX + baseWidth/2, height * 0.9); // Base droite
             ctx.closePath();
             ctx.fill();
         });

        // Ajouter une texture légère ou un dégradé pourrait améliorer encore, mais restons simple pour l'instant.
         console.log("Map background drawn with terrain zones.");
    },


    // Dessine une grille sur le canvas (fonction utilitaire)
    drawGrid: function(ctx, width, height, gridSize, gridColor = 'rgba(0, 0, 0, 0.1)') {
        ctx.beginPath();
        ctx.strokeStyle = gridColor; // Utilise la couleur passée en paramètre
        ctx.lineWidth = 0.5; // Ligne très fine

        for (let x = gridSize; x < width; x += gridSize) {
            ctx.moveTo(x + 0.5, 0); // +0.5 pour des lignes plus nettes sur certains rendus
            ctx.lineTo(x + 0.5, height);
        }
        for (let y = gridSize; y < height; y += gridSize) {
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(width, y + 0.5);
        }
        ctx.stroke();
         ctx.lineWidth = 1; // Remettre la valeur par défaut pour les autres dessins
    },


    // Dessine les bâtiments sur le canvas
    drawBuildings: function(ctx) {
        const buildings = Simulation.getConstructedBuildingsData();
        const baseBuildingSize = 35;
        const sizeIncreasePerLevel = 2;

        buildings.forEach(building => {
            const level = building.level;
            const buildingSize = baseBuildingSize + (level - 1) * sizeIncreasePerLevel;
            const x = building.position.x; // Centre X
            const y = building.position.y; // Centre Y
            const halfSize = buildingSize / 2;

            // Appliquer une ombre légère aux bâtiments pour les détacher du fond
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // Dessiner la forme du bâtiment
            ctx.fillStyle = building.color || '#CCCCCC';
            ctx.fillRect(x - halfSize, y - halfSize, buildingSize, buildingSize);

            // Dessiner la bordure
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = (level > 3) ? 1.5 : 1; // Bordure légèrement plus épaisse pour haut niveau
            ctx.strokeRect(x - halfSize, y - halfSize, buildingSize, buildingSize);

            // Réinitialiser l'ombre avant de dessiner le texte
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
             ctx.lineWidth = 1; // Réinitialiser la largeur de ligne

            // Afficher le niveau du bâtiment (avec une petite ombre de texte pour lisibilité)
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${10 + level}px Arial`;
             // Petite ombre portée pour le texte
             ctx.shadowColor = 'black';
             ctx.shadowBlur = 1;
             ctx.shadowOffsetX = 1;
             ctx.shadowOffsetY = 1;
            ctx.fillText(`Lv${level}`, x, y);
            // Réinitialiser l'ombre du texte
             ctx.shadowColor = 'transparent';
             ctx.shadowBlur = 0;
             ctx.shadowOffsetX = 0;
             ctx.shadowOffsetY = 0;

        });
        console.log(`${buildings.length} buildings drawn on canvas.`);
    },

}; // Fin de l'objet UI
