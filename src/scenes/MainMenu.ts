import { Scene } from 'phaser';

function xhrPost(url: string, json: {}, callback: (data: any) => void){
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            callback(data)
        }
    };
    const data = JSON.stringify(json);
    xhr.send(data);
}

export class MainMenu extends Scene {

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {

        const element = this.add.dom(this.scale.width/2,this.scale.height/2).createFromCache('loginform').setName('loginform')
        element.setPerspective(800)

        const getProvider = () => {
            const anyWindow: any = window;
            const provider = anyWindow.ethereum;
            provider.enable()
            
            if (provider) {
            return provider;
            }
            else return null
        };


        let changeAction = element.getChildByID('change-action')
        let submit = element.getChildByID('submit')
        if(changeAction) changeAction.addEventListener('pointerdown', () => change())

        const change = () => {
            const name = element.name == 'loginform' ? 'registerform' : 'loginform'
            element.createFromCache(name)
            element.setName(name)
            changeAction = element.getChildByID('change-action')
            submit = element.getChildByID('submit')
            if(changeAction) changeAction.addEventListener('pointerdown', () => change())
            if(submit) submit.addEventListener('pointerdown', () => {
                if(element.name == 'loginform') getAccount(requestNonce)
                else {
                    const username = (document.getElementById('username') as HTMLInputElement).value
    
                    if(!username || username == '') return alert('Username is required')
                    getAccount(address => register(address, username))
                }
            })
        }

        if(submit) submit.addEventListener('pointerdown', () => {
            if(element.name == 'loginform') getAccount(requestNonce)
            else {
                const username = (document.getElementById('username') as HTMLInputElement).value

                getAccount(address => register(address, username))
            }
        })

        const getAccount = (callback?: (address: string) => void) => {
            const provider = getProvider()
            console.log(provider)
            try {
                provider.request({ chainId: 0x89, method: "eth_requestAccounts" })
                .then((accounts: any[]) => {
                    callback && callback(accounts[0])
                })
            }
            catch(err){
                throw err
            }
        }

        const requestNonce = (address: string) => {
            xhrPost('https://3000-idx-pitutur-impact-1734107033891.cluster-qpa6grkipzc64wfjrbr3hsdma2.cloudworkstations.dev/request-verify', { from: address }, (data: any) => {
                console.log(data)
                if(data.success) signIn(address, data.nonce)
                else alert(data.msg)
            })
        } 

        const signIn = (from: string, nonce: number) => {
            const provider = getProvider(); // see "Detecting the Provider"
            try {
                const message = 'Verify if you owner of this address, Nonce: '+nonce;
                provider.request({
                    id: 0x89,
                    method: 'personal_sign',
                    params: [message, from, 'Example password'],
                })
                .then((sign: any) => {
                    console.log(sign)
                    xhrPost('https://3000-idx-pitutur-impact-1734107033891.cluster-qpa6grkipzc64wfjrbr3hsdma2.cloudworkstations.dev/verify', { from, sign }, (data: any) => {
                        console.log(data)
                        if(data.success) this.scene.start('Game');
                        else alert(data.msg);
                    })
                })
            } catch (err) {
                throw err
            }
        }

        const register = (address: string, username: string) => {
            const provider = getProvider(); // see "Detecting the Provider"
            try {
                const message = 'Verify if you want to make this account, Username: '+username
                provider.request({
                    id: 0x89,
                    method: 'personal_sign',
                    params: [message, address, 'Example password'],
                })
                .then((signature: any) => {
                    console.log(signature)
                    xhrPost('https://3000-idx-pitutur-impact-1734107033891.cluster-qpa6grkipzc64wfjrbr3hsdma2.cloudworkstations.dev/register', { username, address, signature }, (data: any) => {
                        console.log(data)
                        if(data.success) this.scene.start('Game');
                        else alert(data.msg);
                    })
                })
            } catch (err) {
                throw err
            }
        }
    }
}
