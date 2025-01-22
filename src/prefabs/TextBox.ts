export class TextBox extends Phaser.GameObjects.Text {
    private _counter: number = 0;
    private _textToWrite: string = "";
    private _wrapCount: number = 1
    private _textSpeed: number = 20;
    private _timer: Phaser.Time.TimerEvent;
    public onFinished: () => void;
    public onBreak: () => void;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
        super(scene, x, y, "", {
            fontSize: 70, fontFamily: 'PixelFont',
            color: '#000000',
            wordWrap: {
                width: scene.scale.width-scene.scale.width/5,
                useAdvancedWrap: true
            }
        });
        this.setOrigin(0, 0);
        this._textToWrite = text;
        this._timer = this.scene.time.addEvent({
            delay: this._textSpeed,
            callback: this.typeWriter,
            callbackScope: this,
            loop: true,
        });
        this.scene.add.existing(this);
    }

    private typeWriter() {
        this.setText(this.text + this._textToWrite[this._counter]);
        this._counter++;

        if(this.getWrappedText().length > this._wrapCount){
            this._wrapCount++
            this.onBreak()
        }

        if (this._counter >= this._textToWrite.length) {
            this._timer.remove();
            this.onFinished()
        }
    }

    public addText(text: string){
        this.resetCounter()
        this.setText('')
        this._wrapCount = 1
        this._textToWrite = text;
        this._timer = this.scene.time.addEvent({
            delay: this._textSpeed,
            callback: this.typeWriter,
            callbackScope: this,
            loop: true,
        });
    }

    public resetCounter(){
        this._counter = 0
    }
    public stopText(){
        this._timer.remove()
    }
  
}
