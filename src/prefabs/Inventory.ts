export class Inventory extends Phaser.GameObjects.Container {

    private maxItems: number;
    private itemSpacing: number = 10;

    private items: Phaser.GameObjects.Image[] = [];
    private itemQuantities: Phaser.GameObjects.Text[] = [];
    private slots: Phaser.GameObjects.Rectangle[] = [];

    private selectedSlotIndex: number = 4;

    constructor(scene: Phaser.Scene, x: number, y: number, maxItems: number = 5) {
        super(scene, x, y);
        this.maxItems = maxItems;
        scene.add.existing(this);
        this.createInventorySlots();
    }

    private createInventorySlots() {
        for (let i = 0; i < this.maxItems; i++) {
            const slot = this.scene.add.rectangle(i * (80 + this.itemSpacing), 0, 80, 80, 0x000000, 0.5);
            slot.setOrigin(0, 0);
            slot.setStrokeStyle(2, 0xffffff);
            slot.setInteractive();
            slot.on('pointerdown', () => {
                this.selectSlot(i);
            });
            this.add(slot);
            this.slots.push(slot);
        }
        this.selectSlot(this.selectedSlotIndex)
    }

    private selectSlot(index: number) {
        if (this.selectedSlotIndex !== null) {
            this.slots[this.selectedSlotIndex].setStrokeStyle(2, 0xffffff);
        }
        this.selectedSlotIndex = index;
        this.slots[index].setStrokeStyle(4, 0xffff00);
    }

    addItem(texture: string, quantity: number = 1) {
        if(this.items.find(v => v.texture.key == texture)){
            const index = this.items.findIndex(v => v.texture.key == texture);
            const quantityText = this.itemQuantities[index];
            const currentQuantity = parseInt(quantityText.text.split('x')[1]);
            quantityText.setText(`x${currentQuantity + quantity}`);
            return
        }
        else if (this.items.length < this.maxItems) {
            const index = this.items.length;
            const item = this.scene.add.image(index * (80 + this.itemSpacing) + 40, 40, texture).setScale(4);
            item.setOrigin(0.5, 0.5);
            this.add(item);
            this.items.push(item);

            if(['item-sword','item-sekop'].includes(texture)) return
            const quantityText = this.scene.add.text(index * (80 + this.itemSpacing) + 80, 80, `x${quantity}`, { color: '#fff', fontSize: 16 });
            quantityText.setOrigin(1, 1);
            this.add(quantityText);
            this.itemQuantities.push(quantityText);
        }
    }

    getSelectedIndex(): number {
        return this.selectedSlotIndex
    }

    useItem(index: number) {
        const quantityText = this.itemQuantities[index];
        const currentQuantity = parseInt(quantityText.text.split('x')[1]);
        if(currentQuantity > 0){
            quantityText.setText(`x${currentQuantity - 1}`);
            return true
        }
        else return false
    }
}
