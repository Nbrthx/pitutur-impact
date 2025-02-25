import planck from "planck-js";
import { Game } from "../../scenes/Game";
import { Weapon } from "../Weapon";
import { Entity } from "../Entity";

export class Enemy1 extends Entity{

    weapon: Weapon;
    attackArea: planck.Body

    speed: number[] = [0.75, 0.95];
    reflectTime: number[] = [400, 200];
    cooldownTime: number[] = [1500, 1000];
    attackKnockback: number = 8;

    stateTime: number[] = [4000, 4000, 7000]
    eventState: NodeJS.Timeout;

    constructor(scene: Game, x: number, y: number){
        super(scene, x, y, 'enemy');

        this.id = 'enemy1'

        this.weapon = new Weapon(scene, this.pBody, 'axe')
        this.weapon.hitbox.destroyFixture(this.weapon.hitbox.getFixtureList() as planck.Fixture)
        this.weapon.hitbox.createFixture({
            shape: new planck.Circle(new planck.Vec2(0, 0), 10/16),
            isSensor: true
        })

        this.attackArea = scene.world.createKinematicBody();
        this.attackArea.createFixture({
            shape: new planck.Circle(new planck.Vec2(0, 0), 24/16),
            isSensor: true
        });

        this.health = this.maxHealth

        this.add([this.weapon])
    }

    attack(x: number, y: number){
        if(this.entityState == 0) return

        let rad = Math.atan2(y, x)
        this.weapon.attack(rad)
    }

    destroy(): void {
        clearInterval(this.eventState)
        this.scene.contactEvent.destroyEventByBody(this.attackArea)
        this.scene.contactEvent.destroyEventByBody(this.pBody)
        this.scene.world.queueUpdate(world => {
            world.destroyBody(this.attackArea)
            this.weapon.destroy
            world.destroyBody(this.pBody)
        })
        super.destroy()
    }
}