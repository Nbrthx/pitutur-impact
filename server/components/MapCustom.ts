import planck from "planck-js"
import { Player } from "../prefabs/Player"
import { Input, Tilemap, World } from "./Interfaces"
import { Enemy0 } from "../prefabs/Enemys/Enemy0"
import GrowTree from "../prefabs/GrowTree"
import { Enemy1 } from "../prefabs/Enemys/Enemy1"
// import { Home } from "../prefabs/Home"
// import { Enemy2 } from "../prefabs/Enemys/Enemy2"
// import { Bullet } from "../prefabs/Bullet"

export class MapCustom{

    world: World
    key: string;
    mapCustom: ['kolam', 'hutan', 'rumah']
    gameScale: number
    counter: number
    inputCallback: (input: Input) => void

    constructor(world: World, player: Player, key: string){
        this.world = world
        this.key = key

        this.gameScale = 8
        this.counter = 0

        if(key == 'kolam') this.mapKolam(player)
        else if(key == 'hutan' && world.map) this.mapHutan(world.map, player)
        // else if(key == 'rumah' && map) this.mapRumah(map)
    }

    mapKolam(player: Player){
        const mapBuffer = new Array(18*11).fill(0)

        player.inputEvents.push((input) => {
            const attackDir = new planck.Vec2(input.attackDir || { x:0, y:0 })
            if(input.item == 3 && attackDir.length() > 0){
                const x = player.pBody.getPosition().x-2
                const y = player.pBody.getPosition().y-3
                
                for(let i=0; i<4; i++){
                    let sideX = Math.max(i % 2 == 0 ? x-0.5 : x+0.5, -1)
                    let sideY = Math.max(i < 2 ? y-0.5 : y+0.5, -1)

                    if(sideX >= 18+1) sideX = 18*11

                    let index = Math.floor(sideX)+Math.floor(sideY)*18
                    if(mapBuffer[index] === 0){
                        mapBuffer[index] = 1
                        player.socket.emit('add-counter-1', index)
                        addCounter()
                    }
                }
            }
        })

        const addCounter = () => {
            this.counter++
            console.log('counter: '+this.counter)
            if(this.counter >= 198){
                console.log('complete')
                enemy.destroy()
                player.socket.emit('complete')

                // let reward = [12, 60, 1]
                // if(this.difficulty == 'normal') reward = [18, 90, 2]
                // else if(this.difficulty == 'hard') reward = [24, 90, 3]
                
                // Popup.misionComplete('Misi "Eling lan Waspodo" Selesai', 'Item yang didapat: pohon <b>'+reward[0]+'x</b>, ember <b>'+reward[1]+'x</b>, XP <b>'+reward[2]+'x</b>')
                // this.inventory.addItem('pohon', reward[0])
                // this.inventory.addItem('ember', reward[1])
                // this.stats.addXp(reward[2])
            }
        }

        // Enemy
        const enemy = new Enemy0(this.world, 1000, 800, 'easy')
        this.world.enemys.push(enemy)
        this.world.world.queueUpdate(() => {
            enemy.shoter(player)
        })

        // this.world.playerBodys.push(enemy.pBody)

        this.world.contactEvent.addEvent(this.world.projectiles, player.pBody, (_bullet) => {
            console.log('Shoted')
            player.health -= 5

            // const bullet = _bullet.getUserData() as Bullet
            // player.knockbackDir.x = bullet.dir.x ?? 0
            // player.knockbackDir.y = bullet.dir.y ?? 0
            // player.knockback = bullet.knockback

            if(player.health <= 0){ 
                //
            }
        })
        this.world.contactEvent.addEvent(player.weapon.hitbox, enemy.pBody, () => {
            enemy.health -= 5

            console.log(enemy.health)

            let x = (Math.floor(Math.random()*16*11)+16*6)/16
            let y = (Math.floor(Math.random()*16*5)+16*6)/16
            this.world.world.queueUpdate(() => {
                enemy.pBody.setPosition(new planck.Vec2(x, y))
            })

            if(enemy.health <= 0){
                // if(this.difficulty == 'easy') this.outfit.addOutfit('outfit', 'women-purple')
                // else if(this.difficulty == 'normal') this.outfit.addOutfit('outfit', 'brown')
                // else if(this.difficulty == 'hard') this.outfit.addOutfit('outfit', 'gold')
                enemy.destroy()
            }
        })
    }

