import { Player } from '../prefabs/Player';
import { MapSetup } from '../components/MapSetup';
import GameUI from './GameUI';
import { MapCustom } from '../components/MapCustom';
import planck from 'planck-js'
import { ContactEvents } from '../components/ContactEvents';
import { Bullet } from '../prefabs/Bullet';
import io from 'socket.io-client';
import { NetworkHandler } from '../components/NetworkHandler';
import { Entity } from '../prefabs/Entity';

const socket = io('https://3000-idx-pitutur-impact-1734107033891.cluster-qpa6grkipzc64wfjrbr3hsdma2.cloudworkstations.dev/', { transports: ['websocket'] })

export class Game extends Phaser.Scene {

    world: planck.World;
    gameScale: number = 8

    camera: Phaser.Cameras.Scene2D.Camera;
    UI: GameUI;
    key: string;
    from: string;
    complete: boolean
    player: Player;
    fog: Phaser.GameObjects.TileSprite;

    projectiles: planck.Body[];
    enemys: planck.Body[];
    debugGraphics: Phaser.GameObjects.Graphics;
    enterances: planck.Body[];
    npcs: planck.Body[];
    tinyScale: number;
    contactEvent: ContactEvents;
    attackDir = new planck.Vec2(0, 0)

    others: Player[]
    networkHandler: NetworkHandler;
    accumulator: number;
    previousTime: any;

    constructor ()
    {
        super('Game');
    }

    init(data: { key: string, from: string, complete: boolean }){
        this.key = data.key || 'lobby'
        this.from = data.from || 'start'
        this.complete = data.complete
    }

    create () {
        // Map Setup

        this.world = new planck.World()

        this.debugGraphics = this.add.graphics().setDepth(10000000)

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        const map = this.make.tilemap({ key: this.key });
        const tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;

        const bg = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer
        const wall = map.createLayer('wall', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer
        bg.setScale(this.gameScale)
        wall.setScale(this.gameScale).setCollisionByExclusion([-1])
        this.createBounds(map.widthInPixels, map.heightInPixels)

        this.fog = this.add.tileSprite(0, 0, map.widthInPixels*4, map.heightInPixels*4, 'fog')
        this.fog.setAlpha(0.05).setDepth(100000).setScale(15).setScrollFactor(0.6)

        MapSetup.getObjects(this, map)

        this.enterances = MapSetup.getEnterances(this, map)
        
        this.npcs = MapSetup.getNPCs(this, map)
        
        const enterPoint = MapSetup.getEnterPoint(this.from, map)

        this.player = new Player(this, enterPoint.x, enterPoint.y)

        this.enemys = []

        this.others = []

        this.projectiles = []

        this.UI = (this.scene.get('GameUI') || this.scene.add('GameUI', new GameUI(), true)) as GameUI

        this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
            if(this.UI.textBox.visible) return;
            if(this.UI.pause) return

            let x = _pointer.worldX-this.player.x
            let y = _pointer.worldY-this.player.y
            this.attackDir.set(x, y)
        })

        // Custom Popup

        if(this.complete && this.key == 'eling'){
            this.UI.quest('raden-pramudana', true)
        }
        else if(this.complete && this.key == 'hamemayu'){
            this.UI.quest('mbah-surakso', true)
        }

        // Scale
        
        this.tinyScale = this.scale.width > map.width*16*this.gameScale ? this.scale.width / (map.width*16*this.gameScale) : 1
        this.camera.setZoom(this.tinyScale)
        
        this.camera.startFollow(this.player, true, 0.1, 0.1)
        this.camera.setBounds(0, 0, map.widthInPixels*this.gameScale, map.heightInPixels*this.gameScale)

        
        // Physics Contact Event

        this.contactEvent = new ContactEvents(this.world)
        
        this.contactEvent.addEvent(this.enterances, this.player.pBody, (enterance) => {
            console.log('Entering!');

            const name = enterance.getUserData() as string
            this.scene.start('Game', { key: name, from: this.key })
        })

