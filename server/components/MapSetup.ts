import planck from 'planck-js'

interface Tilemap{
    width: number
    height: number
    layers: {
        name: string
        objects: {
            name: string
            x: number
            y: number
            width: number
            height: number
        }[]
    }[]
}

export class MapSetup{

    static getObjects(world: planck.World, map: Tilemap): planck.Body[]{
        const collision: planck.Body[] = []

        map.layers.find(v => v.name == 'collision')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number, width: number, height: number}
            const body = world.createBody(new planck.Vec2((o.x)/16, (o.y)/16))
            body.createFixture(new planck.Box(o.width/2/16, o.height/2/16, new planck.Vec2(o.width/2/16, o.height/2/16)))
            collision.push(body)
        })
        let i = 0
        map.layers.find(v => v.name == 'tree1')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number }
            const body = world.createBody(new planck.Vec2((o.x+16/16)/16, (o.y+24/16)/16))
            body.createFixture(new planck.Box(16/2/16, 10/2/16))
            collision.push(body)
            i++
        })
        map.layers.find(v => v.name == 'tree2')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number }
            const body = world.createBody(new planck.Vec2((o.x)/16, (o.y+120/16)/16))
            body.createFixture(new planck.Box(28/2/16, 10/2/16))
            collision.push(body)
        })
        map.layers.find(v => v.name == 'home1')?.objects.forEach(_o => {
            const o = _o as { x: number, y: number }
            const body = world.createBody(new planck.Vec2((o.x)/16, (o.y+2)/16))
            body.createFixture(new planck.Box(42/2/16, 10/2/16))
            collision.push(body)
        })

        return collision
    }

    static getEnterances(world: planck.World, map: Tilemap): planck.Body[]{
        return map.layers.find(v => v.name == 'enterance')?.objects.map(_o => {
            const o = _o as { name: string, x: number, y: number, width: number, height: number}
            const body = world.createBody(new planck.Vec2((o.x+o.width/2)/16, (o.y+o.height/2)/16))
            body.createFixture({
                shape: new planck.Box(o.width/2/16, o.height/2/16),
                isSensor: true
            })
            body.setUserData(o.name)
            return body
        }) || []
    }

    static getEnterPoint(from: string, map: Tilemap): {x:number, y:number}{
        const enterPoint = {
            x: 0,
            y: 0
        }
        let exist = false
        let gameScale = 8
        map.layers.find(v => v.name == 'enter-point')?.objects.forEach(_o => {
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

    static getNPCs(world: planck.World, map: Tilemap): planck.Body[]{
        const npcs: planck.Body[] = []
        map.layers.find(v => v.name == 'npc')?.objects.forEach(_o => {
            const o = _o as { name: string, x: number, y: number }
            const body = world.createDynamicBody(new planck.Vec2(o.x/16, (o.y-4)/16))
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