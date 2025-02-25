import planck from "planck-js"
import { World } from "../components/Interfaces";

export default class GrowTree {

    id: number;
    planted: boolean;
    itr: number;
    complete: boolean;
    world: World;
    pBody: planck.Body;
 
    constructor(world: World, x: number, y: number, id: number) {
        this.world = world
        this.id = id

        this.pBody = world.world.createDynamicBody({
            position: new planck.Vec2(x/8/16, y/8/16),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new planck.Circle(new planck.Vec2(0, 0.7), 0.3),
            isSensor: true
        })
        this.pBody.setUserData(this)
    
        this.planted = false
        this.itr = 0
        this.complete = false
    }
  
    plant(){
        if(!this.planted){
            this.planted = true
            return true
        }
        return false
    }
  
    grow(){
        if(this.planted){
            if(this.itr < 5){
            this.itr++
            if(this.itr == 5){
                this.complete = true
            }
            return true
            }
        }
        return false
    }
}
  
