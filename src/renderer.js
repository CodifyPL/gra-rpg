import './index.css';
import map from './map';

console.log('👋 This message is being logged by "renderer.js", included via Vite');

const TILE_SIZE = 32;
const VIEWPORT_WIDTH = 10; // Number of tiles visible horizontally
const VIEWPORT_HEIGHT = 10; // Number of tiles visible vertically
const GRID_WIDTH = map.ground[0].length; // Dynamically calculate width from the ground layer
const GRID_HEIGHT = map.ground.length;  // Dynamically calculate height from the ground layer

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.image('stone_slab', 'src/textures/floors/stone_slab.png');
        this.load.image('bush', 'src/textures/objects/bush.png');
        this.load.image('water', 'src/textures/floors/water.png');
        this.load.image('hero', 'src/textures/hero/hero.png');
        this.load.spritesheet('hero_sheet', 'src/textures/hero/hero_sheet.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('grass_path_corner_1', 'src/textures/floors/grass_path_corner_1.png');
        this.load.image('grass_path_corner_2', 'src/textures/floors/grass_path_corner_2.png');
        this.load.image('grass_path_corner_3', 'src/textures/floors/grass_path_corner_3.png');
        this.load.image('grass_path_corner_4', 'src/textures/floors/grass_path_corner_4.png');
        this.load.image('grass_path_horizontal', 'src/textures/floors/grass_path_horizontal.png');
        this.load.image('grass_path_vertical', 'src/textures/floors/grass_path_vertical.png');
        this.load.image('grass', 'src/textures/floors/grass.png');
    }

    create() {
        this.map = map;
        this.tiles = new Map(); // Store ground and object tiles
        this.characters = new Map(); // Store character sprites

        // Render ground layer
        this.renderLayer(this.map.ground, 'ground');

        // Render object layer
        this.renderLayer(this.map.objects, 'objects');

        // Render characters
        this.renderCharacters();

        // Set up the camera to follow the hero
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);

        // Keyboard input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown', this.startMove, this);
        this.input.keyboard.on('keyup', this.stopMove, this);

        // Get the inventory and statistics elements from the DOM
        this.inventoryElement = document.getElementById('inventory');
        this.statisticsElement = document.getElementById('statistics');

        if (!this.inventoryElement) {
            console.error('Inventory element not found in the DOM!');
        }
        if (!this.statisticsElement) {
            console.error('Statistics element not found in the DOM!');
        }

        // Add toggle logic for inventory and statistics
        this.input.keyboard.on('keydown-I', () => this.toggleExclusive(this.inventoryElement));
        this.input.keyboard.on('keydown-S', () => this.toggleExclusive(this.statisticsElement));

        // Dynamically create inventory slots
        if (this.inventoryElement) {
            for (let i = 0; i < 20; i++) { // Example: 20 slots
                const slot = document.createElement('div');
                slot.classList.add('inventory-item');
                slot.dataset.name = `Item ${i + 1}`;
                slot.dataset.stats = 'Stats: N/A';
                slot.dataset.description = 'Description: Placeholder item.';
                this.inventoryElement.appendChild(slot);
            }
        }

        // Add hover functionality for inventory items
        document.querySelectorAll('.inventory-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                const details = document.getElementById('item-details');
                if (details) {
                    details.style.display = 'block';
                    details.innerHTML = `
                        <h2>${item.dataset.name}</h2>
                        <p>${item.dataset.stats}</p>
                        <p>${item.dataset.description}</p>
                    `;
                }
            });

            item.addEventListener('mouseleave', () => {
                const details = document.getElementById('item-details');
                if (details) {
                    details.style.display = 'none';
                }
            });
        });

        // Ustaw domyślną klatkę dla bohatera
        this.player.setFrame(0); // Domyślnie patrzy w dół

        this.movementDirection = null; // Kierunek ruchu
        this.isMoving = false; // Flaga ruchu
        this.moveCooldown = 300; // Czas w milisekundach między ruchami
        this.lastMoveTime = 0; // Czas ostatniego ruchu
    }

    renderLayer(layer, type) {
        for (let y = 0; y < layer.length; y++) {
            for (let x = 0; x < layer[y].length; x++) {
                const tileType = layer[y][x];
                if (tileType !== 0) {
                    let tile;
                    if (type === 'ground' && tileType === 2) {
                        tile = this.add.image(
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2,
                            'stone_slab'
                        ).setOrigin(0.5);
                        tile.setDepth(0); // Ground tiles have depth 0
                    } else if (type === 'ground' && tileType === 3) { // Example for grass_path
                        tile = this.add.image(
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2,
                            'grass_path_horizontal' // Replace with appropriate variation
                        ).setOrigin(0.5);
                        tile.setDepth(0); // Ground tiles have depth 0
                    } else if (type === 'ground' && tileType === 4) {
                        tile = this.add.image(
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2,
                            'grass_path_vertical'
                        ).setOrigin(0.5);
                        tile.setDepth(0);
                    } else if (type === 'ground' && tileType === 5) {
                        tile = this.add.image(
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2,
                            'grass_path_corner_1'
                        ).setOrigin(0.5);
                        tile.setDepth(0);
                    } else if (type === 'ground' && tileType === 6) {
                        tile = this.add.image(
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2,
                            'grass_path_corner_2'
                        ).setOrigin(0.5);
                        tile.setDepth(0);
                    } else if (type === 'ground' && tileType === 7) {
                        tile = this.add.image(
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2,
                            'grass_path_corner_3'
                        ).setOrigin(0.5);
                        tile.setDepth(0);
                    } else if (type === 'ground' && tileType === 8) {
                        tile = this.add.image(
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2,
                            'grass_path_corner_4'
                        ).setOrigin(0.5);
                        tile.setDepth(0);
                    } else if (type === 'ground' && tileType === 9) { // New grass tile
                        tile = this.add.image(
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2,
                            'grass'
                        ).setOrigin(0.5);
                        tile.setDepth(0); // Ground tiles have depth 0
                    } else if (type === 'objects' && tileType === 1) {
                        tile = this.add.image(
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2,
                            'bush'
                        ).setOrigin(0.5);
                        tile.setDepth(1); // Objects have depth 1
                    }
                    this.tiles.set(`${x},${y}`, tile);
                }
            }
        }
    }

    renderCharacters() {
        for (let y = 0; y < this.map.characters.length; y++) {
            for (let x = 0; x < this.map.characters[y].length; x++) {
                const charType = this.map.characters[y][x];
                if (charType === 4) { // Hero
                    // Zmień z `this.add.image` na `this.add.sprite`
                    this.player = this.add.sprite(
                        x * TILE_SIZE + TILE_SIZE / 2,
                        y * TILE_SIZE + TILE_SIZE / 2,
                        'hero_sheet'
                    ).setOrigin(0.5);
                    this.player.gridX = x;
                    this.player.gridY = y;
                    this.player.setDepth(2); // Characters have depth 2
                    this.characters.set(`${x},${y}`, this.player);
                }
            }
        }
    }

    startMove(event) {
        if (event.code === 'ArrowUp') {
            this.movementDirection = 'up';
            this.player.setFrame(3); // Klatka dla ruchu na północ
        } else if (event.code === 'ArrowDown') {
            this.movementDirection = 'down';
            this.player.setFrame(0); // Klatka dla ruchu na południe
        } else if (event.code === 'ArrowLeft') {
            this.movementDirection = 'left';
            this.player.setFrame(1); // Klatka dla ruchu na zachód
        } else if (event.code === 'ArrowRight') {
            this.movementDirection = 'right';
            this.player.setFrame(2); // Klatka dla ruchu na wschód
        }
        this.isMoving = true;
    }

    stopMove(event) {
        if (
            (event.code === 'ArrowUp' && this.movementDirection === 'up') ||
            (event.code === 'ArrowDown' && this.movementDirection === 'down') ||
            (event.code === 'ArrowLeft' && this.movementDirection === 'left') ||
            (event.code === 'ArrowRight' && this.movementDirection === 'right')
        ) {
            this.isMoving = false;
            this.movementDirection = null;
        }
    }

    update(time) {
        if (this.isMoving && this.movementDirection) {
            if (time - this.lastMoveTime >= this.moveCooldown) {
                let newX = this.player.gridX;
                let newY = this.player.gridY;

                if (this.movementDirection === 'up') {
                    newY--;
                } else if (this.movementDirection === 'down') {
                    newY++;
                } else if (this.movementDirection === 'left') {
                    newX--;
                } else if (this.movementDirection === 'right') {
                    newX++;
                }

                if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT) {
                    const objectType = this.map.objects[newY][newX];
                    if (objectType === 0) { // Tylko jeśli docelowe pole jest puste
                        this.player.gridX = newX;
                        this.player.gridY = newY;

                        // Animacja przesunięcia
                        this.tweens.add({
                            targets: this.player,
                            x: this.player.gridX * TILE_SIZE + TILE_SIZE / 2,
                            y: this.player.gridY * TILE_SIZE + TILE_SIZE / 2,
                            duration: this.moveCooldown, // Czas trwania animacji
                            ease: 'Linear'
                        });

                        // Renderuj widoczne kafelki po ruchu
                        this.renderVisibleTiles();
                    } else {
                        this.isMoving = false; // Zatrzymaj ruch, jeśli napotkano przeszkodę
                    }
                } else {
                    this.isMoving = false; // Zatrzymaj ruch, jeśli wyjdziesz poza granice
                }

                this.lastMoveTime = time; // Zaktualizuj czas ostatniego ruchu
            }
        }
    }

    handleMove(event) {
        let moved = false;
        let newX = this.player.gridX;
        let newY = this.player.gridY;

        if (event.code === 'ArrowUp') {
            newY--;
            moved = true;
            this.player.setFrame(3); // Klatka dla ruchu na północ
        } else if (event.code === 'ArrowDown') {
            newY++;
            moved = true;
            this.player.setFrame(0); // Klatka dla ruchu na południe
        } else if (event.code === 'ArrowLeft') {
            newX--;
            moved = true;
            this.player.setFrame(1); // Klatka dla ruchu na zachód
        } else if (event.code === 'ArrowRight') {
            newX++;
            moved = true;
            this.player.setFrame(2); // Klatka dla ruchu na wschód
        }

        if (moved) {
            if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT) {
                // Check for collisions in the objects layer
                const objectType = this.map.objects[newY][newX];
                if (objectType === 0) { // Only move if the target tile is empty
                    this.player.gridX = newX;
                    this.player.gridY = newY;
                    this.player.x = this.player.gridX * TILE_SIZE + TILE_SIZE / 2;
                    this.player.y = this.player.gridY * TILE_SIZE + TILE_SIZE / 2;

                    // Render visible tiles after movement
                    this.renderVisibleTiles();
                }
            }
        }
    }

    renderVisibleTiles() {
        // Placeholder method to prevent errors
        // No functionality is implemented here
    }

    showGrid(element) {
        if (element) {
            element.style.display = 'grid'; // Apply grid display
            element.style.visibility = 'visible';
            element.style.opacity = '1';
        }
    }

    hideElement(element) {
        if (element) {
            element.style.display = 'none'; // Hide the element
            element.style.visibility = 'hidden';
            element.style.opacity = '0';
        }
    }

    toggleExclusive(element) {
        // If the selected element is already visible, hide it
        if (element && element.style.visibility === 'visible') {
            this.hideElement(element);
        } else {
            // Otherwise, hide all panels first
            this.hideElement(this.inventoryElement);
            this.hideElement(this.statisticsElement);

            // Show the selected element
            if (element === this.inventoryElement) {
                this.showGrid(element); // Use grid for inventory
            } else if (element) {
                element.style.display = 'block'; // Default to block for other elements
                element.style.visibility = 'visible';
                element.style.opacity = '1';
            }
        }
    }
}

window.onload = function () {
    const config = {
        type: Phaser.AUTO,
        width: VIEWPORT_WIDTH * TILE_SIZE,
        height: VIEWPORT_HEIGHT * TILE_SIZE,
        parent: 'game',
        pixelArt: true,
        backgroundColor: '#3498db',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: MainScene
    };
    new Phaser.Game(config);
};
