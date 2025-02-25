import { Game } from "../scenes/Game";
import { Weapon } from "./Weapon";
import planck from 'planck-js'

export class Player extends Phaser.GameObjects.Container{

    scene: Game;
    pBody: planck.Body;
    image: Phaser.GameObjects.Sprite;
    nameText: Phaser.GameObjects.Text;
    weapon: Weapon;
    healthBar: Phaser.GameObjects.Rectangle;

    speed: number = 1.5
    maxHealth: number = 100
    health: number
    knockback: number = 0
    knockbackDir = new planck.Vec2(0, 0)
    damaged: boolean = false

    constructor(scene: Game, x: number, y: number){
        super(scene, x, y);
        
        this.scene = scene
        scene.add.existing(this)
        this.setScale(scene.gameScale)

        this.image = scene.add.sprite(0,0,'char')

        this.pBody = scene.world.createDynamicBody({
            position: new planck.Vec2(x/scene.gameScale/16, y/scene.gameScale/16),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Box(0.4, 0.3, new planck.Vec2(0, 0.2)),
            filterCategoryBits: 2,
            filterMaskBits: 1,
        })

        const bar = scene.add.rectangle(0, -9, 20, 2, 0x777777)
        this.healthBar = scene.add.rectangle(0, -9, 20, 2, 0x44ff55)

        this.health = this.maxHealth

        this.weapon = new Weapon(scene, this.pBody, 'sword')

        this.add([this.image, this.weapon, bar, this.healthBar])
    }

    attack(x: number, y: number){
        // if(this.knockback > 0) return

        let rad = Math.atan2(y, x)
        this.weapon.attack(rad)
    }

    update(){
        const vel = this.pBody.getLinearVelocity()

        if(vel.x != 0 || vel.y != 0){
            if(vel.y >= 0) this.image.play('run-down', true)
            else this.image.play('run-up', true)
        
            if(vel.x > 0) this.image.flipX = false
            else if(vel.x < 0) this.image.flipX = true
        }
        else this.image.play('idle', true)

        this.setDepth(this.y/this.scene.gameScale)

        this.x = this.pBody.getPosition().x*this.scene.gameScale*16
        this.y = this.pBody.getPosition().y*this.scene.gameScale*16

        this.healthBar.setSize(20*this.health/this.maxHealth, 2)
        this.healthBar.setX(-10-10*this.health/-this.maxHealth)
    }

    destroy(){
        this.scene.contactEvent.destroyEventByBody(this.pBody)
        this.pBody.getWorld().queueUpdate(world => {
            world.destroyBody(this.pBody)
            this.weapon.destroy()
        })
        super.destroy()
    }
}