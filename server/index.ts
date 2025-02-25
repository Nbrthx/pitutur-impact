import { Server } from 'socket.io'
// import * as sha256 from 'sha256'
// import mysql from 'mysql2'
import { createServer } from 'http'
import * as express from "express"
import { Authentication } from './components/Authentication' 
import { GameSocket } from './components/GameSocket'

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

new Authentication(app)

new GameSocket(io)

httpServer.listen(3000, () => {
    console.log('listening on *:3000')
})