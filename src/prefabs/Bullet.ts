export class Bullet extends Phaser.Physics.Arcade.Image {

    scene: Phaser.Scene;
    dir: Phaser.Math.Vector2;
    parent: Phaser.GameObjects.Container;
    knockback: number = 400;

    constructor(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, x: number, y: number, char: string | Phaser.Textures.Texture) {
        super(scene, parent.x, parent.y, char);

        this.scene = scene
        this.parent = parent
        this.dir = new Phaser.Math.Vector2(x, y)

        this.setScale(7)
        
        scene.add.existing(this)

        setTimeout(() => {
            this.destroy()
        }, 1500)
    }

    update() {
        if(this.dir.x != 0 || this.dir.y != 0){
            this.setVelocity(this.dir.x, this.dir.y)
            this.body?.velocity.normalize().scale(180*7)
        }
    }
}