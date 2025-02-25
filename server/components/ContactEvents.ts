import planck from 'planck-js'

interface ContactEvent{
    bodyA: planck.Body | planck.Body[]
    bodyB: planck.Body | planck.Body[]
    callback: (bodyA: planck.Body, bodyB: planck.Body) => void
}

export class ContactEvents{

    events: ContactEvent[]

    constructor(pWorld: planck.World){
        this.events = []

        pWorld.on('begin-contact', (contact: planck.Contact) => {
            const bodyA = contact.getFixtureA().getBody();
            const bodyB = contact.getFixtureB().getBody();
            
            for(let event of this.events){
                const equationAA = event.bodyA instanceof Array ? event.bodyA.includes(bodyA) : bodyA === event.bodyA
                const equationAB = event.bodyA instanceof Array ? event.bodyA.includes(bodyB) : bodyB === event.bodyA
                const equationBA = event.bodyB instanceof Array ? event.bodyB.includes(bodyA) : bodyA === event.bodyB
                const equationBB = event.bodyB instanceof Array ? event.bodyB.includes(bodyB) : bodyB === event.bodyB

                if ((equationAA || equationAB) &&
                (equationBA || equationBB)){
                    const A = equationAA ? bodyA : bodyB
                    const B = equationAA ? bodyB : bodyA
                    event.callback(A, B);
                }
            }
        })
    }

    addEvent(bodyA: planck.Body | planck.Body[], bodyB: planck.Body | planck.Body[], callback: (bodyA: planck.Body, bodyB: planck.Body) => void){
        this.events.push({
            bodyA,
            bodyB,
            callback
        })
    }

    destroyEventByBody(body: planck.Body){
        this.events = this.events.filter(event => {
            const equationAA = event.bodyA instanceof Array ? event.bodyA.includes(body) : body === event.bodyA
            const equationAB = event.bodyB instanceof Array ? event.bodyB.includes(body) : body === event.bodyB
            return !(equationAA || equationAB)
        })
    }
}