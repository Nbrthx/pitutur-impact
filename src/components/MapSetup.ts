import { Game } from "../scenes/Game";

export class MapSetup{
    static getObjects(scene: Game, map: Phaser.Tilemaps.Tilemap): Phaser.Physics.Arcade.Body[]{
        const collision: Phaser.Physics.Arcade.Body[] = []

        map.getObjectLayer('collision')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number, width: number, height: number}
            const body = scene.physics.add.body(o.x*scene.gameScale, o.y*scene.gameScale, o.width*scene.gameScale, o.height*scene.gameScale)
            body.setImmovable(true)
            collision.push(body)
        })
        let i = 0
        map.getObjectLayer('tree1')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number }
            const tree = scene.physics.add.image(o.x*scene.gameScale, o.y*scene.gameScale, 'tree1')
            tree.setScale(scene.gameScale).setOrigin(0.5, 0.9).setDepth(o.y).setImmovable(true)
            tree.setTint(i%2 == 0 ? 0xeeffee : 0xffffcc)
            tree.body.setSize(15, 10).setOffset(18, 54)
            collision.push(tree.body)
            i++
        })
        map.getObjectLayer('tree2')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number }
            const tree = scene.physics.add.image(o.x*scene.gameScale, o.y*scene.gameScale, 'tree2')
            tree.setScale(scene.gameScale).setOrigin(0.5, 0.8).setDepth(o.y).setImmovable(true)
            tree.body.setSize(28, 10).setOffset(10, 54)
            collision.push(tree.body)
        })
        map.getObjectLayer('home1')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number }
            const tree = scene.physics.add.image(o.x*scene.gameScale, o.y*scene.gameScale, 'home1')
            tree.setScale(scene.gameScale).setOrigin(0.5, 0.8).setDepth(o.y).setImmovable(true)
            tree.body.setSize(42, 10).setOffset(3, 35)
            collision.push(tree.body)
        })

        return collision
    }

    static getEnterances(scene: Game, map: Phaser.Tilemaps.Tilemap): Phaser.GameObjects.Zone[]{
        return map.getObjectLayer('enterance')?.objects.map(_o => {
            const o = _o as { name: string, x: number, y: number, width: number, height: number}
            const zone = scene.add.zone(o.x*scene.gameScale, o.y*scene.gameScale, o.width*scene.gameScale, o.height*scene.gameScale).setName(o.name).setOrigin(0)
            scene.physics.world.enable(zone)
            return zone
        }) || []
    }

    static getEnterPoint(from: string, map: Phaser.Tilemaps.Tilemap): {x:number, y:number}{
        const enterPoint = {
            x: 0,
            y: 0
        }
        let exist = false
        let gameScale = (map.scene as Game).gameScale
        map.getObjectLayer('enter-point')?.objects.forEach(_o => {
            const o = _o as { name: string, x: number, y: number }
            
            if(from == o.name){
                exist = true
                enterPoint.x = o.x*gameScale
                enterPoint.y = o.y*gameScale
            }
            else if(!exist){
                enterPoint.x = o.x*gameScale
                enterPoint.y = o.y*gameScale
            }
        })
        return enterPoint
    }

    static getNPCs(scene: Game, map: Phaser.Tilemaps.Tilemap): Phaser.Physics.Arcade.Sprite[]{
        const npcs: Phaser.Physics.Arcade.Sprite[] = []
        map.getObjectLayer('npc')?.objects.forEach(_o => {
            const o = _o as { name: string, x: number, y: number }
            const npc = scene.physics.add.sprite(o.x*scene.gameScale, o.y*scene.gameScale, o.name)
            npc.setName(o.name).setFlipX(true).setScale(scene.gameScale).setOrigin(0.5, 0.8)
            npc.play(o.name+'-idle')
            npcs.push(npc)
        })
        return npcs
    }
}