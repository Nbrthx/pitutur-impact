import { World } from "../components/Interfaces";
import planck from "planck-js"

export class Home {

    id: number;
    world: World
    pBody: planck.Body
    itr: number;
    complete: boolean;

    constructor(world: World, x: number, y: number, id: number) {
        this.id = id
        this.world = world;

        this.pBody = world.world.createDynamicBody({
            position: new planck.Vec2(x/8/16, y/8/16+0.8),
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
    }
  
    fix(){
        if(this.itr < 3){
            this.itr++
            if(this.itr == 3){
                this.complete = true
            }
            // ;(this.scene as Game).socket.emit('home', { id: this.id, itr: this.itr })
            return true
        }
        return false
        }
  }
  