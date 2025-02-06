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
            position: new planck.Vec2(x/scene.gameScale/16, y/scene.gameScale/16+0.2),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Box(0.4, 0.3),
            filterCategoryBits: 2,
            filterMaskBits: 1,
        })

        const bar = scene.add.rectangle(0, -9, 20, 2, 0x777777)
        this.healthBar = scene.add.rectangle(0, -9, 20, 2, 0x44ff55)

        this.health = this.maxHealth

        this.weapon = new Weapon(scene, 'sword')

        this.add([this.image, this.weapon, bar, this.healthBar])
    }

    attack(x: number, y: number){
        if(this.scene.UI.textBox.visible) return;
        if(this.scene.UI.inventory.getSelectedIndex() != 4) return
        if(this.scene.UI.pause) return
        if(this.knockback > 0) return

        let rad = Math.atan2(y-this.y, x-this.x)
        this.weapon.attack(rad)
    }

    update(){
        // TextBox Apeared
        if((this.scene as Game).UI.textBox.visible){
            this.pBody.setLinearVelocity(new planck.Vec2(0, 0))
            this.image.play('idle', true)
            return;
        }
        
        const vel = new planck.Vec2(0, 0)

        if(this.scene.input.keyboard?.addKey('W')?.isDown){
            vel.y = -1;
        }
        if(this.scene.input.keyboard?.addKey('S')?.isDown){
            vel.y = 1;
        }
        if(this.scene.input.keyboard?.addKey('A')?.isDown){
            this.image.setFlipX(true)
            vel.x = -1;
        }
        if(this.scene.input.keyboard?.addKey('D')?.isDown){
            this.image.setFlipX(false)
            vel.x = 1;
        }

        vel.normalize();

        if(vel.x != 0 || vel.y != 0){
            if(vel.y >= 0) this.image.play('run-down', true)
            else this.image.play('run-up', true)
        }
        else this.image.play('idle', true)

        vel.mul(this.speed);
        this.setDepth(this.y/this.scene.gameScale)

        if(this.knockback > 0){
            this.pBody.setLinearVelocity(this.knockbackDir)
            this.pBody.getLinearVelocity().normalize()
            this.pBody.getLinearVelocity().mul(this.knockback)
            this.knockback = Math.floor(this.knockback*150/4)/50
        }
        else this.pBody.setLinearVelocity(vel) //this.body.setVelocity(vel.x, vel.y)

        this.x = this.pBody.getPosition().x*this.scene.gameScale*16
        this.y = (this.pBody.getPosition().y-0.2)*this.scene.gameScale*16

        this.healthBar.setSize(20*this.health/this.maxHealth, 2)
        this.healthBar.setX(-10-10*this.health/-this.maxHealth)
    }
}