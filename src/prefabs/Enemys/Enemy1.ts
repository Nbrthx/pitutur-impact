import planck from "planck-js";
import { Game } from "../../scenes/Game";
import { Player } from "../Player";
import { Weapon } from "../Weapon";

export class Enemy1 extends Phaser.GameObjects.Container{

    scene: Game;
    pBody: planck.Body
    image: Phaser.GameObjects.Sprite;
    nameText: Phaser.GameObjects.Text;
    weapon: Weapon;
    attackArea: planck.Body
    healthBar: Phaser.GameObjects.Rectangle;

    dir = new planck.Vec2(0, 0);
    maxHealth: number = 150;
    health: number;
    speed: number[] = [0.75, 0.95];
    reflectTime: number[] = [400, 200];
    cooldownTime: number[] = [1500, 1000];
    attackKnockback: number = 8;
    damaged: boolean
    targetPlayer: Player

    enemyState: number;
    stateTime: number[] = [4000, 4000, 7000]
    eventState: NodeJS.Timeout;

    constructor(scene: Game, x: number, y: number, difficulty: string){
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

        this.image = scene.add.sprite(0,0,'enemy')

        this.nameText = this.scene.add.text(0,-13, 'Penebang Pohon Liar lvl.1', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        this.weapon = new Weapon(scene, 'axe')
        this.weapon.hitbox.destroyFixture(this.weapon.hitbox.getFixtureList() as planck.Fixture)
        this.weapon.hitbox.createFixture({
            shape: new planck.Circle(new planck.Vec2(0, 0), 10/16),
            isSensor: true
        })

        this.attackArea = scene.world.createKinematicBody();
        this.attackArea.createFixture({
            shape: new planck.Circle(new planck.Vec2(0, 0), 24/16),
            isSensor: true
        });

        const bar = scene.add.rectangle(0, -9, 20, 2, 0x777777)
        this.healthBar = scene.add.rectangle(0, -9, 20, 2, 0xff4455)

        if(difficulty == 'normal'){
            this.maxHealth = 200
            this.speed = [0.85, 1.05]
            this.reflectTime = [300, 100]
            this.cooldownTime = [1200, 800]
            this.attackKnockback = 9;
            this.stateTime = [3000, 5000, 7000]
            this.nameText.setText('Penebang Pohon Liar lvl.2')
        }
        else if(difficulty == 'hard'){
            this.maxHealth = 250
            this.speed = [1, 1.25]
            this.reflectTime = [200, 100]
            this.cooldownTime = [1000, 600]
            this.attackKnockback = 10;
            this.stateTime = [Math.floor(Math.random()*3000)+2000, 6000, Math.floor(Math.random()*3000)+5000]
            this.eventState = setInterval(() => {
                this.stateTime = [Math.floor(Math.random()*3000)+3000, 6000, Math.floor(Math.random()*3000)+5000]
            }, this.stateTime[0]+this.stateTime[1]+this.stateTime[2])
            this.nameText.setText('Penebang Pohon Liar lvl.3')
        }

        this.health = this.maxHealth

        this.add([this.image, this.weapon, this.nameText, bar, this.healthBar])

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
        if(this.enemyState == 0) return

        let rad = Math.atan2(y-this.y, x-this.x)
        this.weapon.attack(rad)
    }

    update(){
        if(this.targetPlayer){
            const dir = Phaser.Math.Angle.Between(this.x, this.y, this.targetPlayer.x, this.targetPlayer.y)

            this.dir.x = Math.cos(dir)
            this.dir.y = Math.sin(dir)
        }

        this.dir.normalize()

        if(this.enemyState == 1){
            this.dir.mul(this.speed[0]);
        }
        else if(this.enemyState == 2){
            this.dir.mul(this.speed[1]);
        }
        else{
            this.dir.mul(0);
        }

        if(this.pBody.getLinearVelocity().x != 0 || this.pBody.getLinearVelocity().y != 0){
            this.image.play('enemy-run', true)
            if(this.dir.x < 0) this.image.setFlipX(true)
            else this.image.setFlipX(false)
        }
        else this.image.play('enemy-idle', true)

        this.setDepth(this.y/this.scene.gameScale)

        if(Phaser.Math.Distance.BetweenPoints(this, this.targetPlayer) > 180){
            this.pBody.setLinearVelocity(this.dir)
            this.attackArea.setPosition(this.pBody.getPosition())
        }
        else{
            const dir = this.dir.clone()
            const x = dir.x
            dir.x = dir.y
            dir.y = -x
            dir.normalize()
            this.pBody.setLinearVelocity(dir)
        }

        this.x = this.pBody.getPosition().x*this.scene.gameScale*16
        this.y = (this.pBody.getPosition().y-0.2)*this.scene.gameScale*16

        this.healthBar.setSize(20*this.health/this.maxHealth, 2)
        this.healthBar.setX(-10-10*this.health/-this.maxHealth)
    }

    destroy(): void {
        clearInterval(this.eventState)
        this.scene.contactEvent.destroyEventByBody(this.attackArea)
        this.scene.contactEvent.destroyEventByBody(this.pBody)
        this.scene.world.queueUpdate(world => {
            console.log(world.destroyBody(this.attackArea))
            console.log(world.destroyBody(this.pBody))
        })
        super.destroy()
    }
}