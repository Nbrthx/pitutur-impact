import { Game } from "../scenes/Game";
import planck from "planck-js"

export class Home extends Phaser.GameObjects.Sprite {

    id: number;
    pBody: planck.Body
    itr: number;
    complete: boolean;

    constructor(scene: Game, x: number, y: number, id: number) {
        super(scene, x, y, 'dynamic-home');
        this.id = id
        this.scene = scene;
        this.scene.add.existing(this);
        this.setSize(40, 40)
        this.setDepth(this.y/scene.gameScale+11)

        this.pBody = scene.world.createDynamicBody({
            position: new planck.Vec2(x/scene.gameScale/16, y/scene.gameScale/16+0.8),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Box(36/2/16, 10/2/16),
            density: 10**50
        })
        this.pBody.createFixture({
            shape: new planck.Box(36/2/16, 6/2/16, new planck.Vec2(0, 20/2/16)),
            isSensor: true
        })
        this.pBody.setUserData(this)
    
        this.itr = 0
        this.complete = false

        this.setFrame(this.itr)
    }
  
    fix(){
        if(this.itr < 3){
            this.itr++
            this.setFrame(this.itr)
            if(this.itr == 3){
                this.complete = true
            }
            // ;(this.scene as Game).socket.emit('home', { id: this.id, itr: this.itr })
            return true
        }
        return false
        }
  }
  