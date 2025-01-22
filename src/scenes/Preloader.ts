import { Scene } from 'phaser';

const npcs = ['raden-pramudana', 'mbah-surakso', 'ki-ageng-panjer']
const head = ['basic', 'blue', 'green', 'brown', 'women', 'women-purple', 'women-red']
const outfit = ['basic', 'blue', 'green', 'brown', 'women-purple', 'gold', 'dark', 'simply']

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(this.scale.width/2, 540, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(this.scale.width/2-230, 540, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload () {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        // HTML
        this.load.html('loginform', 'html/loginform.html')

        // Tilemap
        this.load.image('tileset', 'tilemaps.png');
        this.load.image('fog', 'fog.png');

        // Property
        this.load.image('tree1', 'property/tree1.png');
        this.load.image('tree2', 'property/tree2.png');
        this.load.image('home1', 'property/static-home.png');
        this.load.spritesheet('dynamic-home', 'property/home.png', { frameWidth: 48, frameHeight: 48 });

        
        this.load.spritesheet('char', 'character/full.png', { frameWidth: 16, frameHeight: 16 });

        // NPC
        for(let i=0; i<npcs.length; i++){
            this.load.spritesheet(npcs[i], 'character/npcs/'+npcs[i]+'.png', { frameWidth: 16, frameHeight: 16 });
        }
        this.load.spritesheet('menu', 'character/menu.png', { frameWidth: 16, frameHeight: 16 });

        this.load.spritesheet('grow-tree', 'property/grow-tree.png', { frameWidth: 32, frameHeight: 32 });

        // Player Outfit
        for(var i of head){
            this.load.spritesheet(i+'-head', 'character/head/'+i+'-head.png', { frameWidth: 16, frameHeight: 16 });
        }
        for(var i of outfit){
            this.load.spritesheet(i+'-outfit', 'character/outfit/'+i+'-outfit.png', { frameWidth: 16, frameHeight: 16 });
        }

        // Enemy and Enemy Item
        this.load.spritesheet('enemy', 'character/enemy/enemy.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy2', 'character/enemy/enemy2.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy3', 'character/enemy/enemy3.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('ketapel', 'character/enemy/ketapel.png');
        this.load.image('bullet', 'character/enemy/bullet.png');

        // Item
        ['ember', 'kayu', 'pohon', 'sekop', 'sword'].forEach(i => {
            this.load.image('item-'+i, 'items/'+i+'.png')
        })

        // Weapon 
        this.load.spritesheet('sword', 'sword.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('axe', 'axe.png', { frameWidth: 32, frameHeight: 32 });

        // Map Tile
        ['lobby', 'hamemayu', 'hutan', 'eling', 'kolam', 'rukun', 'rumah'].forEach(i => {
            this.load.tilemapTiledJSON(i, 'tilemap/map-'+i+'.json');
        })

        // JSON
        this.load.json('quest', 'quests.json')

        // Audio
        this.load.audio('step', 'audio/step.mp3')
        this.load.audio('swing', 'audio/swing.mp3')
        this.load.audio('hit', 'audio/hit.mp3')
        this.load.audio('shot', 'audio/shot.mp3')
       // this.load.audio('backsound', 'audio/backsound.mp3')
    }

    create () {
        // Player normal
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('char', {
                frames: [0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,2,1,2]
            }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'run-down',
            frames: this.anims.generateFrameNumbers('char', { start: 6, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run-up',
            frames: this.anims.generateFrameNumbers('char', { start: 12, end: 17 }),
            frameRate: 10,
            repeat: -1
        });

        // Player head
        for(let i of head){
            this.anims.create({
                key: 'idle-'+i+'-head',
                frames: this.anims.generateFrameNumbers(i+'-head', {
                    frames: [0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,2,1,2]
                }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'run-down-'+i+'-head',
                frames: this.anims.generateFrameNumbers(i+'-head', { 
                    frames: [0,0,3,0,0,3]
                }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'run-up-'+i+'-head',
                frames: this.anims.generateFrameNumbers(i+'-head', { 
                    frames: [4,4,5,4,4,5]
                }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Player outfit
        for(let i of outfit){
            this.anims.create({
                key: 'idle-'+i+'-outfit',
                frames: this.anims.generateFrameNumbers(i+'-outfit', {
                    frames: [0]
                }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'run-down-'+i+'-outfit',
                frames: this.anims.generateFrameNumbers(i+'-outfit', { start: 6, end: 11 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'run-up-'+i+'-outfit',
                frames: this.anims.generateFrameNumbers(i+'-outfit', { start: 12, end: 17 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // NPC
        for(let i=0; i<npcs.length; i++){
            let frames = [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,2,1]
            if(i == 0) frames = [0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,2,1,2]
            this.anims.create({
                key: npcs[i]+'-idle',
                frames: this.anims.generateFrameNumbers(npcs[i], {
                    frames: frames
                }),
                frameRate: 8,
                repeat: -1
            });
        }

        this.anims.create({
            key: 'menu-idle',
            frames: this.anims.generateFrameNumbers('menu', {
                frames: [0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,2,1,2]
            }),
            frameRate: 8,
            repeat: -1
        });

        // Enemy2
        this.anims.create({
            key: 'enemy-idle',
            frames: this.anims.generateFrameNumbers('enemy', {
                frames: [0,0,0,0,1]
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'enemy-run',
            frames: this.anims.generateFrameNumbers('enemy', {
                frames: [2,3,4,5,6,7]
            }),
            frameRate: 10,
            repeat: -1
        });

        // Enemy2
        this.anims.create({
            key: 'enemy2-idle',
            frames: this.anims.generateFrameNumbers('enemy2', {
                frames: [0,0,0,0,1]
            }),
            frameRate: 10,
            repeat: -1
        });

        // Enemy3
        this.anims.create({
            key: 'enemy3-idle',
            frames: this.anims.generateFrameNumbers('enemy3', {
                frames: [0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,2,1,2]
            }),
            frameRate: 8,
            repeat: -1
        });

        // Attack
        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('sword', {
                frames: [0,0,1,2,3,4,5,5,5,5,5,5]
            }),
            frameRate: 30,
        });
        this.anims.create({
            key: 'attack-axe',
            frames: this.anims.generateFrameNumbers('axe', {
                frames: [0,0,1,2,3,4,5,5,5,5,5,5]
            }),
            frameRate: 30,
        });

        const mainMenu =  document.getElementById('main-menu')
        if(mainMenu) mainMenu.style.display = 'block'
        
        this.scene.start('MainMenu');
    }
}
