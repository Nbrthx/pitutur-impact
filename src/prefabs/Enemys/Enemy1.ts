import { Game } from "../../scenes/Game";
import { Player } from "../Player";
import { Weapon } from "../Weapon";

export class Enemy1 extends Phaser.GameObjects.Container{

    scene: Game;
    body: Phaser.Physics.Arcade.Body
    image: Phaser.GameObjects.Sprite;
    nameText: Phaser.GameObjects.Text;
    weapon: Weapon;
    attackArea: Phaser.Physics.Arcade.Body
    healthBar: Phaser.GameObjects.Rectangle;

    dir: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    maxHealth: number = 150;
    health: number;
    speed: number[] = [300, 400];
    reflectTime: number[] = [200, 400];
    cooldownTime: number[] = [1000, 1500];
    damaged: boolean
    targetPlayer: Player

    enemyState: number;
    stateTime: number[] = [4000, 4000, 7000]
    eventState: NodeJS.Timeout;

    constructor(scene: Game, x: number, y: number, difficulty: string){
        super(scene, x, y);
        
        this.scene = scene
        scene.add.existing(this)
        scene.physics.world.enable(this)
        this.setScale(scene.gameScale)

        this.body = this.body as Phaser.Physics.Arcade.Body
        this.body.setSize(10, 10).setOffset(-5, -2)

        this.image = scene.add.sprite(0,0,'enemy')

        this.nameText = this.scene.add.text(0,-13, 'Penebang Pohon Liar lvl.1', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        this.weapon = new Weapon(scene, 'axe')
        this.weapon.hitbox.setCircle(10, -2, -2)
        ;(this.weapon.hitbox.gameObject as Phaser.GameObjects.Zone).setPosition(10, 0)

        const zone = scene.add.zone(0, 0, 32, 32)
        scene.physics.world.enable(zone);

        this.attackArea = zone.body as Phaser.Physics.Arcade.Body
        this.attackArea.setCircle(24, -8, -8)

        const bar = scene.add.rectangle(0, -9, 20, 2, 0x777777)
        this.healthBar = scene.add.rectangle(0, -9, 20, 2, 0xff4455)

        if(difficulty == 'normal'){
            this.maxHealth = 200
            this.speed = [350, 450]
            this.reflectTime = [100, 300]
            this.cooldownTime = [800, 1200]
            this.stateTime = [3000, 5000, 7000]
            this.nameText.setText('Penebang Pohon Liar lvl.2')
        }
        else if(difficulty == 'hard'){
            this.maxHealth = 250
            this.speed = [400, 500]
            this.reflectTime = [100, 200]
            this.cooldownTime = [600, 1000]
            this.stateTime = [Math.floor(Math.random()*3000)+2000, 6000, Math.floor(Math.random()*3000)+5000]
            this.eventState = setInterval(() => {
                this.stateTime = [Math.floor(Math.random()*3000)+3000, 6000, Math.floor(Math.random()*3000)+5000]
            }, this.stateTime[0]+this.stateTime[1]+this.stateTime[2])
            this.nameText.setText('Penebang Pohon Liar lvl.3')
        }

        this.health = this.maxHealth

        this.add([this.image, this.weapon, this.nameText, bar, this.healthBar, zone])

        this.changeState()
    }

    track(player: Player){        
        const dir = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)

        if(Phaser.Math.Distance.BetweenPoints(this, player) > 80){
            this.dir.x = Math.cos(dir)
            this.dir.y = Math.sin(dir)
        }
        else{
            this.dir.x = 0
            this.dir.y = 0
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

        let rad = Math.atan2(y-this.y, x-this.x)
        this.weapon.attack(rad)
    }

    update(){
        if(this.targetPlayer) this.track(this.targetPlayer)

        this.dir.normalize()

        if(this.enemyState == 1){
            this.dir.scale(this.speed[0]);
        }
        else if(this.enemyState == 2){
            this.dir.scale(this.speed[1]);
        }
        else{
            this.dir.scale(0);
        }

        if(this.dir.x != 0 || this.dir.y != 0){
            this.image.play('enemy-run', true)
            if(this.dir.x < 0) this.image.setFlipX(true)
            else this.image.setFlipX(false)
        }
        else this.image.play('enemy-idle', true)

        this.setDepth(this.y/this.scene.gameScale)

        this.body.setVelocity(this.dir.x, this.dir.y)

        this.healthBar.setSize(20*this.health/this.maxHealth, 2)
        this.healthBar.setX(-10-10*this.health/-this.maxHealth)
    }

    destroy(): void {
        clearInterval(this.eventState)
        super.destroy()
    }
}