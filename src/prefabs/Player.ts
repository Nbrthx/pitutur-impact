import { Weapon } from "./Weapon";

export class Player extends Phaser.GameObjects.Container{

    body: Phaser.Physics.Arcade.Body
    image: Phaser.GameObjects.Sprite;
    weapon: Weapon;

    constructor(scene: Phaser.Scene, x: number, y: number){
        super(scene, x, y);
        
        scene.add.existing(this)
        scene.physics.world.enable(this)
        this.setScale(7)

        this.body = this.body as Phaser.Physics.Arcade.Body
        this.body.setSize(10, 10).setOffset(-5, -2)

        this.image = scene.add.sprite(0,0,'char')

        this.weapon = new Weapon(scene)

        this.add([this.image, this.weapon])
    }

    attack(x: number, y: number){
        let rad = Math.atan2(y-this.y, x-this.x)
        this.weapon.attack(rad)
    }

    update(){
        const speed = 600;
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

        vel.scale(speed);
        this.setDepth(this.y/7)

        this.body.setVelocity(vel.x, vel.y)
    }
}