import planck from "planck-js"
import { ContactEvents } from "./ContactEvents"
import { Enemy0 } from "../prefabs/Enemys/Enemy0"
import { Enemy1 } from "../prefabs/Enemys/Enemy1"
import { Entity } from "../prefabs/Entity"

export interface Tilemap{
    width: number
    height: number
    layers: {
        name: string
        objects: {
            name: string
            x: number
            y: number
            width: number
            height: number
        }[]
    }[]
}

export interface World{
    name: string,
    world: planck.World
    playerBodys: planck.Body[]
    projectiles: planck.Body[]
    enemys: Entity[]
    contactEvent: ContactEvents
    map: Tilemap
    isSingle?: boolean
}

export interface Input{
    dir?: planck.Vec2,
    attackDir?: planck.Vec2,
    item?: number,
    timestamp: number
}