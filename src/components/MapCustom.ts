import { Bullet } from "../prefabs/Bullet";
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

        this.scene.input.on('pointerdown', () => {
            if(this.scene.UI.inventory.getSelectedIndex() == 3){
                const x = this.scene.player.x
                const y = this.scene.player.y
                
                for(let i=0; i<4; i++){
                    let sideX = i % 2 == 0 ? x-8*this.gameScale : x+8*this.gameScale
                    let sideY = i < 2 ? y-8*this.gameScale : y+8*this.gameScale

                    if(embung.hasTileAtWorldXY(sideX, sideY)){
                        embung.removeTileAtWorldXY(sideX, sideY)
                        addCounter()
                    }
                }
            }
        })

        const addCounter = () => {
            this.counter++
            if(this.counter == 1){
                // 'Kamu juga bisa mengalahkan musuh terlebih dahulu'
            }
            if(this.counter >= 198){
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
        }

        // Enemy
        const enemy = new Enemy0(this.scene, 1000, 800, 'easy').setScale(this.gameScale)
        enemy.shoter(this.scene.player)

        this.scene.enemys.add(enemy)

        this.scene.contactEvent.addEvent(this.scene.projectiles, this.scene.player.pBody, (_bullet) => {
            console.log(_bullet)
            if(!this.scene.player.damaged){
                this.scene.player.damaged = true
                console.log('Shoted')
                this.scene.player.health -= 5
                this.scene.sound.play('hit')

                const bullet = _bullet.getUserData() as Bullet
                this.scene.player.knockbackDir.x = bullet.dir.x ?? 0
                this.scene.player.knockbackDir.y = bullet.dir.y ?? 0
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
        this.scene.contactEvent.addEvent(this.scene.player.weapon.hitbox, enemy.pBody, () => {
            if(!enemy.damaged){
                enemy.damaged = true
                enemy.health -= 5
                this.scene.sound.play('hit', { volume: 0.5 })

                let x = (Math.floor(Math.random()*16*11)+16*6)/16
                let y = (Math.floor(Math.random()*16*5)+16*6)/16
                this.scene.world.queueUpdate(() => {
                    enemy.pBody.setPosition(new planck.Vec2(x, y))
                })
                
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
    }

    mapHutan(map: Phaser.Tilemaps.Tilemap){
        const growTrees: planck.Body[] = []
        map.getObjectLayer('grow-tree')?.objects.forEach((_o, i) => {
            const o = _o as { x: number, y: number }
            const growTree = new GrowTree(this.scene, o.x*this.gameScale, o.y*this.gameScale, i)
            growTree.setScale(this.gameScale)
            growTrees.push(growTree.pBody)
        })

        this.scene.input.on('pointerdown', () => {
            if(this.scene.UI.inventory.getSelectedIndex() == 2){
                const growTree = this.scene.player.pBody.getContactList()?.other?.getUserData()
                if(growTree instanceof GrowTree && !growTree.planted && this.scene.UI.inventory.useItem(2)){
                    growTree.plant()
                }
            }
            else if(this.scene.UI.inventory.getSelectedIndex() == 1){
                const growTree = this.scene.player.pBody.getContactList()?.other?.getUserData()
                if(growTree instanceof GrowTree && !growTree.complete && this.scene.UI.inventory.useItem(1)){
                    growTree.grow()
                    growTree.complete && addCounter()
                }
            }
        })

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
        const enemy = new Enemy1(this.scene, 800, 800, 'easy').setScale(this.gameScale)
        enemy.targetPlayer = this.scene.player
        this.scene.enemys.add(enemy)

        this.scene.contactEvent.addEvent(this.scene.player.pBody, enemy.attackArea, () => {
            console.log('attack area')
            if(enemy.attackArea.isActive()){
                const { x, y } = this.scene.player
                let reflectTime = enemy.reflectTime
                let cooldownTime = enemy.cooldownTime

                setTimeout(() => {
                    enemy && enemy.active && enemy.attack(x, y)
                }, enemy.enemyState == 2 ? reflectTime[1] : reflectTime[0])

                this.scene.world.queueUpdate(() => {
                    enemy.attackArea.setActive(false)
                })
                setTimeout(() => enemy.attackArea && enemy.attackArea.setActive(true), enemy.enemyState == 2 ? cooldownTime[1] : cooldownTime[0])
            }
        })
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
        this.scene.contactEvent.addEvent(enemy.pBody, this.scene.player.weapon.hitbox, () => {
            if(!enemy.damaged){
                enemy.damaged = true
                enemy.health -= 5
                // this.sound.play('hit', { volume: 0.5 })

                this.scene.tweens.add({
                    targets: enemy,
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })

                if(enemy.health <= 0){
                    // if(this.difficulty == 'easy') this.outfit.addOutfit('head', 'women-purple')
                    // else if(this.difficulty == 'normal') this.outfit.addOutfit('head', 'brown')
                    // else if(this.difficulty == 'hard') this.outfit.addOutfit('outfit', 'dark')
                    enemy.destroy()
                }
                else setTimeout(() => enemy.damaged = false, 300)
            }
        })
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