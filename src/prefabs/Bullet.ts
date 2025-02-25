import { Game } from "../scenes/Game";
import planck from 'planck-js'

export class Bullet extends Phaser.GameObjects.Image {

    scene: Game;
    id: number;
    dir: planck.Vec2;
    parent: Phaser.GameObjects.Container;
    pBody: planck.Body
    knockback: number = 4;

    constructor(scene: Game, parent: Phaser.GameObjects.Container, x: number, y: number, char: string | Phaser.Textures.Texture, id: number) {
        super(scene, parent.x, parent.y, char);

        this.scene = scene
        this.parent = parent
        this.id = id
        this.dir = new planck.Vec2(x, y)

        this.pBody = scene.world.createDynamicBody({
            position: new planck.Vec2(parent.x/scene.gameScale/16, parent.y/scene.gameScale/16),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Circle(new planck.Vec2(0,0), 0.1),
            isSensor: true
        })
        this.pBody.setUserData(this)

        this.setScale(scene.gameScale)
        
        scene.add.existing(this)

        setTimeout(() => {
            this.destroy()
        }, 1500)
    }

    update() {
        if(this.dir.x != 0 || this.dir.y != 0){
            this.pBody.setLinearVelocity(this.dir)
            this.pBody.getLinearVelocity().normalize()
            this.pBody.getLinearVelocity().mul(4)

            this.x = this.pBody.getPosition().x * this.scene.gameScale * 16
            this.y = this.pBody.getPosition().y * this.scene.gameScale * 16
        }
    }

    destroy(){
        this.pBody.getWorld().queueUpdate(world => {
            world.destroyBody(this.pBody)
        })
        super.destroy()
    }
}