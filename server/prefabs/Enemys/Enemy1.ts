import planck from "planck-js";
import { Player } from "../Player";
import { Weapon } from "../Weapon";
import { World } from "../../components/Interfaces";
import { Entity } from "../Entity";

export class Enemy1 extends Entity{

    weapon: Weapon;
    attackArea: planck.Body

    speed: number[] = [0.75, 0.95];
    reflectTime: number[] = [400, 200];
    cooldownTime: number[] = [1500, 1000];
    attackKnockback: number = 8;
    targetPlayer: Player

    stateTime: number[] = [4000, 4000, 7000]
    eventState: NodeJS.Timeout;

    constructor(world: World, x: number, y: number, difficulty: string){
        super(world, x, y)

        this.id = 'enemy1'

        this.weapon = new Weapon(world, this.pBody)
        this.weapon.hitbox.destroyFixture(this.weapon.hitbox.getFixtureList() as planck.Fixture)
        this.weapon.hitbox.createFixture({
            shape: new planck.Circle(new planck.Vec2(0, 0), 10/16),
            isSensor: true
        })

        this.attackArea = world.world.createKinematicBody();
        this.attackArea.createFixture({
            shape: new planck.Circle(new planck.Vec2(0, 0), 24/16),
            isSensor: true
        });

        if(difficulty == 'normal'){
            this.maxHealth = 200
            this.speed = [0.85, 1.05]
            this.reflectTime = [300, 100]
            this.cooldownTime = [1200, 800]
            this.attackKnockback = 9;
            this.stateTime = [3000, 5000, 7000]
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
        }

        this.health = this.maxHealth

        this.changeState()
    }

    changeState(){
        if(this.isAlive){
            this.entityState++
            
            if(this.entityState == 1) setTimeout(() => this.changeState(), this.stateTime[0])
            else if(this.entityState == 2){
                setTimeout(() => this.changeState(), this.stateTime[1])
            }
            else{ 
                this.entityState = 0
                setTimeout(() => this.changeState(), this.stateTime[2])
            }
        }
    }

    attack(x: number, y: number){
        if(this.entityState == 0) return

        let rad = Math.atan2(y, x)
        this.weapon.attack(rad)
    }

    update(){
        if(this.targetPlayer){
            this.dir.x = this.targetPlayer.pBody.getPosition().x - this.pBody.getPosition().x 
            this.dir.y = this.targetPlayer.pBody.getPosition().y - this.pBody.getPosition().y 
        }

        this.dir.normalize()

        if(this.entityState == 1){
            this.dir.mul(this.speed[0]);
        }
        else if(this.entityState == 2){
            this.dir.mul(this.speed[1]);
        }
        else{
            this.dir.mul(0);
        }

        if(this.pBody.getPosition().clone().sub(this.targetPlayer.pBody.getPosition()).length() > 1.2){
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

        if(this.attackDir.length() > 0){
            this.attack(this.attackDir.x, this.attackDir.y)
        }
    }

    destroy(): void {
        this.isAlive = false
        super.destroy()
        clearInterval(this.eventState)

        this.world.contactEvent.destroyEventByBody(this.attackArea)
        this.pBody.getWorld().queueUpdate(world => {
            world.destroyBody(this.attackArea)
            this.weapon.destroy()
            console.log('destroy')
        })
    }
}