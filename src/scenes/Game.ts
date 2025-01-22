import { Player } from '../prefabs/Player';
import { MapSetup } from '../components/MapSetup';
import GameUI from './GameUI';
import { MapCustom } from '../components/MapCustom';

export class Game extends Phaser.Scene {

    camera: Phaser.Cameras.Scene2D.Camera;
    UI: GameUI;
    gameScale: number = 8
    key: string;
    from: string;
    player: Player;
    fog: Phaser.GameObjects.TileSprite;

    projectiles: Phaser.GameObjects.Group;
    enemys: Phaser.GameObjects.Group;

    constructor ()
    {
        super('Game');
    }

    init(data: { key: string, from: string }){
        this.key = data.key || 'lobby'
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
        bg.setScale(this.gameScale)
        wall.setScale(this.gameScale).setCollisionByExclusion([-1])

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

        this.enemys = this.physics.add.group({
            runChildUpdate: true
        })

        this.projectiles = this.physics.add.group({
            runChildUpdate: true
        })

        this.UI = (this.scene.get('GameUI') || this.scene.add('GameUI', new GameUI(), true)) as GameUI

        this.physics.add.overlap(enterances, this.player, enterance => {
            const name = (enterance as Phaser.GameObjects.GameObject).name
            this.scene.start('Game', { key: name, from: this.key })
        })

        this.physics.add.overlap(npcs, this.player.weapon.hitbox, _npc => {
            if(this.UI.textBox.visible) return

            const npc = _npc as Phaser.Physics.Arcade.Sprite

            this.camera.stopFollow()

            this.tweens.add({
                targets: this.camera,
                scrollX: (npc.x-this.camera.centerX)/2,
                scrollY: (npc.y-this.camera.centerY)/2,
                zoom: tinyScale*1.2,
                duration: 1000,
                ease: 'Power2'
            })

            this.UI.quest(npc.name, (key) => {
                if(key != 'none') this.scene.start('Game', { key: key, from: this.key })

                // this.tweens.add({
                //     targets: this.camera,
                //     scrollX: this.player.x-this.camera.centerX,
                //     scrollY: this.player.y-this.camera.centerY,
                //     zoom: 1,
                //     duration: 1000,
                //     ease: 'Power2',
                //     onComplete: () => {
                //         this.camera.startFollow(this.player, true, 0.1, 0.1)
                //     }
                // })
            })
        })

        this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer,) => {
            this.player.attack(_pointer.worldX, _pointer.worldY)
        })

        // Scale
        
        let tinyScale = this.scale.width > map.width*16*this.gameScale ? this.scale.width / (map.width*16*this.gameScale) : 1
        this.camera.setZoom(tinyScale)
        
        this.camera.startFollow(this.player, true, 0.1, 0.1)
        this.camera.setBounds(0, 0, map.widthInPixels*this.gameScale, map.heightInPixels*this.gameScale)
        this.physics.world.setBounds(0, 0, map.widthInPixels*this.gameScale, map.heightInPixels*this.gameScale)

        new MapCustom(this, this.key, map)
    }

    update(){
        this.player.update()

        this.fog.tilePositionX += 0.08
        this.fog.tilePositionY += 0.02
    }
}
