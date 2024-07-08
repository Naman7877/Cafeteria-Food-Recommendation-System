import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
// import { handleAdminSocketEvents } from './Services/AdminService';
import { handleEmployeeSocketEvents } from './Services/EmployeeService';
import { handleChefSocketEvents } from './Services/ChefService';
import { handleAuthSocketEvents } from './Services/AuthService';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', socket => {
    handleAuthSocketEvents(socket);
    handleAuthSocketEvents(socket);
    handleEmployeeSocketEvents(socket);
    handleChefSocketEvents(socket);
});

server.listen(3000, () => {
    console.log('Cafeteria application : run on port 3000');
});
