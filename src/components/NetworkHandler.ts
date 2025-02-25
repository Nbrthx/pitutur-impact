import planck from "planck-js"
import { Socket } from "socket.io-client"
import { Game } from "../scenes/Game"
import { Player } from "../prefabs/Player"
import { Entity } from "../prefabs/Entity"
import { Bullet } from "../prefabs/Bullet"

interface PlayerData{
    id: string
    x: number
    y: number
    dir: {
        x: number
        y: number
    }
    attackDir: {
        x: number
        y: number
    }
    health: number
    ping: number
    timestamp: number
    world: string
}

interface EnemysData{
    id: string
    x: number
    y: number
    state: number
    dir: {
        x: number
        y: number
    }
    attackDir: {
        x: number
        y: number
    }
    health: number
}

interface ProjectileData{
    id: number
    parentId: string
    x: number
    y: number
    dir: {
        x: number
        y: number
    }
}

interface GameState{
    players: PlayerData[]
    enemys: EnemysData[]
    projectiles: ProjectileData[]
}

interface InputData{
    dir?: planck.Vec2
    attackDir?: planck.Vec2
    item: number
    timestamp?: number
}

export class NetworkHandler{

    socket: Socket
    timestamp: number

    constructor(scene: Game, socket: Socket, key: string, from: string){
        this.socket = socket
        this.socket.emit('join', key, from)

        this.socket.on('join', () => {
            this.socket.on('update', (gameState: GameState) => {
                for(let player of gameState.players){
                    this.playerUpdate(scene, key, player)
                }
                for(let enemy of gameState.enemys){
                    this.enemyUpdate(scene, enemy)
                }
                for(let projectile of gameState.projectiles){
                    this.projectileUpdate(scene, projectile)
                }
            })

            this.socket.on('complete', () => this.handleComplete())
            this.socket.on('add-counter-1', (index: number) => this.handleAddCounter1(index))
            this.socket.on('planting', (id: number) => this.handlePlanting(id))
            this.socket.on('growing', (id: number) => this.handleGrowing(id))
    
            this.socket.on('left', (id: string) => this.onLeft(scene, id))
        })
    }

    playerUpdate(scene: Game, key: string, player: PlayerData){
        if(player.id == this.socket.id && (player.world == key || player.world.split('-')[0] == key)){
            const pos = new planck.Vec2(player)

            const discrepancy = pos.sub(scene.player.pBody.getPosition()).length();
            if(discrepancy > 0.1 && this.timestamp == player.timestamp){
                console.log('reconcill')
                scene.player.pBody.setPosition(player)
            }

            if(Date.now() % 250 <= 1000/50){
                scene.UI.pingText.setText(Date.now()-player.ping+'ms')
            }

            if(scene.player.health != player.health){
                scene.player.health = player.health
                console.log('attacked')
            }
            
        }
        else{
            if(!scene.others.find(v => v.name == player.id)){
                const newOther = new Player(scene, player.x*scene.gameScale*16, player.y*scene.gameScale*16)
                newOther.setName(player.id)
                scene.others.push(newOther)
            }

            const other = scene.others.find(v => v.name == player.id)
            if(other){
                const dir = new planck.Vec2(player.dir)
                const length = new planck.Vec2(player).clone().sub(other.pBody.getPosition()).length()
                if(length > 0.005 && length < 1.5){
                    dir.normalize()
                    other.pBody.setPosition(new planck.Vec2(player))
                    other.pBody.setLinearVelocity(dir)
                    other.pBody.getLinearVelocity().mul(0.6)
                }
                else{
                    other.pBody.setPosition(new planck.Vec2(player))
                    other.pBody.setLinearVelocity(new planck.Vec2())
                }

                if(new planck.Vec2(player.attackDir).length() > 0){
                    other.pBody.setPosition(new planck.Vec2(player))
                    other.attack(player.attackDir.x, player.attackDir.y)
                }
                
                if(other.health != player.health){
                    other.health = player.health
                    console.log('attacked')
                }
            }
        }
    }

    enemyUpdate(scene: Game, enemy: EnemysData){
        if(scene.enemys.find(v => (v.getUserData() as Entity).id == enemy.id)){
            const pos = new planck.Vec2(enemy)
            const existEnemy = scene.enemys.find(v => (v.getUserData() as Entity).id == enemy.id)?.getUserData() as Entity
            if(!existEnemy.maxHealth){
                existEnemy.maxHealth = enemy.health
                existEnemy.health = enemy.health
            }
            
            if(existEnemy.isWalk){
                const dir = new planck.Vec2(enemy.dir)
                const length = new planck.Vec2(enemy).clone().sub(existEnemy.pBody.getPosition()).length()
                if(length > 0.005 && length < 1.5){
                    dir.normalize()
                    existEnemy.pBody.setPosition(new planck.Vec2(enemy))
                    existEnemy.pBody.setLinearVelocity(dir)
                }
                else{
                    existEnemy.pBody.setPosition(new planck.Vec2(enemy))
                }
            }
            else{
                existEnemy.pBody.setPosition(pos)
            }

            if(new planck.Vec2(enemy.attackDir).length() > 0){
                existEnemy.pBody.setPosition(new planck.Vec2(enemy))
                existEnemy.attack(enemy.attackDir.x, enemy.attackDir.y)
            }

            if(existEnemy.health != enemy.health){
                existEnemy.health = enemy.health
                this.handleEnemyHealthChange()
            }
        }
    }

    projectileUpdate(scene: Game, projectile: ProjectileData){
        if(!scene.projectiles.find(v => (v.getUserData() as Bullet).id == projectile.id)){
            const enemy = scene.enemys.find(v => (v.getUserData() as Entity).id == projectile.parentId)?.getUserData() as Entity
            const newProjectile = new Bullet(scene, enemy, projectile.dir.x, projectile.dir.y, 'bullet', projectile.id)
            scene.projectiles.push(newProjectile.pBody)
        }
        else{
            const pos = new planck.Vec2(projectile)
            const existProjectile = scene.projectiles.find(v => (v.getUserData() as Bullet).id == projectile.id)
            existProjectile?.setPosition(pos)
        }
    }

    onLeft(scene: Game, id: string){
        console.log('left')
        const other = scene.others.find(v => v.name == id)
        other?.destroy()
        scene.others = scene.others.filter(v => v.name != id)
    }

    emitInput(input: InputData){
        if(input.dir?.length() || 0 > 0 || input.attackDir?.length() || 0 > 0) this.timestamp = Date.now()
        
        input.timestamp = this.timestamp
        this.socket.emit('input', input, Date.now())
    }

    handleComplete = () => {}
    handleEnemyHealthChange = () => {}
    handleAddCounter1 = (index: number) => { index }
    handlePlanting = (id: number) => { id }
    handleGrowing = (id: number) => { id }
}