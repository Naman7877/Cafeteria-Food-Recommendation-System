import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
// import { handleAdminSocketEvents } from './Services/AdminService';
import { handleAuthSocketEvents } from './Services/AuthService';
import { handleAdminSocketEvents } from './Services/AdminService';
import { handChefSocketEvents } from './Services/ChefService';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import handleEmployeeServices from './Services/EmployeeService';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', socket => {
    handleAuthSocketEvents(socket);
    handleAdminSocketEvents(socket);
    handleEmployeeServices(socket);
    handChefSocketEvents(socket);
});

server.listen(3000, () => {
    console.log('Cafeteria application : run on port 3000');
});

