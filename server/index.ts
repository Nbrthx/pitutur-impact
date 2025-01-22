import { Server } from 'socket.io'
import * as sha256 from 'sha256'
// import mysql from 'mysql2'
import { createServer } from 'http'
import * as express from "express"

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
    password: string
    xp: number
    head: string[]
    outfit: string[]
    inventory: [number, number, number]
}[] = []

app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const hashedPassword = sha256(password)

    const account = accounts.find(account => account.username === username && account.password === hashedPassword)

    if (account) {
        res.json({ success: true, account })
    } else {
        res.json({ success: false })
    }
})

app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const hashedPassword = sha256(password)

    const account = accounts.find(account => account.username === username)

    if (account) {
        res.json({ success: false })
    } else {
        accounts.push({
            username,
            password: hashedPassword,
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