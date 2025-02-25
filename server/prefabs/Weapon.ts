import planck from "planck-js"
import { World } from "../components/Interfaces";

export class Weapon{

    world: World
    parent: planck.Body
    hitbox: planck.Body;
    isAttack: boolean = false

    constructor(world: World, parent: planck.Body){
        this.parent = parent
        this.world = world

        this.hitbox = world.world.createKinematicBody();
        this.hitbox.createFixture({
            shape: new planck.Circle(new planck.Vec2(0, 0), 14/16),
            isSensor: true
        });
        this.hitbox.setActive(false); // Nonaktifkan awal
    }

    attack(rad: number){
        if(this.isAttack) return false
        this.isAttack = true

        setTimeout(() => {
            this.hitbox.setPosition(
                new planck.Vec2(
                    (this.parent.getPosition().x + Math.cos(rad) * 0.75),
                    (this.parent.getPosition().y + Math.sin(rad) * 0.75)
                )
            );
            this.hitbox.setActive(true) 
            setTimeout(() => this.hitbox.setActive(false), 1000/30)
        }, 1000/30*4)

        setTimeout(() => {
            this.isAttack = false
        }, 400)

        return true
    }

    destroy(){
        this.world.contactEvent.destroyEventByBody(this.hitbox)
        this.hitbox.getWorld().queueUpdate(world => {
            world.destroyBody(this.hitbox)
        })
    }
}

