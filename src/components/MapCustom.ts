import { Bullet } from "../prefabs/Bullet";
import { Enemy } from "../prefabs/Enemy"
import { Game } from "../scenes/Game"

export class MapCustom{

    counter: number
    key: string;
    scene: Game

    constructor(scene: Game, key: string, map: Phaser.Tilemaps.Tilemap | null){
        this.scene = scene
        this.key = key

        if(key == 'kolam' && map) this.mapKolam(map)
    }

    mapKolam(map: Phaser.Tilemaps.Tilemap){
        const tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
        const embung = map.createLayer('embung', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer
        embung.setScale(7)

        this.scene.input.on('pointerdown', () => {
            if(this.scene.UI.inventory.getSelectedIndex() == 3){
                const x = this.scene.player.x
                const y = this.scene.player.y
                
                if(embung.hasTileAtWorldXY(x-8*7, y-8*7)){
                    embung.removeTileAtWorldXY(x-8*7, y-8*7)
                    this.addCounter()
                }
                if(embung.hasTileAtWorldXY(x+8*7, y-8*7)){
                    embung.removeTileAtWorldXY(x+8*7, y-8*7)
                    this.addCounter()
                }
                if(embung.hasTileAtWorldXY(x-8*7, y+8*7)){
                    embung.removeTileAtWorldXY(x-8*7, y+8*7)
                    this.addCounter
                }
                if(embung.hasTileAtWorldXY(x+8*7, y+8*7)){
                    embung.removeTileAtWorldXY(x+8*7, y+8*7)
                    this.addCounter()
                }
            }
        })

        // Enemy
        const enemy = new Enemy(this.scene, 800, 800, 'easy').setScale(7)
        enemy.shoter(this.scene.player)

        this.scene.enemys.add(enemy)

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
                    this.scene.player.destroy()
                    this.scene.scene.start('GameOver')
                }

                setTimeout(() => this.scene.player.damaged = false, 300)
            }
        })
        this.scene.physics.add.overlap(this.scene.player.weapon.hitbox, enemy, () => {
            if(!enemy.damaged){
                enemy.damaged = true
                enemy.health -= 5
                this.scene.sound.play('hit', { volume: 0.5 })

                enemy.x = (Math.floor(Math.random()*16*17)+16*3)*7
                enemy.y = (Math.floor(Math.random()*16*9)+16*4)*7

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

                setTimeout(() => enemy.damaged = false, 300)
            }
        })
    }

    addCounter(){
        this.counter++
        if(this.counter == 1){
            // 'Kamu juga bisa mengalahkan musuh terlebih dahulu'
        }
        if(this.counter >= 198){
            // if(this.enemy.active) this.enemy.destroy()
            // this.physics.add.overlap(this.enterance[0], this.player, (_obj1, _player) => {
            //     if(this.attackEvent) this.attack?.removeEventListener('touchstart', this.attackEvent, true)
            //     this.scene.start('Eling', { from: 'kolam' })
            // })

            // let reward = [12, 60, 1]
            // if(this.difficulty == 'normal') reward = [18, 90, 2]
            // else if(this.difficulty == 'hard') reward = [24, 90, 3]
            
            // Popup.misionComplete('Misi "Eling lan Waspodo" Selesai', 'Item yang didapat: pohon <b>'+reward[0]+'x</b>, ember <b>'+reward[1]+'x</b>, XP <b>'+reward[2]+'x</b>')
            // this.inventory.addItem('pohon', reward[0])
            // this.inventory.addItem('ember', reward[1])
            // this.stats.addXp(reward[2])
        }
    }
}