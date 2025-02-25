import { Server, Socket } from "socket.io";
import planck from "planck-js"
import * as fs from "fs"
import { MapSetup } from "./MapSetup";
import { Player } from "../prefabs/Player";
import { ContactEvents } from "./ContactEvents";
import { World, Tilemap, Input } from "./Interfaces";
import { MapCustom } from "./MapCustom";
import { Bullet } from "../prefabs/Bullet";

export class GameSocket{

    io: Server;
    worlds: World[];
    maps: Map<string, Tilemap>
    interval: NodeJS.Timeout

    players: Player[]

    constructor(io: Server){

        this.io = io;
        this.worlds = []
        this.maps = new Map<string, Tilemap>()

        ;['lobby', 'hamemayu', 'hutan', 'eling', 'kolam', 'rukun', 'rumah'].forEach(i => {
            this.maps.set(i, JSON.parse(fs.readFileSync(__dirname+'/../tilemap/map-'+i+'.json', {encoding: 'utf8'})))
        })

        io.on('connection', this.connection.bind(this))

        this.players = []
        
        for(let [name, map] of this.maps){
            if(['kolam', 'hutan', 'rumah'].includes(name)) continue
            this.createWorld(name, map)
        }

        this.interval = setInterval(() => {
            this.gameUpdate()

            this.playerUpdate()
        }, 1000/60)
    }

    destroy(){
        clearInterval(this.interval)
    }

    createWorld(name: string, map: Tilemap, isSingle: boolean = false){
        const pWorld = new planck.World()

        MapSetup.getObjects(pWorld, map)

        const contactEvent = new ContactEvents(pWorld)

        const world = {
            name: name,
            world: pWorld,
            playerBodys: [],
            projectiles: [],
            enemys: [],
            contactEvent: contactEvent,
            map: map,
            isSingle: isSingle
        }
        this.worlds.push(world)

        this.createBounds(pWorld, map.width, map.height)

        return world
    }

    createBounds(pWorld: planck.World, width: number, height: number){
        const walls = [
            { pos: new planck.Vec2(width/2, -0.5), size: new planck.Vec2(width, 1) },  // top
            { pos: new planck.Vec2(-0.5, height/2), size: new planck.Vec2(1, height) },   // left
            { pos: new planck.Vec2(width+0.5, height/2), size: new planck.Vec2(1, height) },  // right
            { pos: new planck.Vec2(width/2, height+0.5), size: new planck.Vec2(width, 1) },   // bottom
        ];

        walls.forEach(wall => {
            const body = pWorld.createBody(wall.pos);
            body.createFixture(new planck.Box(wall.size.x / 2, wall.size.y / 2));
        });
    };

    gameUpdate(){
        for(let world of this.worlds){
            world.world.step(1/20)

            const playerInMap = this.players.filter(v => v.world.name == world.name)
            const players = playerInMap.map(v => {
                let pos = v.pBody.getPosition()
                let vel = v.pBody.getLinearVelocity()
                const playerState = {
                    id: v.id,
                    x: pos.x,
                    y: pos.y,
                    dir: {
                        x: vel.x,
                        y: vel.y
                    },
                    attackDir: {
                        x: v.attackDir.x,
                        y: v.attackDir.y
                    },
                    health: v.health,
                    ping: v.ping,
                    timestamp: v.timestamp,
                    world: v.world.name
                }
                if(v.attackDir.length() > 0) v.attackDir.set(0, 0)
                return playerState
            })

            const enemys = world.enemys.map(v => {
                v.update()
                const entityState = {
                    id: v.id,
                    x: v.pBody.getPosition().x,
                    y: v.pBody.getPosition().y,
                    state: v.entityState,
                    dir: {
                        x: v.dir.x,
                        y: v.dir.y
                    },
                    attackDir: {
                        x: v.attackDir.x,
                        y: v.attackDir.y
                    },
                    health: v.health
                }
                if(v.attackDir.length() > 0) v.attackDir.set(0, 0)
                return entityState
            })

            const projectiles = world.projectiles.map(v => {
                const bullet = v.getUserData() as Bullet
                // console.log(bullet.pBody.getPosition())
                return {
                    id: bullet.id,
                    parentId: (bullet.parentBody.getUserData() as { id: string }).id,
                    x: bullet.pBody.getPosition().x,
                    y: bullet.pBody.getPosition().y,
                    dir: {
                        x: bullet.dir.x,
                        y: bullet.dir.y
                    }
                }
            })

            const gameState = {
                players: players,
                enemys: enemys,
                projectiles: projectiles
            }

            this.io.to(world.name).emit('update', gameState)
        }
    }

    playerUpdate(){
        for(let player of this.players){

            let now = Date.now()+100
            
            if(player.input[0]?.timestamp > now) continue

            let input = player.input.shift() || {
                dir: new planck.Vec2(0, 0),
                attackDir: new planck.Vec2(0, 0),
                timestamp: now
            }

            player.timestamp = input.timestamp

            player.update(input)
        }
    }

    connection(socket: Socket){
        console.log('a user connected')

        socket.on('join', (key: string) => {
            const world = this.worlds.find(v => v.name == key)

            if(['kolam', 'hutan'].includes(key)){
                const newWorld = this.createWorld(key+'-'+socket.id, this.maps.get(key) as Tilemap, true)
                
                const playerExist = this.players.find(v => v.id == socket.id)
                let from = 'start'
                if(playerExist){
                    this.players = this.players.filter(v => v.id != socket.id)

                    playerExist.destroy()
                    
                    from = playerExist.world.name
                    socket.broadcast.emit('left', socket.id)

                    playerExist.world.enemys.forEach(v => {
                        v.destroy()
                    })
                    if(playerExist.world.isSingle) this.worlds.splice(this.worlds.indexOf(playerExist.world), 1)
                }

                const newPlayer = new Player(socket, newWorld, from)
                
                this.players.push(newPlayer)
                
                new MapCustom(newWorld, newPlayer, key)
            }
            else if(world){
                const playerExist = this.players.find(v => v.id == socket.id)
                let from = 'start'
                if(playerExist){
                    this.players = this.players.filter(v => v.id != socket.id)

                    playerExist.destroy()
                    
                    from = playerExist.world.name
                    socket.broadcast.emit('left', socket.id)

                    playerExist.world.enemys.forEach(v => {
                        v.destroy()
                    })
                    if(playerExist.world.isSingle) this.worlds.splice(this.worlds.indexOf(playerExist.world), 1)
                }

                const newPlayer = new Player(socket, world, from)
                
                this.players.push(newPlayer)
                world.playerBodys.push(newPlayer.pBody)

                world.contactEvent.addEvent(world.playerBodys, newPlayer.weapon.hitbox, (_player) => {
                    const player = _player.getUserData() as Player
                    if(player.id != newPlayer.id){
                        console.log(player.id+' attacked')
                        player.health -= 5
                    }
                })
            }
        })

        socket.on('input', (input: Input, ping: number) => {
            const player = this.players.find(v => v.id == socket.id)
            if(player?.input) player.input.push(input)
            if(player) player.ping = ping
        })

        socket.on('disconnect', () => {
            const player = this.players.find(v => v.id == socket.id)
            
            player?.world.enemys.forEach(v => {
                v.destroy()
            })
            if(player?.world.isSingle) this.worlds.splice(this.worlds.indexOf(player.world), 1)

            player?.pBody?.getWorld().destroyBody(player.pBody)
            this.players = this.players.filter(v => v.id != socket.id)
            this.io.emit('left', socket.id)
            console.log('user disconnected')
        })
    }
}