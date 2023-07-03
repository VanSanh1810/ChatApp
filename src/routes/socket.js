const express = require('express');
const route = express.Router();
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

route.get('/', (req, res, next) => {
    res.sendStatus(200);
});

module.exports = route;
