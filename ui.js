// js/heroes.js
console.log("Heroes module loaded.");

const Heroes = {
    recruitedHeroes: [],
    nextHeroId: 1,

    createHero: function(name, role) {
        return { id: this.nextHeroId++, name: name, role: role, level: 1, xp: 0 };
    },

    // Modifié pour ne plus vérifier/dépenser les ressources ici (c'est fait dans UI/Simulation)
    // et pour vérifier la capacité AVANT de créer le héros (bien que la vérification principale soit dans UI)
    recruitNewHero: function(name, role) {
        // La vérification de capacité et de ressources doit être faite AVANT d'appeler cette fonction
        // (par exemple dans l'event listener du bouton dans UI.js)

        // Vérification de sécurité (au cas où appelé directement)
        if (this.recruitedHeroes.length >= Simulation.stats.maxHeroCapacity) {
             console.warn("Tentative de recrutement alors que la capacité est atteinte (vérification interne).");
             if (typeof UI !== 'undefined') UI.displayMessage("Capacité de héros maximale atteinte.", "warning");
             return null;
        }
         // La dépense des ressources est aussi gérée en amont (ex: dans le listener UI)


        const newHero = this.createHero(name, role);
        this.recruitedHeroes.push(newHero);
        console.log(`${name} (${role}) a été recruté ! ID: ${newHero.id}`);

        // Mettre à jour l'UI
        if (typeof UI !== 'undefined') {
             UI.updateHeroList(this.recruitedHeroes); // Met à jour la liste affichée
             UI.updateHeroCapacity(Simulation.stats.maxHeroCapacity); // Met à jour l'affichage capacité
             UI.logEvent(`Héros recruté : ${name} (${role}).`);
        }
        return newHero;
    },

    getHeroes: function() {
        return [...this.recruitedHeroes];
    },

    addXP: function(heroId, amount) {
        const hero = this.recruitedHeroes.find(h => h.id === heroId);
        if (hero) {
            hero.xp += amount;
            console.log(`${hero.name} gagne ${amount} XP.`);
            // TODO: Gérer la montée de niveau
            if (typeof UI !== 'undefined' && UI.updateHeroList) {
                 UI.updateHeroList(this.recruitedHeroes);
            }
        } else {
            console.warn(`Héros avec ID ${heroId} non trouvé pour ajout XP.`);
        }
    }
};