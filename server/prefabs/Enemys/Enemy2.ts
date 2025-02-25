import { World } from "../../components/Interfaces";
import { Bullet } from "../Bullet";
import { Entity } from "../Entity";
import { Player } from "../Player";

export class Enemy0 extends Entity{

    attackSpeed: number[] = [1500, 800];
    attackKnockback: number = 4;
    
    stateTime: number[] = [5000, 4000, 7000]
    eventState: NodeJS.Timeout;

    constructor(world: World, x: number, y: number, difficulty: string){
        super(world, x, y)

        this.id = 'enemy0'

        if(difficulty == 'normal'){
            this.maxHealth = 150
            this.attackSpeed = [1000, 600]
            this.attackKnockback = 5
            this.stateTime = [4000, 5000, 7000]
        }
        else if(difficulty == 'hard'){
            this.maxHealth = 200
            this.attackSpeed = [800, 500]
            this.attackKnockback = 6
            this.stateTime = [Math.floor(Math.random()*3000)+3000, 6000, Math.floor(Math.random()*3000)+5000]
            this.eventState = setInterval(() => {
                this.stateTime = [Math.floor(Math.random()*3000)+3000, 6000, Math.floor(Math.random()*3000)+5000]
            }, this.stateTime[0]+this.stateTime[1]+this.stateTime[2])
        }

        this.changeState()
    }

    shoter(player: Player){
        if(this.isAlive){
            const pos = this.pBody.getPosition()
            const targetPos = player.pBody.getPosition()
            if(this.entityState == 2){
                this.attack(targetPos.x-pos.x, targetPos.y-pos.y)
                setTimeout(() => this.shoter(player), this.attackSpeed[1])
            }
            else{
                const x = pos.x-1+Math.random()*2
                const y = pos.y-1+Math.random()*2
                this.attack(targetPos.x-x, targetPos.y-y)
                setTimeout(() => this.shoter(player), this.attackSpeed[0])
            }
        }
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
        if(this.entityState == 1) return

        const bullet = new Bullet(this.world, this.pBody, x, y)
        bullet.knockback = this.attackKnockback
        
        this.world.projectiles.push(bullet.pBody)
        bullet.update()
    }

    destroy(): void {
        this.isAlive = false
        super.destroy()
        clearInterval(this.eventState)
        console.log('destroy')
    }
}