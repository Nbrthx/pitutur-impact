import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.title = this.add.text(this.scale.width/2, 540, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 60, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const element = this.add.dom(this.scale.width/2,this.scale.height/2).createFromCache('loginform')
        element.setPerspective(800)
        
        element.addListener('submit')
        element.on('submit', (event: Event) => {
            event.preventDefault();
            const username = (document.getElementById('username') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            console.log('username:', username)
            console.log('password:', password)

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://3000-idx-pitutur-impact-1734107033891.cluster-qpa6grkipzc64wfjrbr3hsdma2.cloudworkstations.dev/login', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    console.log(data);
                    if(data.success) this.scene.start('Game');
                    else alert('Wrong username or password');
                }
            };
            const data = JSON.stringify({ username, password });
            xhr.send(data);

        });

        const getProvider = () => {
            if ('phantom' in window) {
              const anyWindow: any = window;
              const provider = anyWindow.phantom?.ethereum;
             
              if (provider) {
                return provider;
              }
            }
        };

        // const provider = getProvider(); // see "Detecting the Provider"
        // try {
        //     provider.request({ method: "eth_requestAccounts" })
        //     .then((accounts: any) => {
        //         console.log(accounts[0]);
        //         const message = 'To avoid digital dognappers, sign below to authenticate with CryptoCorgis.';
        //         const from = accounts[0];
        //         console.log(message)
        //         provider.request({
        //             method: 'personal_sign',
        //             params: [message, from, 'Example password'],
        //         })
        //         .then((sign: any) => {
        //             console.log(sign)
        //         })
        //     })
        //     // 0x534583cd8cE0ac1af4Ce01Ae4f294d52b4Cd305F
        // } catch (err) {
        //     throw err
        //     // { code: 4001, message: 'User rejected the request.' }
        // }
    }
}
