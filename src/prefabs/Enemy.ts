import { Game } from "../scenes/Game";
import { Bullet } from "./Bullet";
import { Player } from "./Player";

export class Enemy extends Phaser.GameObjects.Container{

    scene: Game;
    body: Phaser.Physics.Arcade.Body
    image: Phaser.GameObjects.Sprite;
    nameText: Phaser.GameObjects.Text;
    weapon: Phaser.GameObjects.Image;
    healthBar: Phaser.GameObjects.Rectangle;

    dir: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    maxHealth: number = 100;
    health: number;
    attackSpeed: number[] = [800, 1500];
    attackKnockback: number = 400;
    damaged: boolean

    enemyState: number;
    stateTime: number[] = [6000, 2000, 5000]
    eventState: number;

    constructor(scene: Game, x: number, y: number, difficulty: string){
        super(scene, x, y);
        
        this.scene = scene
        scene.add.existing(this)
        scene.physics.world.enable(this)
        this.setScale(7)

        this.body = this.body as Phaser.Physics.Arcade.Body
        this.body.setSize(10, 10).setOffset(-5, -2)

        this.image = scene.add.sprite(0,0,'char')

        this.nameText = this.scene.add.text(0,-13, 'Perusak Air Tanah lvl.1', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        this.weapon = this.scene.add.image(0, 0, 'ketapel')
        this.weapon.setOrigin(0.5, 0.5)

        const bar = scene.add.rectangle(0, -9, 20, 2, 0x777777)
        this.healthBar = scene.add.rectangle(0, -9, 20, 2, 0xff4455)

        if(difficulty == 'normal'){
            this.maxHealth = 150
            this.attackSpeed = [600, 1000]
            this.attackKnockback = 500
            this.stateTime = [5000, 3000, 4000]
            this.nameText.setText('Perusak Air Tanah lvl.2')
        }
        else if(difficulty == 'hard'){
            this.maxHealth = 200
            this.attackSpeed = [500, 800]
            this.attackKnockback = 600
            this.stateTime = [Math.floor(Math.random()*3000)+4000, 4000, Math.floor(Math.random()*3000)+3000]
            this.eventState = setInterval(() => {
                this.stateTime = [Math.floor(Math.random()*3000)+4000, 4000, Math.floor(Math.random()*3000)+3000]
            }, this.stateTime[0]+this.stateTime[1]+this.stateTime[2])
            this.nameText.setText('Perusak Air Tanah lvl.3')
        }

        this.health = this.maxHealth

        this.add([this.image, this.weapon, this.nameText, bar, this.healthBar])

        this.changeState()
    }

    shoter(player: Player){
        if(this.active){
            if(this.enemyState == 2){
                this.attack(player.x, player.y)
                setTimeout(() => this.shoter(player), this.attackSpeed[0])
            }
            else{
                const x = Math.random()*64+player.x-32
                const y = Math.random()*64+player.y-32
                this.attack(x, y)
                setTimeout(() => this.shoter(player), this.attackSpeed[1])
            }
        }
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

        this.weapon.rotation = Phaser.Math.Angle.Between(this.x, this.y, x, y)
        let dirX = Math.cos(this.weapon.rotation)
        let dirY = Math.sin(this.weapon.rotation)

        this.weapon.x = dirX*6
        this.weapon.y = dirY*6

        if(dirX < 0) this.weapon.flipY = true;
        else this.weapon.flipY = false;

        const bullet = new Bullet(this.scene, this, dirX, dirY, 'bullet')
        bullet.knockback = this.attackKnockback

        this.scene.projectiles.add(bullet)
    }

    update(){
        if(this.dir.x > 0) this.image.flipX = false
        else if(this.dir.x < 0) this.image.flipX = true

        this.image.anims.play('enemy2-idle', true)

        this.setDepth(this.y/7-3)
        this.healthBar.setSize(20*this.health/this.maxHealth, 2)
        this.healthBar.setX(-10-10*this.health/-this.maxHealth)
    }

    destroy(): void {
        clearInterval(this.eventState)
        super.destroy()
    }
}