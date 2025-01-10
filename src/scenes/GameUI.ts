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

    textBox: Phaser.GameObjects.Container;
    blackBg: Phaser.GameObjects.Rectangle;
    inventory: Inventory;

    constructor() {
        super('GameUI');
    }

    create() {
        this.textBox = this.add.container(0, this.scale.height/4*3)
        this.textBox.setVisible(false)

        this.blackBg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
        .setOrigin(0).setAlpha(0)

        this.inventory = new Inventory(this, this.scale.width/2 - (80+10)*2.5, 960)
        
        this.inventory.addItem('item-ember')
        this.inventory.addItem('item-kayu')
        this.inventory.addItem('item-pohon')
        this.inventory.addItem('item-sekop')
        this.inventory.addItem('item-sword')
    }

    blackBgTween(key: string, callback: () => void = () => {}){
        if(key == 'none'){
            callback()
            return
        }

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
                })
            }
        })
    }

    quest(index: string, callback: (key: string) => void = () => {}){
        const questData = this.cache.json.get('quest')[index] as {
            talk: string[],
            key: string
        }

        let counter = 1
        let textBreak = 0

        const box = this.add.rectangle(0, 0, this.scale.width, this.scale.height/2, 0xffffff).setOrigin(0).setAlpha(0.8)
        const text = new TextBox(this, this.scale.width/10, 40, questData.talk[0], {
            fontSize: 70, fontFamily: 'PixelFont',
            color: '#000000'
        })

        text.onFinished = () => {
            let btnNext = new Button(this, this.scale.width-300, this.scale.height/4-100+(Math.max(textBreak, 1)-1)*60, 'Next')

            btnNext.on("pointerdown", () => {
                if(counter == questData.talk.length){
                    this.textBox.removeAll(true)
                    this.textBox.setY(this.scale.height/4*3)
                    this.textBox.setVisible(false)
                    this.blackBgTween(questData.key, () => callback(questData.key))
                }
                else{
                    text.addText(questData.talk[counter])
                    
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
                    y: this.scale.height/4*3-(textBreak-1)*60,
                    duration: 200
                })
            }
        }

        this.textBox.add([box, text])
        this.textBox.setVisible(true)
    }
}
