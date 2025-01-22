import { Game } from "../scenes/Game";
import { Weapon } from "./Weapon";

export class Player extends Phaser.GameObjects.Container{

    scene: Game;
    body: Phaser.Physics.Arcade.Body
    image: Phaser.GameObjects.Sprite;
    nameText: Phaser.GameObjects.Text;
    weapon: Weapon;
    healthBar: Phaser.GameObjects.Rectangle;

    speed: number = 600
    maxHealth: number = 100
    health: number
    knockback: number = 0
    knockbackDir: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0,0)
    damaged: boolean = false

    constructor(scene: Game, x: number, y: number){
        super(scene, x, y);
        
        this.scene = scene
        scene.add.existing(this)
        scene.physics.world.enable(this)
        this.setScale(scene.gameScale)

        this.body = this.body as Phaser.Physics.Arcade.Body
        this.body.setSize(10, 10).setOffset(-5, -2)

        this.image = scene.add.sprite(0,0,'char')

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

        let rad = Math.atan2(y-this.y, x-this.x)
        this.weapon.attack(rad)
    }

    update(){
        // TextBox Apeared
        if((this.scene as Game).UI.textBox.visible){
            this.body.setVelocity(0,0)
            this.image.play('idle', true)
            return;
        }
        
        const vel = new Phaser.Math.Vector2(0,0);

        if(this.scene.input.keyboard?.addKey('W')?.isDown){
            vel.y -= 1;
        }
        if(this.scene.input.keyboard?.addKey('S')?.isDown){
            vel.y += 1;
        }
        if(this.scene.input.keyboard?.addKey('A')?.isDown){
            this.image.setFlipX(true)
            vel.x -= 1;
        }
        if(this.scene.input.keyboard?.addKey('D')?.isDown){
            this.image.setFlipX(false)
            vel.x += 1;
        }

        vel.normalize();

        if(vel.x != 0 || vel.y != 0){
            if(vel.y >= 0) this.image.play('run-down', true)
            else this.image.play('run-up', true)
        }
        else this.image.play('idle', true)

        vel.scale(this.speed);
        this.setDepth(this.y/this.scene.gameScale)

        if(this.knockback > 0){
            this.body.setVelocity(this.knockbackDir.x, this.knockbackDir.y)
            this.body.velocity.normalize().scale(this.knockback*this.scene.gameScale)
            this.knockback = Math.floor(this.knockback/2)
        }
        else this.body.setVelocity(vel.x, vel.y)

        this.healthBar.setSize(20*this.health/this.maxHealth, 2)
        this.healthBar.setX(-10-10*this.health/-this.maxHealth)
    }
}