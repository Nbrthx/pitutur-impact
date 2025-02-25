import { Game } from "../../scenes/Game";
import { Bullet } from "../Bullet";
import { Entity } from "../Entity";

export class Enemy0 extends Entity{

    weapon: Phaser.GameObjects.Image;

    constructor(scene: Game, x: number, y: number){
        super(scene, x, y, 'enemy2');

        this.id = 'enemy0'
        this.nameText.setText('Perusak Air Tanah')

        this.weapon = this.scene.add.image(0, 0, 'ketapel')
        this.weapon.setOrigin(0.5, 0.5)
    }

    attack(x: number, y: number){
        if(this.entityState == 1) return

        this.scene.sound.play('shot', { volume: 0.5 })

        this.weapon.rotation = Phaser.Math.Angle.Between(this.x, this.y, x, y)
        let dirX = Math.cos(this.weapon.rotation)
        let dirY = Math.sin(this.weapon.rotation)

        this.weapon.x = dirX*this.scene.gameScale
        this.weapon.y = dirY*this.scene.gameScale

        if(dirX < 0) this.weapon.flipY = true;
        else this.weapon.flipY = false;

        const bullet = new Bullet(this.scene, this, dirX, dirY, 'bullet', Date.now())

        this.scene.projectiles.push(bullet.pBody)
    }

    destroy(): void {
        this.scene.contactEvent.destroyEventByBody(this.pBody)
        this.scene.world.queueUpdate(world => {
            world.destroyBody(this.pBody)
        })
        super.destroy()
    }
}