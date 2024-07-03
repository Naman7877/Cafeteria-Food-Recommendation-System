import { Socket } from 'socket.io';
import { rl } from '../../utils/readline';
import { getConnection, releaseConnection } from '../../utils/connectionManager';
import { activityTracker, authenticateUser, handleLogout, handleUserConnected, registerUser } from '../Sockets/AuthSocketHandler';


const userSockets = new Map<string, Socket>();

export const handleAuthSocketEvents = (socket: Socket) => {
    getConnection().then(connection => {
        socket.on('authenticate', data => authenticateUser(socket, connection, data, (userId, action) => activityTracker(connection, userId, action)));
        socket.on('register', data => registerUser(socket, connection, data));
        socket.on('user_connected', userId => handleUserConnected(socket, userSockets, userId));
        socket.on('logout', () => handleLogout(socket, userSockets, releaseConnection, rl, (userId, action) => activityTracker(connection, userId, action)));
    }).catch(err => {
        console.error('Error getting connection from pool:', err);
    });
};
