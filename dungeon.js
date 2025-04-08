/**
 * dungeon.js
 * Module responsable de la génération procédurale des étages du donjon.
 */

// Utilisation d'une IIFE (Immediately Invoked Function Expression) pour encapsuler le module
// et éviter de polluer l'espace global.
const DungeonGenerator = (() => {

    // --- Constantes pour les types de tuiles ---
    const TILE = {
        WALL: '#',      // Mur infranchissable
        FLOOR: '.',     // Sol praticable
        DOOR: '+',      // Porte (potentiellement franchissable ou verrouillée)
        STAIRS_UP: '<', // Escalier montant (point d'entrée de l'étage)
        STAIRS_DOWN: '>', // Escalier descendant (point de sortie de l'étage)
        EMPTY: ' '      // Espace vide en dehors du donjon généré
        // Note : Le joueur ('@'), les ennemis ('E'), les objets ('I') seront placés
        // par d'autres logiques/modules par-dessus la grille générée.
    };

    /**
     * Classe pour représenter une salle rectangulaire dans le donjon.
     */
    class Room {
        /**
         * Constructeur d'une salle.
         * @param {number} x - Coordonnée X du coin supérieur gauche.
         * @param {number} y - Coordonnée Y du coin supérieur gauche.
         * @param {number} width - Largeur de la salle.
         * @param {number} height - Hauteur de la salle.
         */
        constructor(x, y, width, height) {
            this.x1 = x;
            this.y1 = y;
            this.x2 = x + width - 1; // Coordonnée X du coin inférieur droit (inclusif)
            this.y2 = y + height - 1; // Coordonnée Y du coin inférieur droit (inclusif)
            this.width = width;
            this.height = height;
            // Calcul du centre de la salle (utile pour connecter les couloirs)
            this.center = {
                x: Math.floor((this.x1 + this.x2) / 2),
                y: Math.floor((this.y1 + this.y2) / 2)
            };
        }

        /**
         * Vérifie si cette salle intersecte une autre salle.
         * Ajoute une marge d'une tuile pour éviter que les murs ne se touchent directement.
         * @param {Room} otherRoom - L'autre salle à vérifier.
         * @returns {boolean} - True si les salles s'intersectent (ou sont adjacentes), false sinon.
         */
        intersects(otherRoom) {
            return (
                this.x1 <= otherRoom.x2 + 1 &&
                this.x2 >= otherRoom.x1 - 1 &&
                this.y1 <= otherRoom.y2 + 1 &&
                this.y2 >= otherRoom.y1 - 1
            );
        }
    }

    // --- Fonctions Auxiliaires ---

    /**
     * Initialise une grille 2D avec une tuile par défaut.
     * @param {number} width - Largeur de la grille.
     * @param {number} height - Hauteur de la grille.
     * @param {string} fillTile - La tuile à utiliser pour remplir la grille (par défaut TILE.WALL).
     * @returns {Array<Array<string>>} - La grille 2D initialisée.
     */
    function initializeGrid(width, height, fillTile = TILE.WALL) {
        const grid = [];
        for (let y = 0; y < height; y++) {
            grid[y] = [];
            for (let x = 0; x < width; x++) {
                grid[y][x] = fillTile;
            }
        }
        return grid;
    }

    /**
     * "Creuse" une salle rectangulaire dans la grille en remplaçant les murs par du sol.
     * @param {Array<Array<string>>} grid - La grille du donjon.
     * @param {Room} room - L'objet Room à creuser.
     */
    function createRoomOnGrid(grid, room) {
        for (let y = room.y1; y <= room.y2; y++) {
            for (let x = room.x1; x <= room.x2; x++) {
                // Vérifie les limites de la grille (sécurité)
                if (grid[y] && grid[y][x]) {
                    grid[y][x] = TILE.FLOOR;
                }
            }
        }
    }

    /**
     * Creuse un tunnel horizontal entre deux points sur la grille.
     * @param {Array<Array<string>>} grid - La grille du donjon.
     * @param {number} x1 - Coordonnée X de départ.
     * @param {number} x2 - Coordonnée X de fin.
     * @param {number} y - Coordonnée Y du tunnel.
     */
    function createHorizontalTunnel(grid, x1, x2, y) {
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        for (let x = startX; x <= endX; x++) {
            if (grid[y] && grid[y][x]) {
                grid[y][x] = TILE.FLOOR;
            }
        }
    }

    /**
     * Creuse un tunnel vertical entre deux points sur la grille.
     * @param {Array<Array<string>>} grid - La grille du donjon.
     * @param {number} y1 - Coordonnée Y de départ.
     * @param {number} y2 - Coordonnée Y de fin.
     * @param {number} x - Coordonnée X du tunnel.
     */
    function createVerticalTunnel(grid, y1, y2, x) {
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        for (let y = startY; y <= endY; y++) {
            if (grid[y] && grid[y][x]) {
                grid[y][x] = TILE.FLOOR;
            }
        }
    }

    /**
     * Génère aléatoirement un entier dans une plage donnée (inclusif).
     * @param {number} min - La valeur minimale.
     * @param {number} max - La valeur maximale.
     * @returns {number} - Un entier aléatoire.
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // --- Fonction Principale de Génération ---

    /**
     * Génère un étage complet du donjon.
     * @param {number} width - Largeur souhaitée de la grille du donjon.
     * @param {number} height - Hauteur souhaitée de la grille du donjon.
     * @param {number} floorNumber - Le numéro de l'étage actuel (peut influencer la difficulté, etc.).
     * @param {object} [config={}] - Options de configuration pour la génération.
     * @param {number} [config.maxRooms=15] - Nombre maximum de tentatives de placement de salles.
     * @param {number} [config.minRoomSize=4] - Taille minimale (largeur/hauteur) d'une salle.
     * @param {number} [config.maxRoomSize=8] - Taille maximale (largeur/hauteur) d'une salle.
     * @returns {object|null} - Un objet contenant la grille générée, la liste des salles,
     *                          la position de départ du joueur et la position de l'escalier descendant,
     *                          ou null si la génération échoue (rare avec cette méthode simple).
     */
    function generate(width, height, floorNumber, config = {}) {
        // Récupération des paramètres de configuration avec des valeurs par défaut
        const maxRooms = config.maxRooms || 15;
        const minRoomSize = config.minRoomSize || 4;
        const maxRoomSize = config.maxRoomSize || 8;

        // 1. Initialiser la grille avec des murs
        const grid = initializeGrid(width, height, TILE.WALL);
        const rooms = [];
        let startPos = null; // Position de départ du joueur {x, y}
        let stairsDownPos = null; // Position de l'escalier descendant {x, y}

        // 2. Générer et placer les salles
        for (let i = 0; i < maxRooms; i++) {
            // Générer aléatoirement la taille et la position de la salle
            const roomWidth = getRandomInt(minRoomSize, maxRoomSize);
            const roomHeight = getRandomInt(minRoomSize, maxRoomSize);
            // Assurer que la salle reste dans les limites de la grille
            const x = getRandomInt(1, width - roomWidth - 1); // +1 pour laisser un mur sur les bords
            const y = getRandomInt(1, height - roomHeight - 1);

            const newRoom = new Room(x, y, roomWidth, roomHeight);

            // Vérifier si la nouvelle salle n'intersecte aucune salle existante
            let intersects = false;
            for (const existingRoom of rooms) {
                if (newRoom.intersects(existingRoom)) {
                    intersects = true;
                    break;
                }
            }

            // Si elle n'intersecte pas, l'ajouter et la "creuser"
            if (!intersects) {
                createRoomOnGrid(grid, newRoom);
                rooms.push(newRoom);
            }
        }

        // Vérifier si au moins une salle a été créée (nécessaire pour continuer)
        if (rooms.length === 0) {
            console.error("Échec de la génération : Aucune salle n'a pu être placée.");
            // On pourrait relancer la génération ici ou retourner null
            return null; // ou tenter de régénérer ? Pour l'instant, on signale l'erreur.
        }

        // 3. Connecter les salles avec des couloirs
        // On connecte chaque salle à la précédente dans la liste 'rooms'
        for (let i = 1; i < rooms.length; i++) {
            const prevCenter = rooms[i - 1].center;
            const currentCenter = rooms[i].center;

            // Creuser les couloirs (méthode simple : horizontal puis vertical)
            // Choix aléatoire de l'ordre pour varier les formes de couloirs
            if (Math.random() < 0.5) {
                // D'abord horizontal, puis vertical
                createHorizontalTunnel(grid, prevCenter.x, currentCenter.x, prevCenter.y);
                createVerticalTunnel(grid, prevCenter.y, currentCenter.y, currentCenter.x);
            } else {
                // D'abord vertical, puis horizontal
                createVerticalTunnel(grid, prevCenter.y, currentCenter.y, prevCenter.x);
                createHorizontalTunnel(grid, prevCenter.x, currentCenter.x, currentCenter.y);
            }
        }

        // 4. Placer les escaliers
        // Escalier montant (entrée) au centre de la première salle créée
        startPos = { ...rooms[0].center }; // Copie du centre
        grid[startPos.y][startPos.x] = TILE.STAIRS_UP;

        // Escalier descendant (sortie) au centre de la dernière salle créée
        stairsDownPos = { ...rooms[rooms.length - 1].center }; // Copie du centre
        // Assurer qu'on ne place pas l'escalier descendant sur l'escalier montant si une seule salle existe
        if (startPos.x === stairsDownPos.x && startPos.y === stairsDownPos.y && rooms.length > 1) {
             // Si par hasard c'est la même position et qu'il y a plus d'une salle,
             // on cherche une autre position libre dans la dernière salle
             let placed = false;
             for(let y = rooms[rooms.length - 1].y1; y <= rooms[rooms.length - 1].y2 && !placed; y++) {
                 for(let x = rooms[rooms.length - 1].x1; x <= rooms[rooms.length - 1].x2 && !placed; x++) {
                     if (grid[y][x] === TILE.FLOOR) {
                         stairsDownPos = {x, y};
                         placed = true;
                     }
                 }
             }
             // Si on n'a toujours pas trouvé (salle très petite?), on le met au centre quand même
             if(!placed) stairsDownPos = { ...rooms[rooms.length - 1].center };
        }
         grid[stairsDownPos.y][stairsDownPos.x] = TILE.STAIRS_DOWN;


        // 5. Validation (optionnelle pour cette méthode, car la connexion est garantie par l'algo)
        // La connectivité est assurée car on connecte les salles séquentiellement.

        // 6. Retourner les données du donjon généré
        return {
            grid: grid,                 // La grille 2D représentant l'étage
            rooms: rooms,               // La liste des objets Room générés
            playerStartPos: startPos,   // Coordonnées {x, y} de départ du joueur (sur STAIRS_UP)
            stairsDownPos: stairsDownPos // Coordonnées {x, y} de l'escalier descendant
        };
    }

    // --- Interface Publique du Module ---
    // Exposer les éléments nécessaires à l'extérieur de l'IIFE.
    return {
        generate: generate, // La fonction principale de génération
        TILE_TYPES: TILE    // Les constantes des types de tuiles (utile pour d'autres modules)
    };

})(); // Fin de l'IIFE et exécution

// Exemple d'utilisation (pourrait être dans un fichier main.js ou pour des tests)
/*
const dungeonData = DungeonGenerator.generate(80, 40, 1); // Génère étage 1 de 80x40
if (dungeonData) {
    console.log("Donjon généré !");
    console.log("Position de départ:", dungeonData.playerStartPos);
    console.log("Position escalier bas:", dungeonData.stairsDownPos);
    // Pour afficher la grille dans la console (simple affichage texte)
    // dungeonData.grid.forEach(row => console.log(row.join('')));
} else {
    console.log("La génération du donjon a échoué.");
}
*/