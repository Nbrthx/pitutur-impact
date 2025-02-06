import { Game } from "../scenes/Game";
import planck from 'planck-js'

export class MapSetup{
    static getObjects(scene: Game, map: Phaser.Tilemaps.Tilemap): planck.Body[]{
        const collision: planck.Body[] = []

        map.getObjectLayer('collision')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number, width: number, height: number}
            const body = scene.world.createBody(new planck.Vec2((o.x)/16, (o.y)/16))
            body.createFixture(new planck.Box(o.width/2/16, o.height/2/16, new planck.Vec2(o.width/2/16, o.height/2/16)))
            // scene.physics.add.body(o.x*scene.gameScale, o.y*scene.gameScale, o.width*scene.gameScale, o.height*scene.gameScale)
            collision.push(body)
        })
        let i = 0
        map.getObjectLayer('tree1')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number }
            const tree = scene.add.image(o.x*scene.gameScale, o.y*scene.gameScale, 'tree1')
            tree.setScale(scene.gameScale).setOrigin(0.5, 0.9).setDepth(o.y)
            tree.setTint(i%2 == 0 ? 0xeeffee : 0xffffcc)

            const body = scene.world.createBody(new planck.Vec2((o.x+16/16)/16, (o.y+24/16)/16))
            body.createFixture(new planck.Box(16/2/16, 10/2/16))
            collision.push(body)
            i++
        })
        map.getObjectLayer('tree2')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number }
            const tree = scene.add.image(o.x*scene.gameScale, o.y*scene.gameScale, 'tree2')
            tree.setScale(scene.gameScale).setOrigin(0.5, 0.8).setDepth(o.y)

            const body = scene.world.createBody(new planck.Vec2((o.x)/16, (o.y+120/16)/16))
            body.createFixture(new planck.Box(28/2/16, 10/2/16))
            collision.push(body)
        })
        map.getObjectLayer('home1')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number }
            const tree = scene.add.image(o.x*scene.gameScale, o.y*scene.gameScale, 'home1')
            tree.setScale(scene.gameScale).setOrigin(0.5, 0.8).setDepth(o.y)

            const body = scene.world.createBody(new planck.Vec2((o.x)/16, (o.y+2)/16))
            body.createFixture(new planck.Box(42/2/16, 10/2/16))
            collision.push(body)
        })

        return collision
    }

    static getEnterances(scene: Game, map: Phaser.Tilemaps.Tilemap): planck.Body[]{
        return map.getObjectLayer('enterance')?.objects.map(_o => {
            const o = _o as { name: string, x: number, y: number, width: number, height: number}
            const body = scene.world.createBody(new planck.Vec2((o.x+o.width/2)/16, (o.y+o.height/2)/16))
            body.createFixture({
                shape: new planck.Box(o.width/2/16, o.height/2/16),
                isSensor: true
            })
            body.setUserData(o.name)
            return body
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

    static getNPCs(scene: Game, map: Phaser.Tilemaps.Tilemap): planck.Body[]{
        const npcs: planck.Body[] = []
        map.getObjectLayer('npc')?.objects.forEach(_o => {
            const o = _o as { name: string, x: number, y: number }
            const npc = scene.add.sprite(o.x*scene.gameScale, o.y*scene.gameScale, o.name)
            npc.setFlipX(true).setScale(scene.gameScale).setOrigin(0.5, 0.8)
            npc.play(o.name+'-idle')

            const body = scene.world.createDynamicBody(new planck.Vec2(o.x/16, (o.y-4)/16))
            body.createFixture({
                shape: new planck.Box(0.4, 0.5),
                filterCategoryBits: 2,
                filterMaskBits: 1,
                isSensor: true
            })
            body.setUserData(o.name)
            npcs.push(body)
        })
        return npcs
    }
}