import { Inventory } from "../prefabs/Inventory";
import { TextBox } from "../prefabs/TextBox";

class Button extends Phaser.GameObjects.Text{
    constructor(scene: Phaser.Scene, x: number, y: number, text: string){
        super(scene, x, y, text, {
            fontFamily: 'PixelFont', fontSize: 70, color: '#666666'
        })
        scene.add.existing(this)

        this.setInteractive()
        this.on('pointerover', () => {
            this.setStyle({color: '#000000'})
        })
        this.on('pointerout', () => {
            this.setStyle({color: '#666666'})
        })
    }
}

export default class GameUI extends Phaser.Scene {

    uiScale: number = 0.5+(960/window.innerHeight*0.5)
    textBox: Phaser.GameObjects.Container;
    blackBg: Phaser.GameObjects.Rectangle;
    inventory: Inventory;
    pause: boolean
    pingText: Phaser.GameObjects.Text;

    constructor() {
        super('GameUI');
    }

    create() {
        this.textBox = this.add.container(0, this.scale.height/4*3)
        this.textBox.setVisible(false)

        this.pause = false

        this.blackBg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
        .setOrigin(0).setAlpha(0)

        this.pingText = this.add.text(100, 100, '', { fontSize: 30 }).setScrollFactor(0).setDepth(10)

        this.inventory = new Inventory(this, this.scale.width/2 - ((80+10)*2.5-10)*this.uiScale, 1080-100*this.uiScale).setScale(this.uiScale)
        
        this.inventory.addItem('item-kayu', 16)
        this.inventory.addItem('item-ember', 80)
        this.inventory.addItem('item-pohon', 16)
        this.inventory.addItem('item-sekop')
        this.inventory.addItem('item-sword')
    }

    blackBgTween(key: string, callback: () => void = () => {}){
        if(key == 'none'){
            callback()
            return
        }

        this.pause = true
        this.tweens.add({
            targets: this.blackBg,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                callback()
                this.tweens.add({
                    targets: this.blackBg,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        this.pause = false
                    }
                })
            }
        })
    }

    quest(index: string, isComplete: boolean, callback?: (key: string) => void){
        this.inventory.setVisible(false)

        const questData = this.cache.json.get('quest')[index] as {
            talk: string[],
            complete: string[],
            key: string
        }

        const talk = isComplete ? questData.complete : questData.talk

        let counter = 1
        let textBreak = 0

        const box = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff).setOrigin(0).setAlpha(0.8)
        const text = new TextBox(this, this.scale.width/10, 40, talk[0])

        text.onFinished = () => {
            let btnNext = new Button(this, this.scale.width-this.scale.width/5, this.scale.height/4-100+(Math.max(textBreak, 1)-1)*70, 'Next')
            btnNext.setOrigin(1, 0.5)

            btnNext.on("pointerdown", () => {
                if(counter == talk.length){
                    this.textBox.removeAll(true)
                    this.textBox.setY(this.scale.height/4*3)
                    this.textBox.setVisible(false)
                    this.inventory.setVisible(true)
                    callback && this.blackBgTween(questData.key, () => callback(questData.key))
                }
                else{
                    text.addText(talk[counter])
                    
                    this.textBox.remove(btnNext, true)
                    this.textBox.setY(this.scale.height/4*3)
                    textBreak = 0
                }
                counter++
            })

            this.textBox.add(btnNext)
        }

        text.onBreak = () => {
            textBreak++
            if(textBreak >= 2){
                this.tweens.add({
                    targets: this.textBox,
                    y: this.scale.height/4*3-(textBreak-1)*70,
                    duration: 200
                })
            }
        }

        this.textBox.add([box, text])
        this.textBox.setVisible(true)
    }
}
