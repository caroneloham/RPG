// js/heroes.js
console.log("Heroes module loaded.");

const Heroes = {
    recruitedHeroes: [], // Liste des héros actuellement possédés par le joueur
    nextHeroId: 1,       // Compteur pour assigner des ID uniques aux nouveaux héros

    // Crée un objet représentant un nouveau héros avec des statistiques de base
    createHero: function(name, role) {
        // Validation simple des entrées (peut être étendue)
        if (!name || !role) {
            console.error("Impossible de créer un héros sans nom ou rôle.");
            return null;
        }
        return {
            id: this.nextHeroId++, // Assigne et incrémente l'ID unique
            name: name,
            role: role,         // Ex: 'Guerrier', 'Mage', 'Bâtisseur', 'Collecteur'
            level: 1,           // Niveau initial
            xp: 0,              // Expérience initiale
            requiredXP: 100,    // XP nécessaire pour le prochain niveau (pourrait être dynamique)
            status: 'idle',     // Statut actuel: 'idle', 'working', 'training', 'combat' (futur)
            assignedTask: null, // Tâche assignée (futur)
            // TODO: Ajouter compétences, équipement, coût d'entretien...
        };
    },

    // Fonction pour recruter un nouveau héros.
    // !! IMPORTANT: La vérification de la capacité et la dépense des ressources
    // !! doivent être effectuées AVANT d'appeler cette fonction (généralement dans UI.js).
    recruitNewHero: function(name, role) {
        console.log(`Attempting internal hero creation for: ${name} (${role})`);

        // Vérification de sécurité interne (au cas où appelé sans vérification externe)
        // mais la logique principale de blocage doit être dans l'UI/Simulation.
        if (typeof Simulation === 'undefined' || this.recruitedHeroes.length >= Simulation.stats.maxHeroCapacity) {
             console.warn("Recrutement annulé : capacité max atteinte ou Simulation non disponible (vérification interne).");
             // Pas besoin d'afficher un message ici, car l'UI devrait déjà l'avoir fait.
             return null; // Échec du recrutement
        }

        // Créer l'instance du héros
        const newHero = this.createHero(name, role);

        if (newHero) {
            this.recruitedHeroes.push(newHero);
            console.log(`SUCCESS: ${name} (${role}) [ID: ${newHero.id}] a rejoint vos rangs !`);

            // Déclencher la mise à jour de l'interface utilisateur
            if (typeof UI !== 'undefined') {
                 UI.updateHeroList(this.recruitedHeroes);           // Met à jour la liste <ul> affichée
                 UI.updateHeroCapacity(Simulation.stats.maxHeroCapacity); // Met à jour le compteur X/Y
                 UI.logEvent(`Nouveau héros recruté : ${name} (${role}, Nv. 1).`, 'success');
                 // On pourrait aussi rafraîchir la disponibilité des boutons ici, mais c'est déjà fait dans updateHeroList/Capacity
                 // UI.checkRecruitmentAvailability();
            }
            return newHero; // Retourne le héros qui vient d'être créé
        } else {
            console.error("Échec de la création de l'objet héros.");
             if (typeof UI !== 'undefined') {
                 UI.displayMessage(`Erreur lors de la création du héros ${name}.`, 'error');
             }
            return null; // Échec
        }
    },

    // Retourne une copie de la liste des héros recrutés
    getHeroes: function() {
        // Retourner une copie pour éviter les modifications externes accidentelles du tableau original
        return [...this.recruitedHeroes];
    },

    // Ajoute de l'expérience à un héros spécifique par son ID
    addXP: function(heroId, amount) {
        const hero = this.recruitedHeroes.find(h => h.id === heroId);

        if (hero) {
            hero.xp += amount;
            console.log(`${hero.name} (ID: ${heroId}) gagne ${amount} XP. Total: ${hero.xp}/${hero.requiredXP}`);

            // Vérifier si le héros monte de niveau
            while (hero.xp >= hero.requiredXP) {
                hero.level++;
                hero.xp -= hero.requiredXP; // Soustrait l'XP requis, garde l'excédent
                // Augmenter l'XP requis pour le prochain niveau (exemple simple : +50% par niveau)
                hero.requiredXP = Math.floor(hero.requiredXP * 1.5);
                console.log(`LEVEL UP! ${hero.name} atteint le niveau ${hero.level}! Prochain niveau à ${hero.requiredXP} XP.`);
                 if (typeof UI !== 'undefined') {
                     UI.logEvent(`${hero.name} est monté au niveau ${hero.level} !`, 'success');
                     // TODO: Ajouter potentiellement l'apprentissage de compétences, augmentation de stats...
                 }
            }

            // Mettre à jour l'interface utilisateur pour refléter les changements
            if (typeof UI !== 'undefined' && UI.activeMode === 'hero') {
                 UI.updateHeroList(this.recruitedHeroes); // Rafraîchit la liste si on est en mode héros
            }
        } else {
            console.warn(`Impossible d'ajouter de l'XP : Héros avec ID ${heroId} non trouvé.`);
        }
    },

    // Fonction pour trouver un héros par son ID (utile en interne ou pour d'autres modules)
    findHeroById: function(heroId) {
        return this.recruitedHeroes.find(h => h.id === heroId);
    }

    // TODO: Ajouter des fonctions pour :
    // - assignHeroTask(heroId, taskDetails)
    // - removeHero(heroId)
    // - manageHeroEquipment(heroId, ...)
    // - calculateHeroStats(hero) // Basé sur niveau, équipement, buffs...
};