        this.contactEvent.addEvent(this.npcs, this.player.weapon.hitbox, (npc) => {
            console.log('Talk!');

            if(this.UI.textBox.visible) return
            
            const name = npc.getUserData() as string
            const pos = npc.getPosition().clone().mul(1*this.gameScale*16)
            
            this.camera.stopFollow()

            this.tweens.add({
                targets: this.camera,
                scrollX: (pos.x-this.camera.centerX)/2,
                scrollY: (pos.y-this.camera.centerY)/2,
                zoom: this.tinyScale*1.2,
                duration: 1000,
                ease: 'Power2'
            })

            this.UI.quest(name, false, (key) => {
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

        // Connection

        this.networkHandler = new NetworkHandler(this, socket, this.key, this.from)

        this.events.once('shutdown', () => {
            console.log('shutdown')
            this.networkHandler.socket.removeAllListeners()
        })

        // Custom Map

        new MapCustom(this, this.key, map)

        // world step timer

        this.accumulator = 0
        this.previousTime = performance.now()
    }

    update(currentTime: number){
        const frameTime = (currentTime - this.previousTime) / 1000; // in seconds
        this.previousTime = currentTime;
        this.accumulator += frameTime * 3;
        while (this.accumulator >= 1/20) {
            this.world.step(1/20);
            this.accumulator -= 1/20;

            this.player.update()
            
            this.others.forEach(v => {
                v && v.update()
            })

            this.enemys.forEach(v => {
                const enemy = v.getUserData() as Entity
                enemy && enemy.active && enemy.update()
            })

            this.projectiles.forEach(v => {
                const bullet = v.getUserData() as Bullet
                bullet && bullet.active && bullet.update()
            })

            this.handleInput()

            this.fog.tilePositionX += 0.08
            this.fog.tilePositionY += 0.02

            this.createDebugGraphics()
        }
    }

    handleInput(){
        const vel = new planck.Vec2()

        // TextBox Apeared
        if(this.UI.textBox.visible){
            this.player.pBody.setLinearVelocity(vel)
            return;
        }

        const input = {
            up: this.input.keyboard?.addKey('W')?.isDown,
            down: this.input.keyboard?.addKey('S')?.isDown,
            left: this.input.keyboard?.addKey('A')?.isDown,
            right: this.input.keyboard?.addKey('D')?.isDown
        }
    
        if(input.up){
            vel.y = -1;
        }
        if(input.down){
            vel.y = 1;
        }
        if(input.left){
            vel.x = -1;
        }
        if(input.right){
            vel.x = 1;
        }
        
        vel.normalize();

        this.networkHandler.emitInput({ dir: vel, item: this.UI.inventory.getSelectedIndex(), attackDir: this.attackDir })

        if(this.attackDir.length() > 0){
            if(this.UI.inventory.getSelectedIndex() == 4) this.player.attack(this.attackDir.x, this.attackDir.y)
            this.attackDir.set(0, 0)
        }

        vel.mul(this.player.speed);
        this.player.pBody.setLinearVelocity(vel)
    }
    
    createBounds(width: number, height: number){
        width /= 16
        height /= 16
        const walls = [
            { pos: new planck.Vec2(width/2, -0.5), size: new planck.Vec2(width, 1) },  // top
            { pos: new planck.Vec2(-0.5, height/2), size: new planck.Vec2(1, height) },   // left
            { pos: new planck.Vec2(width+0.5, height/2), size: new planck.Vec2(1, height) },  // right
            { pos: new planck.Vec2(width/2, height+0.5), size: new planck.Vec2(width, 1) },   // bottom
        ];

        walls.forEach(wall => {
            const body = this.world.createBody(wall.pos);
            body.createFixture(new planck.Box(wall.size.x / 2, wall.size.y / 2));
        });
    };

    // For debugging hitbox
    createDebugGraphics() {
        this.debugGraphics.clear()

        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            const position = body.getPosition();
            const angle = body.getAngle();

            let color: number = 0x999999
            switch(body.getType()){
                case planck.Body.KINEMATIC: color = 0xffff00; break;
                case planck.Body.DYNAMIC: color = 0x00ffff; break;
                case planck.Body.STATIC: color = 0x0000ff; 
            }
            color = body.isActive() ? color : 0x999999

            this.debugGraphics.lineStyle(2, color, 1);
            for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
                const shape = fixture.getShape();

                if (shape instanceof planck.Box) {
                    const vertices = shape.m_vertices

                    const transformedVertices = vertices.map(v => {
                        return v.clone().add(shape.m_centroid);
                    }).map(v => {
                        const rotatedX = v.x * Math.cos(angle) - v.y * Math.sin(angle);
                        const rotatedY = v.x * Math.sin(angle) + v.y * Math.cos(angle);
                        return new planck.Vec2(rotatedX, rotatedY).add(position).sub(shape.m_centroid);
                    });

                    this.debugGraphics.beginPath()
                    this.debugGraphics.moveTo(transformedVertices[0].x * this.gameScale * 16, transformedVertices[0].y * this.gameScale * 16);
                    for (let i = 1; i < transformedVertices.length; i++) {
                        this.debugGraphics.lineTo(transformedVertices[i].x * this.gameScale * 16, transformedVertices[i].y * this.gameScale * 16);
                    }
                    this.debugGraphics.closePath();
                    this.debugGraphics.strokePath();
                }
                if(shape instanceof planck.Circle){
                    const center = shape.m_p.clone().add(position);
                    this.debugGraphics.strokeCircle(center.x * this.gameScale * 16, center.y * this.gameScale * 16, shape.m_radius * this.gameScale * 16)
                }
            }
        }
    }
}
