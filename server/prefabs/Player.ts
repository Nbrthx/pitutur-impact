import planck from "planck-js"
import { Socket } from "socket.io"
import { MapSetup } from "../components/MapSetup"
import { Weapon } from "./Weapon"
import { ContactEvents } from "../components/ContactEvents"
import { Input, World } from "../components/Interfaces"

export class Player{

    socket: Socket
    id: string
    input: {
        dir?: planck.Vec2
        attackDir?: planck.Vec2
        timestamp: number
    }[]
    contactEvent: ContactEvents
    world: World
    pBody: planck.Body
    weapon: Weapon
    attackDir = new planck.Vec2(0, 0)
    
    health: number

    ping: number
    timestamp: number
    inputEvents: ((input: Input) => void)[]
 
    constructor(socket: Socket, world: World, from: string){
        this.socket = socket
        this.id = socket.id
        this.input = []
        this.inputEvents = []
        this.health = 100

        let enterPoint = MapSetup.getEnterPoint(from, world.map)

        socket.leave(from)
        socket.join(world.name)
        this.world = world
        this.contactEvent = world.contactEvent

        this.pBody = world.world.createDynamicBody({
            position: new planck.Vec2(enterPoint.x/8/16, enterPoint.y/8/16),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Box(0.4, 0.3, new planck.Vec2(0, 0.2)),
            filterCategoryBits: 2,
            filterMaskBits: 1,
        })
        this.pBody.setUserData(this)

        this.weapon = new Weapon(world, this.pBody)

        socket.emit('join')
    }

    update(input: Input){
        const vel = new planck.Vec2(input.dir || new planck.Vec2(0, 0))
        this.attackDir = new planck.Vec2(input.attackDir || new planck.Vec2(0, 0))
        this.attackDir.normalize()

        vel.normalize();
        vel.mul(1.5);
        this.pBody.setLinearVelocity(vel)

        if(this.attackDir.length() > 0){
            let rad = Math.atan2(this.attackDir.y, this.attackDir.x)
            if(input.item == 4) this.weapon.attack(rad)
        }

        this.inputEvents.forEach(v => {
            v(input)
        })

        // if(player.knockback > 0){
        //     player.pBody.setLinearVelocity(player.knockbackDir)
        //     player.pBody.getLinearVelocity().normalize()
        //     player.pBody.getLinearVelocity().mul(player.knockback)
        //     player.knockback = Math.floor(player.knockback*150/4)/50
        // }
        // else 
    }

    destroy(){
        this.weapon.destroy()
        this.pBody.getWorld().destroyBody(this.pBody)
    }
}

