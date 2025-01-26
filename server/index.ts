import { Server } from 'socket.io'
// import * as sha256 from 'sha256'
// import mysql from 'mysql2'
import { createServer } from 'http'
import * as express from "express"
import { ethers } from 'ethers'

const app = express()
const httpServer = createServer(app)
var htmlPath = __dirname+'/dist';
app.use(express.static(htmlPath));

const io = new Server(httpServer)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// app.get('/', (_req, res) => {
//     res.sendFile(htmlPath + '/index.html')
// })

const accounts: {
    username: string
    address: string
    nonce: number
    xp: number
    head: string[]
    outfit: string[]
    inventory: [number, number, number]
}[] = []

app.post('/request-verify', (req, res) => {
    const from = req.body.from
    const account = accounts.find(account => account.address === from)

    if(!from){
        res.json({success:false, msg:"Missing from"})
        return
    }
    if(!ethers.isAddress(from)){
        res.json({success:false, msg:"Invalid from address"})
        return
    }
    if(!account){
        res.json({success:false, msg:"Account not found"})
        return
    }

    res.json({success:true, nonce: account.nonce})
})

app.post('/verify', (req, res) => {
    const from = req.body.from
    const sign = req.body.sign
    
    const account = accounts.find(account => account.address === from)

    if(!from || !sign){
        res.json({success:false, msg:"Missing from or sign"})
        return
    }
    if(!ethers.isAddress(from)){
        res.json({success:false, msg:"Invalid from address"})
        return
    }
    if(!ethers.isHexString(sign)){
        res.json({success:false, msg:"Invalid signature"})
        return
    }
    if(!account){
        res.json({success:false, msg:"Account not found"})
        return
    }

    try {
        const message = 'Verify if you owner of this address, Nonce: '+account.nonce
        const address = ethers.verifyMessage(message, sign)
        if(address.toLowerCase() === from.toLowerCase()){
            res.json({success:true})
            account.nonce++
        } else {
            res.json({success:false})
        }
    } catch (error) {
        res.json({ success:false, msg:"Error while verify signature" })
    }
    
})

app.post('/register', (req, res) => {
    const username = req.body.username || ''
    const address = req.body.address
    const signature = req.body.signature

    const account = accounts.find(account => account.username === username)

    if(!address || !signature){
        res.json({success:false, msg:"Missing from or sign"})
        return
    }
    if(!ethers.isAddress(address)){
        res.json({success:false, msg:"Invalid from address"})
        return
    }
    if(!ethers.isHexString(signature)){
        res.json({success:false, msg:"Invalid signature"})
        return
    }
    if(account){
        res.json({success:false, msg:"Username already exists"})
        return
    }
    if(username.length < 3){
        res.json({success:false, msg:"Username must be at least 3 characters"})
        return
    }

    const message = 'Verify if you want to make this account, Username: '+username
    const signAddress = ethers.verifyMessage(message, signature)

    if(address.toLowerCase() !== signAddress.toLowerCase()){
        res.json({success:false, msg:"Invalid signature"})
        return
    }
    else {
        accounts.push({
            username: username,
            address: address,
            nonce: 0,
            xp: 0,
            head: ['basic', 'women', 'blue', 'green'],
            outfit: ['basic', 'blue', 'green'],
            inventory: [0, 0, 0]
        })
        res.json({ success: true, account: accounts[accounts.length - 1] })
    }
})

io.on('connection', (socket) => {
    console.log('a user connected')
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})

httpServer.listen(3000, () => {
    console.log('listening on *:3000')
})