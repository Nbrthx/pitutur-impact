import planck from "planck-js"
import { World } from "../components/Interfaces";

export class Entity{

    world: World;
    id: string
    pBody: planck.Body;

    dir: planck.Vec2 = new planck.Vec2();
    attackDir: planck.Vec2 = new planck.Vec2();
    maxHealth: number = 100;
    health: number;
    damaged: boolean
    entityState: number;
    isAlive = true

    constructor(world: World, x: number, y: number){
        this.world = world

        this.pBody = world.world.createDynamicBody({
            position: new planck.Vec2(x/8/16, y/8/16),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Box(0.4, 0.3, new planck.Vec2(0, 0)),
            filterCategoryBits: 2,
            filterMaskBits: 1,
        })
        this.pBody.setUserData(this)
        
        this.health = this.maxHealth
    }

    attack(x: number, y: number){ x; y; }

    update(){}

    destroy(): void {
        this.world.contactEvent.destroyEventByBody(this.pBody)
        this.pBody.getWorld().queueUpdate(world => {
            world.destroyBody(this.pBody)
        })
    }
}