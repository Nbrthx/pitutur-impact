import { Game } from "../scenes/Game";
import planck from "planck-js"
import { Player } from "./Player";

export class Entity extends Phaser.GameObjects.Container{

    scene: Game;
    id: string
    pBody: planck.Body;
    image: Phaser.GameObjects.Sprite;
    nameText: Phaser.GameObjects.Text;
    healthBar: Phaser.GameObjects.Rectangle;

    dir: planck.Vec2 = new planck.Vec2();
    maxHealth: number;
    health: number;
    damaged: boolean
    trackPlayer: Player;
    entityState: number;
    isWalk = false

    constructor(scene: Game, x: number, y: number, image: string){
        super(scene, x, y);
        
        this.scene = scene
        scene.add.existing(this)
        this.setScale(scene.gameScale)

        this.pBody = scene.world.createDynamicBody({
            position: new planck.Vec2(x/scene.gameScale/16, y/scene.gameScale/16),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Box(0.4, 0.3, new planck.Vec2(0, 0)),
            filterCategoryBits: 2,
            filterMaskBits: 1,
        })
        this.pBody.setUserData(this)

        this.image = scene.add.sprite(0,0, image)

        this.nameText = this.scene.add.text(0,-13, 'Entity', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        const bar = scene.add.rectangle(0, -9, 20, 2, 0x777777)
        this.healthBar = scene.add.rectangle(0, -9, 20, 2, 0xff4455)

        this.health = this.maxHealth || 0

        this.add([this.image, this.nameText, bar, this.healthBar])
    }

    attack(x: number, y: number){ x; y; }

    update(){
        if(this.trackPlayer){
            const dir = Phaser.Math.Angle.Between(this.x, this.y, this.trackPlayer.x, this.trackPlayer.y)

            this.dir.x = Math.cos(dir)
            this.dir.y = Math.sin(dir)
        }

        if(this.isWalk) this.dir.set(this.pBody.getLinearVelocity())

        this.dir.normalize()

        if(this.dir.x != 0 || this.dir.y != 0){
            if(this.scene.anims.get(this.image.texture.key+'-run')) this.image.play(this.image.texture.key+'-run', true)
            if(this.dir.x < 0) this.image.setFlipX(true)
            else this.image.setFlipX(false)
        }
        else this.image.play(this.image.texture.key+'-idle', true)

        this.setDepth(this.y/this.scene.gameScale-3)
        
        this.x = this.pBody.getPosition().x*this.scene.gameScale*16
        this.y = (this.pBody.getPosition().y-0.2)*this.scene.gameScale*16

        this.healthBar.setSize(20*this.health/this.maxHealth, 2)
        this.healthBar.setX(-10-10*this.health/-this.maxHealth)
    }

    destroy(): void {
        this.scene.contactEvent.destroyEventByBody(this.pBody)
        this.pBody.getWorld().queueUpdate(world => {
            world.destroyBody(this.pBody)
        })
        super.destroy()
    }
}