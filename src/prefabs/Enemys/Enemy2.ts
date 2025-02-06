import { Game } from "../../scenes/Game";
import { Bullet } from "../Bullet";
import planck from "planck-js"

export class Enemy2 extends Phaser.GameObjects.Container{

    scene: Game;
    pBody: planck.Body;
    image: Phaser.GameObjects.Sprite;
    nameText: Phaser.GameObjects.Text;
    healthBar: Phaser.GameObjects.Rectangle;

    dir: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    maxHealth: number = 100;
    health: number;
    damaged: boolean
    
    enemyState: number;
    stateTime: number[] = [5000, 4000, 7000]
    eventState: NodeJS.Timeout;

    constructor(scene: Game, x: number, y: number){
        super(scene, x, y);
        
        this.scene = scene
        scene.add.existing(this)
        this.setScale(scene.gameScale)

        this.pBody = scene.world.createDynamicBody({
            position: new planck.Vec2(x/scene.gameScale/16, y/scene.gameScale/16+0.2),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Box(0.4, 0.3),
            filterCategoryBits: 2,
            filterMaskBits: 1,
        })

        this.image = scene.add.sprite(0,0,'enemy3')

        this.nameText = this.scene.add.text(0,-13, 'Penimbun Bahan Bangunan lvl.1', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        const bar = scene.add.rectangle(0, -9, 20, 2, 0x777777)
        this.healthBar = scene.add.rectangle(0, -9, 20, 2, 0xff4455)

        this.health = this.maxHealth

        this.add([this.image, this.nameText, bar, this.healthBar])

        this.changeState()
    }

    changeState(){
        this.enemyState++
        
        if(this.enemyState == 1) setTimeout(() => this.changeState(), this.stateTime[0])
        else if(this.enemyState == 2){
            setTimeout(() => this.changeState(), this.stateTime[1])
            this.image.setTint(0xff0000)
        }
        else{ 
            this.enemyState = 0
            setTimeout(() => this.changeState(), this.stateTime[2])
            this.image.setTint(0xffffff)
        }
    }

    attack(x: number, y: number){
        if(this.enemyState == 1) return

        this.scene.sound.play('shot', { volume: 0.5 })

        let rotation = Phaser.Math.Angle.Between(this.x, this.y, x, y)
        let dirX = Math.cos(rotation)
        let dirY = Math.sin(rotation)

        const bullet = new Bullet(this.scene, this, dirX, dirY, 'bullet')
        bullet.knockback = 5

        this.scene.projectiles.push(bullet.pBody)
    }

    update(){
        if(this.dir.x > 0) this.image.flipX = false
        else if(this.dir.x < 0) this.image.flipX = true

        this.image.anims.play('enemy3-idle', true)

        this.setDepth(this.y/this.scene.gameScale-3)
        this.healthBar.setSize(20*this.health/this.maxHealth, 2)
        this.healthBar.setX(-10-10*this.health/-this.maxHealth)
        
        this.x = this.pBody.getPosition().x*this.scene.gameScale*16
        this.y = (this.pBody.getPosition().y-0.2)*this.scene.gameScale*16
    }

    destroy(): void {
        clearInterval(this.eventState)
        this.scene.contactEvent.destroyEventByBody(this.pBody)
        this.scene.world.queueUpdate(world => {
            console.log(world.destroyBody(this.pBody))
        })
        super.destroy()
    }
}