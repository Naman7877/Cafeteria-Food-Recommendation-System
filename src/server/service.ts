// src/server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { handleAdminSocketEvents } from './controller/admin';
import { handleEmployeeSocketEvents } from './controller/employee';
import { handleChefSocketEvents } from './controller/chef';
import { handleAuthSocketEvents } from './controller/aunthectaion';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', socket => {
    handleAuthSocketEvents(socket);
    handleAdminSocketEvents(socket);
    handleEmployeeSocketEvents(socket);
    handleChefSocketEvents(socket);
});

server.listen(3000, () => {
    console.log('Cafeteria application : run on port 3000');
});
