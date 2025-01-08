import { Player } from '../prefabs/Player';
import { MapSetup } from '../components/MapSetup';
import GameUI from './GameUI';

export class Game extends Phaser.Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    key: string;
    from: string;
    player: Player;
    fog: Phaser.GameObjects.TileSprite;

    constructor ()
    {
        super('Game');
    }

    init(data: { key: string, from: string }){
        this.key = data.key || 'eling'
        this.from = data.from || 'start'
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        const map = this.make.tilemap({ key: this.key });
        const tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;

        const bg = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer
        const wall = map.createLayer('wall', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer
        bg.setScale(7)
        wall.setScale(7).setCollisionByExclusion([-1])

        this.fog = this.add.tileSprite(0, 0, map.widthInPixels*4, map.heightInPixels*4, 'fog')
        this.fog.setAlpha(0.05).setDepth(100000).setScale(15).setScrollFactor(0.6)

        const collision = MapSetup.getObjects(this, map)

        const enterances = MapSetup.getEnterances(this, map)

        const enterPoint = MapSetup.getEnterPoint(this.from, map)

        const npcs = MapSetup.getNPCs(this, map)

        this.player = new Player(this, enterPoint.x, enterPoint.y)

        this.physics.add.collider(this.player, wall)
        this.physics.add.collider(this.player, collision)
        this.player.body.setCollideWorldBounds(true)

        const UI = this.scene.get('GameUI') as GameUI || this.scene.add('GameUI', new GameUI(), true) as GameUI

        console.log(UI)

        this.physics.add.overlap(this.player, enterances, (_player, enterance) => {
            const name = (enterance as Phaser.GameObjects.GameObject).name
            this.scene.start('Game', { key: name, from: this.key })
        })

        this.physics.add.overlap(this.player.weapon.hitbox, npcs, (_player, npc) => {
            if(UI.textBox.visible) return
            console.log(npc)
            const _npc = npc as Phaser.GameObjects.GameObject
            const npcObj = _npc as Phaser.Physics.Arcade.Sprite
            if(npcObj.name == 'raden-pramudana'){
                UI.quest(0)
                console.log(this.camera.scrollX, this.camera.scrollY)
                this.camera.stopFollow()
                this.tweens.add({
                    targets: this.camera,
                    scrollX: -this.player.x+npcObj.x,
                    scrollY: -this.player.y+npcObj.y,
                    zoom: 1.5,
                    duration: 1000,
                    ease: 'Power2'
                })
            }
        })

        this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer,) => {
            this.player.attack(_pointer.worldX, _pointer.worldY)
        })

        // Scale
        
        let tinyScale = 1
        if(this.scale.width > map.width*16*7) tinyScale = this.scale.width / (map.width*16*7)
        this.camera.setZoom(tinyScale)
        
        this.camera.startFollow(this.player, true, 0.1, 0.1)
        this.camera.setBounds(0, 0, map.widthInPixels*7, map.heightInPixels*7)
        this.physics.world.setBounds(0, 0, map.widthInPixels*7, map.heightInPixels*7)
    }

    update(){
        this.player.update()

        this.fog.tilePositionX += 0.08
        this.fog.tilePositionY += 0.02
    }
}
