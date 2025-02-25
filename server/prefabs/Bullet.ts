import planck from 'planck-js'
import { World } from '../components/Interfaces';

export class Bullet{

    world: World;
    id: number
    dir: planck.Vec2;
    parentBody: planck.Body;
    pBody: planck.Body
    knockback: number = 4;

    constructor(world: World, parentBody: planck.Body, x: number, y: number) {
        this.world = world
        this.id = Date.now()
        this.parentBody = parentBody
        this.dir = new planck.Vec2(x, y)

        this.pBody = world.world.createDynamicBody({
            position: new planck.Vec2(parentBody.getPosition().x, parentBody.getPosition().y),
            bullet: true,
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Circle(new planck.Vec2(0,0), 0.1),
            isSensor: true
        })
        this.pBody.setUserData(this)

        setTimeout(() => {
            this.destroy()
        }, 1500)
    }

    update() {
        if(this.dir.x != 0 || this.dir.y != 0){
            this.pBody.setLinearVelocity(this.dir)
            this.pBody.getLinearVelocity().normalize()
            this.pBody.getLinearVelocity().mul(4)
        }
    }

    destroy(){
        this.world.projectiles.splice(this.world.projectiles.indexOf(this.pBody), 1)
        this.pBody.getWorld().queueUpdate(world => {
            world.destroyBody(this.pBody)
        })
    }
}