    mapHutan(map: Tilemap, player: Player){
        const growTrees: planck.Body[] = []
        map.layers.find(v => v.name == 'grow-tree')?.objects.forEach((_o, i) => {
            const o = _o as { x: number, y: number }
            const growTree = new GrowTree(this.world, o.x*this.gameScale, o.y*this.gameScale, i)
            growTrees.push(growTree.pBody)
        })

        player.inputEvents.push((input) => {
            const attackDir = new planck.Vec2(input.attackDir || { x:0, y:0 })
            if(input.item == 2 && attackDir.length() > 0){
                const growTree = player.pBody.getContactList()?.other?.getUserData()
                if(growTree instanceof GrowTree && !growTree.planted){
                    console.log('planting')
                    player.socket.emit('planting', growTree.id)
                    growTree.plant()
                }
            }
            else if(input.item == 1 && attackDir.length() > 0){
                const growTree = player.pBody.getContactList()?.other?.getUserData()
                if(growTree instanceof GrowTree && !growTree.complete){
                    console.log('growing')
                    player.socket.emit('growing', growTree.id)
                    growTree.grow()
                    growTree.complete && addCounter()
                }
            }
        })

        const addCounter = () => {
            this.counter++
            if(this.counter >= 16){
                enemy.destroy()

                console.log('complete')
            }
        }

        // Enemy
        const enemy = new Enemy1(this.world, 800, 800, 'easy')
        enemy.targetPlayer = player
        this.world.enemys.push(enemy)

        this.world.contactEvent.addEvent(player.pBody, enemy.attackArea, () => {
            if(enemy.attackArea.isActive()){
                const { x, y } = player.pBody.getPosition()
                let reflectTime = enemy.reflectTime
                let cooldownTime = enemy.cooldownTime

                setTimeout(() => {
                    if(enemy.entityState == 0) return
                    enemy.attackDir.set(x-enemy.pBody.getPosition().x, y-enemy.pBody.getPosition().y)
                }, enemy.entityState == 2 ? reflectTime[1] : reflectTime[0])

                this.world.world.queueUpdate(() => {
                    enemy.attackArea.setActive(false)
                })
                setTimeout(() => enemy.attackArea && enemy.attackArea.setActive(true), enemy.entityState == 2 ? cooldownTime[1] : cooldownTime[0])
            }
        })
        this.world.contactEvent.addEvent(player.pBody, enemy.weapon.hitbox, () => {
            // if(!player.damaged){
            //     player.damaged = true
            player.health -= 5

            // player.knockbackDir.x = enemy.dir.x ?? 0
            // player.knockbackDir.y = enemy.dir.y ?? 0
            // player.knockback = enemy.attackKnockback

            if(player.health <= 0){
                //
            }
                // else setTimeout(() => player.damaged = false, 300)
            // }
        })
        this.world.contactEvent.addEvent(enemy.pBody, player.weapon.hitbox, () => {
            // if(!enemy.damaged){
            //     enemy.damaged = true
                enemy.health -= 5
                // this.sound.play('hit', { volume: 0.5 })

                if(enemy.health <= 0){
                    // if(this.difficulty == 'easy') this.outfit.addOutfit('head', 'women-purple')
                    // else if(this.difficulty == 'normal') this.outfit.addOutfit('head', 'brown')
                    // else if(this.difficulty == 'hard') this.outfit.addOutfit('outfit', 'dark')
                    enemy.destroy()
                }
                else setTimeout(() => enemy.damaged = false, 300)
            // }
        })
    }

    mapRumah(map: Tilemap, player: Player){
        map; player;
        /*
        const homes: Home[] = []
        map.layers.find(v => v.name == 'home')?.objects.forEach((_o, i) => {
            const o = _o as { x: number, y: number }
            const home = new Home(this.world, o.x*this.gameScale, o.y*this.gameScale, i)
            homes.push(home)
        })

        player.inputEvents.push((input) => {
            const attackDir = new planck.Vec2(input.attackDir || { x:0, y:0 })
            if(input.item == 0 && attackDir.length() > 0){
                const home = player.pBody.getContactList()?.other?.getUserData()
                console.log(home)
                if(home instanceof Home && !home.complete){
                    home.fix()
                    addCounter()
                }
            }
        })

        const addCounter = () => {
            this.counter++
            if(this.counter >= 4){
                
            }
        }

        // Enemy
        const enemy = new Enemy2(this.scene, 1000, 800).setScale(this.gameScale)

        this.scene.enemys.add(enemy)
        /*
        this.scene.physics.add.overlap(this.scene.player, this.scene.projectiles, (_player, _bullet) => {
            if(!this.scene.player.damaged){
                this.scene.player.damaged = true
                console.log('Shoted')
                this.scene.player.health -= 5
                this.scene.sound.play('hit')

                let bullet = _bullet as Bullet
                this.scene.player.knockbackDir.x = bullet.body?.velocity.x ?? 0
                this.scene.player.knockbackDir.y = bullet.body?.velocity.y ?? 0
                this.scene.player.knockback = bullet.knockback

                console.log(this.scene.player.knockback, bullet)
                
                this.scene.tweens.add({
                    targets: this.scene.player.image,
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })

                if(this.scene.player.health <= 0){ 
                    this.scene.UI.blackBgTween('eling', () => {
                        this.scene.scene.start('Game', { from: 'kolam', key: 'eling' })
                    })
                }
                else setTimeout(() => this.scene.player.damaged = false, 300)
            }
        })
        this.scene.physics.add.overlap(this.scene.player.weapon.hitbox, enemy, () => {
            if(!enemy.damaged){
                enemy.damaged = true
                enemy.health -= 5
                this.scene.sound.play('hit', { volume: 0.5 })

                enemy.x = (Math.floor(Math.random()*16*17)+16*3)*this.gameScale
                enemy.y = (Math.floor(Math.random()*16*9)+16*4)*this.gameScale

                this.scene.tweens.add({
                    targets: enemy.image,
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })

                if(enemy.health <= 0){
                    // if(this.difficulty == 'easy') this.outfit.addOutfit('outfit', 'women-purple')
                    // else if(this.difficulty == 'normal') this.outfit.addOutfit('outfit', 'brown')
                    // else if(this.difficulty == 'hard') this.outfit.addOutfit('outfit', 'gold')
                    enemy.destroy()
                }
                else setTimeout(() => enemy.damaged = false, 300)
            }
        })
        */
    }
}