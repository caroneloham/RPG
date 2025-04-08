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
        gameCanvas: null,        // Référence à l'élément <canvas>
        canvasContext: null,     // Référence au contexte 2D (obtenu depuis gameCanvas)
        eventLogList: null,
        heroListDisplay: null,   // Initialisé seulement en mode héros
        heroCapacityDisplay: null,// Initialisé seulement en mode héros
    },
    activeMode: null, // Pour savoir quel mode est actif ('build', 'hero', 'event')

    init: function() {
        console.log("Initializing UI...");
        // Récupération des éléments principaux par ID
        this.elements.resourceWood = document.getElementById('resource-wood');
        this.elements.resourceStone = document.getElementById('resource-stone');
        this.elements.resourceGold = document.getElementById('resource-gold');
        this.elements.resourceMana = document.getElementById('resource-mana');
        this.elements.buildModeButton = document.getElementById('btn-build-mode');
        this.elements.heroModeButton = document.getElementById('btn-hero-mode');
        this.elements.eventModeButton = document.getElementById('btn-event-mode');
        this.elements.modeContentArea = document.getElementById('mode-content-area');
        this.elements.gameCanvas = document.getElementById('game-canvas'); // Récupère l'élément canvas
        this.elements.eventLogList = document.getElementById('event-list');

        // Vérification critique de l'existence des éléments récupérés par ID
        let missingElement = false;
        for (const key in this.elements) {
            // --- CORRECTION ICI ---
            // Ignorer les clés qui ne correspondent pas à des éléments récupérés directement par getElementById dans cette phase d'init
            if (key === 'canvasContext' || key === 'heroListDisplay' || key === 'heroCapacityDisplay') {
                continue; // Passe à la clé suivante
            }
            // --- FIN CORRECTION ---

            // Vérifier si l'élément pour la clé actuelle est null (non trouvé)
            if (!this.elements[key]) {
                 // Générer un message d'erreur plus précis indiquant l'ID HTML attendu
                const expectedId = key.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`); // Convertit camelCase en kebab-case
                console.error(`Erreur UI Init: Élément DOM manquant - Vérifiez l'ID '${expectedId}' dans index.html`);
                missingElement = true;
            }
        }

        // Si un élément clé manque, arrêter l'initialisation de l'UI
        if (missingElement) {
             console.error("Arrêt de l'initialisation de l'UI car des éléments clés sont manquants.");
             document.body.innerHTML = "<h1>Erreur Critique</h1><p>Impossible d'initialiser l'interface du jeu. Un composant essentiel est manquant. Veuillez vérifier la console (F12).</p>";
             return; // Arrêter l'exécution de init
        }


        // Initialisation du Canvas (SEULEMENT si l'élément canvas a été trouvé)
        if (this.elements.gameCanvas && this.elements.gameCanvas.getContext) { // Vérifie aussi l'existence de gameCanvas
            // Obtenir le contexte 2D et le stocker
            this.elements.canvasContext = this.elements.gameCanvas.getContext('2d');
            console.log("Canvas context initialized successfully.");
            // Le premier dessin sera fait par App.js après l'init de Simulation
        } else {
             console.warn("L'élément Canvas (<canvas id='game-canvas'>) n'a pas été trouvé ou le contexte 2D n'est pas supporté.");
             // On peut décider de continuer sans canvas ou d'afficher une erreur plus bloquante
             if(this.elements.gameCanvas) this.elements.gameCanvas.style.display = 'none'; // Cacher la zone si le contexte n'est pas supporté
        }


        // Attacher les écouteurs d'événements aux boutons de mode principaux
        this.elements.buildModeButton.addEventListener('click', () => this.enterBuildMode());
        this.elements.heroModeButton.addEventListener('click', () => this.enterHeroMode());
        this.elements.eventModeButton.addEventListener('click', () => this.enterEventMode());

        // Afficher un message initial dans la zone de contenu
        this.elements.modeContentArea.innerHTML = '<p>Bienvenue, Seigneur/Seigneuresse ! Sélectionnez un mode ci-dessus pour commencer à gérer votre royaume.</p>';

        // Mettre à jour l'affichage initial des ressources
        if (typeof Simulation !== 'undefined' && Simulation.getResources) {
            this.updateResourceDisplay(Simulation.getResources());
        } else {
             console.warn("Simulation module not ready during UI init for initial resource display.");
             this.updateResourceDisplay({ wood: 0, stone: 0, gold: 0, mana: 0 });
        }

        console.log("UI Initialized (core elements checked).");
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
        // Utiliser la délégation d'événements est souvent plus performant et évite les problèmes de listeners dupliqués
        const buildingList = this.elements.modeContentArea.querySelector('#building-list');
        if (!buildingList) return;

        // Nettoyer les anciens listeners s'ils existent (moins propre que la délégation)
        // Ou simplement s'assurer qu'ils sont ajoutés une seule fois via la structure

        // Ajouter un listener unique sur le conteneur #building-list
        buildingList.addEventListener('click', (e) => {
            const target = e.target; // L'élément cliqué

            if (target.matches('.btn-build')) {
                const id = target.dataset.buildingId;
                console.log(`Delegated Click Build: ${id}`);
                Simulation.buildBuilding(id);
            } else if (target.matches('.btn-upgrade')) {
                const id = target.dataset.buildingId;
                console.log(`Delegated Click Upgrade: ${id}`);
                Simulation.upgradeBuilding(id);
            }
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
         // Utiliser la délégation d'événements sur .recruitment-options
         const recruitmentDiv = this.elements.modeContentArea.querySelector('.recruitment-options');
         if (!recruitmentDiv) return;

         recruitmentDiv.addEventListener('click', (e) => {
             const target = e.target;

             if (target.matches('#recruit-warrior-btn') && !target.disabled) {
                 console.log("Delegated Click Recruit Warrior");
                 if (Heroes.getHeroes().length < Simulation.stats.maxHeroCapacity && Simulation.getConstructedBuildingsData().some(b => b.typeId === 'caserne')) {
                    const cost = { gold: 50, wood: 10 };
                    if (Simulation.spendResources(cost)) {
                        Heroes.recruitNewHero("Guerrier Recrue", "Guerrier");
                    }
                } else {
                     this.displayMessage("Conditions de recrutement non remplies.", "warning");
                     this.checkRecruitmentAvailability(); // Re-check si l'état a changé entre temps
                }
             } else if (target.matches('#recruit-mage-btn') && !target.disabled) {
                 console.log("Delegated Click Recruit Mage");
                  if (Heroes.getHeroes().length < Simulation.stats.maxHeroCapacity && Simulation.getConstructedBuildingsData().some(b => b.typeId === 'tour_mage')) {
                    const cost = { gold: 70, mana: 20 };
                     if (Simulation.spendResources(cost)) {
                        Heroes.recruitNewHero("Mage Apprenti", "Mage");
                    }
                } else {
                     this.displayMessage("Conditions de recrutement non remplies.", "warning");
                     this.checkRecruitmentAvailability();
                }
             }
         });
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
        // Utilisation de la délégation ici aussi
         const eventModeArea = this.elements.modeContentArea; // Le conteneur des boutons

         eventModeArea.addEventListener('click', (e) => {
             const target = e.target;
             if (target.matches('#trigger-random-event-btn')) {
                 Events.triggerRandomEvent();
             } else if (target.matches('#trigger-blessing-btn')) {
                  Events.triggerSpecificEvent("Bénédiction Sylvestre");
             } else if (target.matches('#trigger-disaster-btn')) {
                  Events.triggerSpecificEvent("Tempête Inattendue");
             }
         });
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
    drawGame: function() {
        // Vérifier si le contexte est bien initialisé avant de dessiner
        if (!this.elements.canvasContext) {
             console.warn("Tentative de dessin (drawGame) mais le contexte canvas n'est pas disponible.");
            return; // Ne rien faire si pas de contexte
        }
        const ctx = this.elements.canvasContext;
        const canvas = this.elements.gameCanvas;

        // 1. Nettoyer
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Dessiner le fond MAP
        this.drawMapBackground(ctx, canvas.width, canvas.height);

        // 3. Dessiner la grille (optionnel)
        this.drawGrid(ctx, canvas.width, canvas.height, 50, 'rgba(0, 0, 0, 0.08)');

        // 4. Dessiner les bâtiments
        this.drawBuildings(ctx);

        // 5. Dessiner les héros (futur)
        // this.drawHeroes(ctx);
    },

    drawMapBackground: function(ctx, width, height) {
        // Plaines
        ctx.fillStyle = '#8FBC8F';
        ctx.fillRect(0, 0, width, height);
        // Eau
        ctx.fillStyle = '#6495ED';
        ctx.beginPath();
        ctx.moveTo(width * 0.7, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, height * 0.4);
        ctx.quadraticCurveTo(width * 0.85, height * 0.45, width * 0.65, height * 0.3);
        ctx.closePath();
        ctx.fill();
        // Forêt
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, width * 0.15, height);
         ctx.fillStyle = '#006400';
         for(let i=0; i<15; i++) {
             const treeX = Math.random() * (width * 0.14);
             const treeY = Math.random() * height;
             const treeRadius = Math.random() * 5 + 3;
             ctx.beginPath(); ctx.arc(treeX, treeY, treeRadius, 0, Math.PI * 2); ctx.fill();
         }
        // Collines/Montagnes
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.8); ctx.lineTo(width * 0.1, height * 0.75); ctx.lineTo(width * 0.25, height * 0.85); ctx.lineTo(width * 0.4, height * 0.7); ctx.lineTo(width * 0.6, height * 0.9); ctx.lineTo(width * 0.75, height * 0.75); ctx.lineTo(width * 0.9, height * 0.85); ctx.lineTo(width, height * 0.8); ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath(); ctx.fill();
         ctx.fillStyle = '#696969';
         const peaks = [ [0.2, 0.8], [0.5, 0.75], [0.8, 0.82] ];
         peaks.forEach(p => {
             const peakX = width * p[0]; const peakY = height * p[1]; const baseWidth = width * 0.08;
             ctx.beginPath(); ctx.moveTo(peakX - baseWidth/2, height * 0.9); ctx.lineTo(peakX, peakY); ctx.lineTo(peakX + baseWidth/2, height * 0.9); ctx.closePath(); ctx.fill();
         });
    },

    drawGrid: function(ctx, width, height, gridSize, gridColor = 'rgba(0, 0, 0, 0.1)') {
        ctx.beginPath();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        for (let x = gridSize; x < width; x += gridSize) {
            ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, height);
        }
        for (let y = gridSize; y < height; y += gridSize) {
            ctx.moveTo(0, y + 0.5); ctx.lineTo(width, y + 0.5);
        }
        ctx.stroke();
         ctx.lineWidth = 1;
    },

    drawBuildings: function(ctx) {
        const buildings = Simulation.getConstructedBuildingsData();
        const baseBuildingSize = 35;
        const sizeIncreasePerLevel = 2;

        buildings.forEach(building => {
            const level = building.level;
            const buildingSize = baseBuildingSize + (level - 1) * sizeIncreasePerLevel;
            const x = building.position.x; const y = building.position.y; const halfSize = buildingSize / 2;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'; ctx.shadowBlur = 5; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
            ctx.fillStyle = building.color || '#CCCCCC';
            ctx.fillRect(x - halfSize, y - halfSize, buildingSize, buildingSize);
            ctx.strokeStyle = '#333333'; ctx.lineWidth = (level > 3) ? 1.5 : 1;
            ctx.strokeRect(x - halfSize, y - halfSize, buildingSize, buildingSize);
            ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; ctx.lineWidth = 1;

            ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `bold ${10 + level}px Arial`;
             ctx.shadowColor = 'black'; ctx.shadowBlur = 1; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
            ctx.fillText(`Lv${level}`, x, y);
             ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        });
        // Retirer le log répétitif d'ici pour éviter de spammer la console
        // console.log(`${buildings.length} buildings drawn on canvas.`);
    },

}; // Fin de l'objet UI
