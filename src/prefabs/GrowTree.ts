import { Game } from "../scenes/Game";
import planck from "planck-js"

export default class GrowTree extends Phaser.GameObjects.Sprite {

    id: number;
    planted: boolean;
    itr: number;
    complete: boolean;
    pBody: planck.Body;

    constructor(scene: Game, x: number, y: number, id: number) {
        super(scene, x, y, 'grow-tree');
        this.id = id
        this.scene = scene;
        this.scene.add.existing(this);
        this.setDepth(this.y/scene.gameScale+4)

        this.pBody = scene.world.createDynamicBody({
            position: new planck.Vec2(x/scene.gameScale/16, y/scene.gameScale/16+0.7),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Circle(new planck.Vec2(0, 0), 0.3),
            isSensor: true
        })
        this.pBody.setUserData(this)
    
        this.planted = false
        this.itr = 0
        this.complete = false
    
        if(this.planted){
            this.tint = 0xffffff
            this.alpha = 1
        }
        else{
            this.tint = 0x000000
            this.alpha = 0.5
        }
        this.setFrame(this.itr)
    }
  
    plant(){
        if(!this.planted){
            this.planted = true
            this.tint = 0xffffff
            this.alpha = 1
            return true
        }
        return false
    }
  
    grow(){
        if(this.planted){
            if(this.itr < 5){
            this.itr++
            this.setFrame(this.itr)
            if(this.itr == 5){
                this.complete = true
            }
            return true
            }
        }
        return false
    }
}
  
