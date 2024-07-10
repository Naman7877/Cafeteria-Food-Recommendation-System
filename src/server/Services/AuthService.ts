import { Socket } from 'socket.io';
import { rl } from '../../utils/readline';
import {
    getConnection,
    releaseConnection,
} from '../../utils/connectionManager';
import { AuthRepository, UserConnectionManager } from '../Repository/AuthRepository';

export const handleAuthSocketEvents = (socket: Socket) => {
    getConnection()
        .then(connection => {
            const authRepository = new AuthRepository(connection);
            const userConnectionManager = new UserConnectionManager();

            socket.on('authenticate', data =>
                authRepository.authenticateUser(socket, data, (userId, action) =>
                    authRepository.activityTracker(userId, action),
                ),
            );

            socket.on('register', data =>
                authRepository.registerUser(socket, data),
            );

            socket.on('user_connected', userId =>
                userConnectionManager.handleUserConnected(socket, userId),
            );

            socket.on('logout', () =>
                userConnectionManager.handleLogout(
                    socket,
                    releaseConnection,
                    rl,
                    (userId, action) =>
                        authRepository.activityTracker(userId, action),
                ),
            );
        })
        .catch(err => {
            console.error('Error getting connection from pool:', err);
        });
};
