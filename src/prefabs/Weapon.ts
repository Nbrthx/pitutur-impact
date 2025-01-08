export class Weapon extends Phaser.GameObjects.Container{

    image: Phaser.GameObjects.Sprite;
    hitbox: Phaser.Physics.Arcade.Body;
    attackState: boolean;

    constructor(scene: Phaser.Scene){
        super(scene);
        scene.add.existing(this);
        
        this.attackState = false

        this.image = scene.add.sprite(6, 0, 'sword')
        this.image.setVisible(false)
        
        const zone = scene.add.zone(12, 2, 16, 16).setName('sword')
        scene.physics.world.enable(zone)

        this.hitbox = zone.body as Phaser.Physics.Arcade.Body;

        this.hitbox.setCircle(14, -6, -6)
        this.hitbox.setImmovable(true)
        this.hitbox.setEnable(false)

        this.add([this.image, zone])
    }

    attack(rad: number){
        if(this.image.visible) return

        this.image.setFlipY(this.attackState)
        this.attackState = !this.attackState

        this.image.play('attack')
        this.image.setVisible(true)
        this.setRotation(rad)

        let enable = false
        this.image.on('animationupdate', (_animation: any, frame: Phaser.Animations.AnimationFrame) => {
            if(frame.index == 2 && !enable){
                console.log('attack')
                enable = true
                this.hitbox.setEnable(true) 
            }
            else this.hitbox.setEnable(false)
        })

        this.image.once('animationcomplete', () => {
            this.image.setVisible(false)
        })
    }
}