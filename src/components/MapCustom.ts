import { Enemy0 } from "../prefabs/Enemys/Enemy0"
import { Enemy1 } from "../prefabs/Enemys/Enemy1"
import { Enemy2 } from "../prefabs/Enemys/Enemy2";
import GrowTree from "../prefabs/GrowTree";
import { Home } from "../prefabs/Home";
import { Game } from "../scenes/Game"
import planck from "planck-js"

export class MapCustom{

    counter: number
    key: string;
    scene: Game
    gameScale: number

    constructor(scene: Game, key: string, map: Phaser.Tilemaps.Tilemap | null){
        this.scene = scene
        this.key = key

        this.gameScale = scene.gameScale
        this.counter = 0

        if(key == 'kolam' && map) this.mapKolam(map)
        else if(key == 'hutan' && map) this.mapHutan(map)
        else if(key == 'rumah' && map) this.mapRumah(map)
    }

    mapKolam(map: Phaser.Tilemaps.Tilemap){
        const tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
        const embung = map.createLayer('embung', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer
        embung.setScale(this.gameScale)

        this.scene.networkHandler.handleAddCounter1 = (index) => {
            let sideX = (index%18+2)*this.gameScale*16
            let sideY = (Math.floor(index/18)+3)*this.gameScale*16
            if(embung.hasTileAtWorldXY(sideX, sideY)){
                embung.removeTileAtWorldXY(sideX, sideY)
            }
        }
        
        this.scene.networkHandler.handleComplete = () => {
            if(enemy.active) enemy.destroy()

            this.scene.UI.blackBgTween('eling', () => {
                this.scene.projectiles.forEach(v => {
                    this.scene.world.destroyBody(v)
                })
                this.scene.scene.start('Game', { from: 'kolam', key: 'eling', complete: true })
            })

            // let reward = [12, 60, 1]
            // if(this.difficulty == 'normal') reward = [18, 90, 2]
            // else if(this.difficulty == 'hard') reward = [24, 90, 3]
            
            // Popup.misionComplete('Misi "Eling lan Waspodo" Selesai', 'Item yang didapat: pohon <b>'+reward[0]+'x</b>, ember <b>'+reward[1]+'x</b>, XP <b>'+reward[2]+'x</b>')
            // this.inventory.addItem('pohon', reward[0])
            // this.inventory.addItem('ember', reward[1])
            // this.stats.addXp(reward[2])
        }

        // Enemy
        const enemy = new Enemy0(this.scene, 1000, 800).setScale(this.gameScale)
        enemy.trackPlayer = this.scene.player
        this.scene.enemys.push(enemy.pBody)

        this.scene.contactEvent.addEvent(this.scene.projectiles, this.scene.player.pBody, (_bullet) => {
            console.log(_bullet)
            if(!this.scene.player.damaged){
                this.scene.player.damaged = true
                console.log('Shoted')
                this.scene.sound.play('hit')
                
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
        this.scene.networkHandler.handleEnemyHealthChange = () => {
            if(!enemy.damaged){
                enemy.damaged = true
                this.scene.sound.play('hit', { volume: 0.5 })

                // let x = (Math.floor(Math.random()*16*11)+16*6)/16
                // let y = (Math.floor(Math.random()*16*5)+16*6)/16
                // this.scene.world.queueUpdate(() => {
                //     enemy.pBody.setPosition(new planck.Vec2(x, y))
                // })
                
                this.scene.tweens.add({
                    targets: enemy.image,
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })
            }
            if(enemy.health <= 0){
                // if(this.difficulty == 'easy') this.outfit.addOutfit('outfit', 'women-purple')
                // else if(this.difficulty == 'normal') this.outfit.addOutfit('outfit', 'brown')
                // else if(this.difficulty == 'hard') this.outfit.addOutfit('outfit', 'gold')
                enemy.destroy()
            }
            else setTimeout(() => enemy.damaged = false, 300)
        }
    }

    mapHutan(map: Phaser.Tilemaps.Tilemap){
        const growTrees: planck.Body[] = []
        map.getObjectLayer('grow-tree')?.objects.forEach((_o, i) => {
            const o = _o as { x: number, y: number }
            const growTree = new GrowTree(this.scene, o.x*this.gameScale, o.y*this.gameScale, i)
            growTree.setScale(this.gameScale)
            growTrees.push(growTree.pBody)
        })

        this.scene.networkHandler.handlePlanting = (id) => {
            const growTree = growTrees.find(v => (v.getUserData() as GrowTree).id == id)?.getUserData()
            if(growTree instanceof GrowTree && !growTree.planted && this.scene.UI.inventory.useItem(2)){
                growTree.plant()
            }
        }
        this.scene.networkHandler.handleGrowing = (id) => {
            const growTree = growTrees.find(v => (v.getUserData() as GrowTree).id == id)?.getUserData()
            if(growTree instanceof GrowTree && !growTree.complete && this.scene.UI.inventory.useItem(1)){
                growTree.grow()
                growTree.complete && addCounter()
            }
        }

        const addCounter = () => {
            this.counter++
            if(this.counter >= 16){
                if(enemy.active) enemy.destroy()

                this.scene.UI.blackBgTween('hamemayu', () => {
                    this.scene.scene.start('Game', { from: 'hutan', key: 'hamemayu', complete: true })
                })
            }
        }

        // Enemy
        const enemy = new Enemy1(this.scene, 800, 800).setScale(this.gameScale)
        enemy.isWalk = true
        enemy.trackPlayer = this.scene.player
        this.scene.enemys.push(enemy.pBody)

        this.scene.contactEvent.addEvent(this.scene.player.pBody, enemy.weapon.hitbox, () => {
            if(!this.scene.player.damaged){
                this.scene.player.damaged = true
                this.scene.player.health -= 5
                // this.sound.play('hit')

                this.scene.player.knockbackDir.x = enemy.dir.x ?? 0
                this.scene.player.knockbackDir.y = enemy.dir.y ?? 0
                this.scene.player.knockback = enemy.attackKnockback
                
                this.scene.tweens.add({
                    targets: this.scene.player.image,
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })

                if(this.scene.player.health <= 0){
                    this.scene.UI.blackBgTween('hamemayu', () => {
                        this.scene.scene.start('Game', { from: 'hutan', key: 'hamemayu' })
                    })
                }
                else setTimeout(() => this.scene.player.damaged = false, 300)
            }
        })
        this.scene.networkHandler.handleEnemyHealthChange = () => {
            if(!enemy.damaged){
                enemy.damaged = true
                // this.sound.play('hit', { volume: 0.5 })

                this.scene.tweens.add({
                    targets: enemy,
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })
            }
            if(enemy.health <= 0){
                // if(this.difficulty == 'easy') this.outfit.addOutfit('head', 'women-purple')
                // else if(this.difficulty == 'normal') this.outfit.addOutfit('head', 'brown')
                // else if(this.difficulty == 'hard') this.outfit.addOutfit('outfit', 'dark')
                enemy.destroy()
            }
            else setTimeout(() => enemy.damaged = false, 300)
        }
    }

    mapRumah(map: Phaser.Tilemaps.Tilemap){
        const homes = this.scene.add.group()
        map.getObjectLayer('home')?.objects.forEach((_o, i) => {
            const o = _o as { x: number, y: number }
            const home = new Home(this.scene, o.x*this.gameScale, o.y*this.gameScale, i)
            home.setScale(this.gameScale)
            homes.add(home)
        })

        this.scene.input.on('pointerdown', () => {
            if(this.scene.UI.inventory.getSelectedIndex() == 0){
                const home = this.scene.player.pBody.getContactList()?.other?.getUserData()
                console.log(home)
                if(home instanceof Home && !home.complete && this.scene.UI.inventory.useItem(0)){
                    home.fix()
                    addCounter
                }
            }
        })

        const addCounter = () => {
            this.counter++
            if(this.counter >= 4){
                if(enemy.active) enemy.destroy()
            }
        }

        // Enemy
        const enemy = new Enemy2(this.scene, 1000, 800).setScale(this.gameScale)

        this.scene.enemys.push(enemy.pBody)
        
    //     this.scene.physics.add.overlap(this.scene.player, this.scene.projectiles, (_player, _bullet) => {
    //         if(!this.scene.player.damaged){
    //             this.scene.player.damaged = true
    //             console.log('Shoted')
    //             this.scene.player.health -= 5
    //             this.scene.sound.play('hit')

    //             let bullet = _bullet as Bullet
    //             this.scene.player.knockbackDir.x = bullet.body?.velocity.x ?? 0
    //             this.scene.player.knockbackDir.y = bullet.body?.velocity.y ?? 0
    //             this.scene.player.knockback = bullet.knockback

    //             console.log(this.scene.player.knockback, bullet)
                
    //             this.scene.tweens.add({
    //                 targets: this.scene.player.image,
    //                 duration: 50,
    //                 ease: 'ease-in-out',
    //                 alpha: 0,
    //                 repeat: 1,
    //                 yoyo: true
    //             })

    //             if(this.scene.player.health <= 0){ 
    //                 this.scene.UI.blackBgTween('eling', () => {
    //                     this.scene.scene.start('Game', { from: 'kolam', key: 'eling' })
    //                 })
    //             }
    //             else setTimeout(() => this.scene.player.damaged = false, 300)
    //         }
    //     })
    //     this.scene.physics.add.overlap(this.scene.player.weapon.hitbox, enemy, () => {
    //         if(!enemy.damaged){
    //             enemy.damaged = true
    //             enemy.health -= 5
    //             this.scene.sound.play('hit', { volume: 0.5 })

    //             enemy.x = (Math.floor(Math.random()*16*17)+16*3)*this.gameScale
    //             enemy.y = (Math.floor(Math.random()*16*9)+16*4)*this.gameScale

    //             this.scene.tweens.add({
    //                 targets: enemy.image,
    //                 duration: 50,
    //                 ease: 'ease-in-out',
    //                 alpha: 0,
    //                 repeat: 1,
    //                 yoyo: true
    //             })

    //             if(enemy.health <= 0){
    //                 // if(this.difficulty == 'easy') this.outfit.addOutfit('outfit', 'women-purple')
    //                 // else if(this.difficulty == 'normal') this.outfit.addOutfit('outfit', 'brown')
    //                 // else if(this.difficulty == 'hard') this.outfit.addOutfit('outfit', 'gold')
    //                 enemy.destroy()
    //             }
    //             else setTimeout(() => enemy.damaged = false, 300)
    //         }
    //     })
    }
}