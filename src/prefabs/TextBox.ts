export class TextBox extends Phaser.GameObjects.Text {
    private _counter: number = 0;
    private _textToWrite: string = "";
    private _arrayOfWords: string[] = [];
    private _wordIndex: number = 0;
    private _textSpeed: number = 30;
    private _timer: Phaser.Time.TimerEvent;
    public onFinished: () => void;
    public onBreak: () => void;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y, "", style);
        this.setOrigin(0, 0);
        this._textToWrite = text;
        this._arrayOfWords = text.split(" ");
        console.log(this._arrayOfWords)
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

        if(this._textToWrite[this._counter] == ' '){
            this._wordIndex++;
            let text = ''
            this._arrayOfWords.slice(0, this._wordIndex).forEach(v => text += v + " ")
            if(text.length > 50){
                this._arrayOfWords.splice(0, this._wordIndex)
                this.setText(this.text+'\n')
                this._wordIndex = 0
                this._counter++
                this.onBreak()
            }
        }

        if(this._textToWrite[this._counter] == '\n'){
            this._arrayOfWords.splice(0, this._wordIndex)
            this._wordIndex = 0
            this.onBreak()
        }

        if (this._counter >= this._textToWrite.length) {
            this._timer.remove();
            this.onFinished()
        }
    }

    public addText(text: string){
        this.resetCounter()
        this._wordIndex = 0
        this.setText('')
        this._textToWrite = text;
        this._arrayOfWords = text.split(" ");
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
