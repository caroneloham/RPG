// js/heroes.js
console.log("Heroes module loaded.");

const Heroes = {
    recruitedHeroes: [], // Liste des héros possédés
    nextHeroId: 1, // Pour assigner des ID uniques

    // Structure de base pour un héros
    createHero: function(name, role) {
        return {
            id: this.nextHeroId++,
            name: name,
            role: role, // Ex: 'Guerrier', 'Mage', 'Bâtisseur', 'Collecteur'
            level: 1,
            xp: 0,
            // TODO: Ajouter compétences, état (occupé, disponible), coût d'entretien...
        };
    },

    // Tente de recruter un nouveau héros (exemple simple)
    recruitNewHero: function(name, role) {
        const cost = { gold: 50, wood: 10 }; // Coût de recrutement exemple
        console.log(`Tentative de recrutement de ${name} (${role}) pour ${cost.gold} or et ${cost.wood} bois.`);

        if (Simulation.spendResources(cost)) {
            const newHero = this.createHero(name, role);
            this.recruitedHeroes.push(newHero);
            console.log(`${name} (${role}) a été recruté ! ID: ${newHero.id}`);
            // Mettre à jour l'affichage des héros via UI.js
            if (typeof UI !== 'undefined' && UI.updateHeroList) {
                UI.updateHeroList(this.recruitedHeroes);
            }
             if (typeof UI !== 'undefined' && UI.logEvent) {
                UI.logEvent(`Héros recruté : ${name} (${role}).`);
             }
            return newHero; // Retourne le héros recruté
        } else {
            console.log("Recrutement échoué : ressources insuffisantes.");
            // Message à l'utilisateur déjà géré par spendResources
            return null; // Échec
        }
    },

    // Récupère la liste des héros recrutés
    getHeroes: function() {
        return [...this.recruitedHeroes]; // Retourne une copie
    },

    // TODO: Fonctions pour gérer l'XP, le niveau, assigner des tâches...
    addXP: function(heroId, amount) {
        const hero = this.recruitedHeroes.find(h => h.id === heroId);
        if (hero) {
            hero.xp += amount;
            console.log(`${hero.name} gagne ${amount} XP.`);
            // TODO: Vérifier si le héros monte de niveau
            // Mettre à jour l'UI si nécessaire
            if (typeof UI !== 'undefined' && UI.updateHeroList) {
                 UI.updateHeroList(this.recruitedHeroes); // Rafraîchir la liste
            }
        } else {
            console.warn(`Héros avec ID ${heroId} non trouvé.`);
        }
    }
};